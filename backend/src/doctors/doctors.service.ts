import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorDto, UpdateDoctorDto, CreateAbsenceDto } from './doctors.dto';

@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(centerId?: number, specialtyId?: number) {
    return this.prisma.doctor.findMany({
      where: {
        ...(centerId && { centerId }),
        ...(specialtyId && { specialtyId }),
      },
      include: {
        specialty: true,
        center: true,
        absences: { orderBy: { startDate: 'asc' } },
      },
    });
  }

  async findOne(id: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { specialty: true, center: true },
    });

    if (!doctor) throw new NotFoundException(`Médecin #${id} introuvable`);

    return doctor;
  }

  /**
   * Génère les créneaux disponibles pour un médecin à une date donnée.
   *
   * Plages horaires : 09h00–11h30 et 14h00–17h30 (toutes les 30 min).
   * Un créneau est indisponible si le médecin est absent ce jour-là
   * ou si un rendez-vous non annulé existe déjà à cette heure.
   */
  async getAvailableSlots(doctorId: number, dateStr: string) {
    await this.findOne(doctorId);

    const date = new Date(dateStr);
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Une absence couvre le jour si elle chevauche même partiellement la journée
    const absence = await this.prisma.absence.findFirst({
      where: {
        doctorId,
        startDate: { lte: endOfDay },
        endDate:   { gte: startOfDay },
      },
    });

    if (absence) {
      return { available: false, slots: [], reason: 'Médecin absent ce jour' };
    }

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        dateTime: { gte: startOfDay, lte: endOfDay },
        status: { not: 'CANCELLED' },
      },
    });

    const takenSlots = existingAppointments.map((apt) => {
      const d = new Date(apt.dateTime);
      return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
    });

    const slots: { time: string; dateTime: string; available: boolean }[] = [];

    for (let hour = 9; hour <= 17; hour++) {
      for (const minute of [0, 30]) {
        if (hour === 12 || hour === 13) continue; // pause déjeuner
        if (hour === 17 && minute > 30) continue; // fin de journée à 17h30

        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotDate = new Date(date);
        slotDate.setUTCHours(hour, minute, 0, 0);

        slots.push({
          time: timeStr,
          dateTime: slotDate.toISOString(),
          available: !takenSlots.includes(timeStr),
        });
      }
    }

    return { available: true, slots };
  }

  create(dto: CreateDoctorDto) {
    return this.prisma.doctor.create({
      data: dto,
      include: { specialty: true, center: true },
    });
  }

  async update(id: number, dto: UpdateDoctorDto) {
    await this.findOne(id);
    return this.prisma.doctor.update({
      where: { id },
      data: dto,
      include: { specialty: true, center: true },
    });
  }

  async createAbsence(doctorId: number, dto: CreateAbsenceDto) {
    await this.findOne(doctorId);
    return this.prisma.absence.create({
      data: {
        doctorId,
        startDate: new Date(dto.startDate),
        endDate:   new Date(dto.endDate),
        reason:    dto.reason,
      },
    });
  }

  async removeAbsence(doctorId: number, absenceId: number) {
    const absence = await this.prisma.absence.findFirst({
      where: { id: absenceId, doctorId },
    });

    if (!absence) throw new NotFoundException(`Absence #${absenceId} introuvable`);

    return this.prisma.absence.delete({ where: { id: absenceId } });
  }
}
