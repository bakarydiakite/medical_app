import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpecialtyDto } from './specialties.dto';

@Injectable()
export class SpecialtiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.specialty.findMany({ orderBy: { name: 'asc' } });
  }

  create(dto: CreateSpecialtyDto) {
    return this.prisma.specialty.create({ data: dto });
  }

  async remove(id: number) {
    const specialty = await this.prisma.specialty.findUnique({ where: { id } });

    if (!specialty) throw new NotFoundException(`Spécialité #${id} introuvable`);

    return this.prisma.specialty.delete({ where: { id } });
  }
}
