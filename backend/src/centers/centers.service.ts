import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCenterDto, UpdateCenterDto } from './centers.dto';

@Injectable()
export class CentersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.center.findMany({
      include: { doctors: { include: { specialty: true } } },
    });
  }

  async findOne(id: number) {
    const center = await this.prisma.center.findUnique({
      where: { id },
      include: { doctors: { include: { specialty: true } } },
    });

    if (!center) throw new NotFoundException(`Centre #${id} introuvable`);

    return center;
  }

  create(dto: CreateCenterDto) {
    return this.prisma.center.create({ data: dto });
  }

  async update(id: number, dto: UpdateCenterDto) {
    await this.findOne(id);
    return this.prisma.center.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.center.delete({ where: { id } });
  }
}
