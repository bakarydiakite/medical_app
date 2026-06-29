import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './appointments.dto';

/** Relations systématiquement incluses dans les requêtes appointment */
const APPOINTMENT_INCLUDE = {
  doctor: { include: { specialty: true, center: true } },
  user:   { select: { id: true, name: true, email: true } },
} as const;

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: number, userRole: string) {
    // Un admin voit tous les rendez-vous ; un patient uniquement les siens
    const where = userRole === 'ADMIN' ? {} : { userId };

    return this.prisma.appointment.findMany({
      where,
      include: APPOINTMENT_INCLUDE,
      orderBy: { dateTime: 'desc' },
    });
  }

  async findOne(id: number, userId: number, userRole: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: APPOINTMENT_INCLUDE,
    });

    if (!appointment) throw new NotFoundException(`Rendez-vous #${id} introuvable`);

    if (userRole !== 'ADMIN' && appointment.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé');
    }

    return appointment;
  }

  async create(userId: number, dto: CreateAppointmentDto) {
    const dateTime   = new Date(dto.dateTime);
    const startOfDay = new Date(dateTime);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(dateTime);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Règle métier 1 : le médecin ne doit pas être absent ce jour-là
    const absence = await this.prisma.absence.findFirst({
      where: {
        doctorId:  dto.doctorId,
        startDate: { lte: endOfDay },
        endDate:   { gte: startOfDay },
      },
    });

    if (absence) {
      throw new BadRequestException('Le médecin est absent à cette date');
    }

    // Règle métier 2 : le créneau horaire doit être libre (hors rendez-vous annulés)
    const conflict = await this.prisma.appointment.findFirst({
      where: {
        doctorId: dto.doctorId,
        dateTime,
        status: { not: 'CANCELLED' },
      },
    });

    if (conflict) throw new ConflictException('Ce créneau est déjà pris');

    return this.prisma.appointment.create({
      data: { dateTime, doctorId: dto.doctorId, userId },
      include: APPOINTMENT_INCLUDE,
    });
  }

  async confirm(id: number) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });

    if (!appointment) throw new NotFoundException(`Rendez-vous #${id} introuvable`);

    if (appointment.status !== 'PENDING') {
      throw new BadRequestException('Seuls les rendez-vous en attente peuvent être confirmés');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: APPOINTMENT_INCLUDE,
    });
  }

  async cancel(id: number, userId: number, userRole: string) {
    const appointment = await this.findOne(id, userId, userRole);

    if (appointment.status === 'CANCELLED') {
      throw new BadRequestException('Ce rendez-vous est déjà annulé');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: APPOINTMENT_INCLUDE,
    });
  }
}
