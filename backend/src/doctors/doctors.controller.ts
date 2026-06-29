import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto, UpdateDoctorDto, CreateAbsenceDto } from './doctors.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

/**
 * GET public — lecture ouverte pour le formulaire de réservation.
 * Les routes de modification et la gestion des absences sont réservées aux admins.
 */
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  findAll(
    @Query('centerId') centerId?: string,
    @Query('specialtyId') specialtyId?: string,
  ) {
    return this.doctorsService.findAll(
      centerId    ? parseInt(centerId)    : undefined,
      specialtyId ? parseInt(specialtyId) : undefined,
    );
  }

  @Get(':id/available-slots')
  getAvailableSlots(
    @Param('id', ParseIntPipe) id: number,
    @Query('date') date: string,
  ) {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('Le paramètre date est requis (format YYYY-MM-DD)');
    }
    return this.doctorsService.getAvailableSlots(id, date);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateDoctorDto) {
    return this.doctorsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDoctorDto) {
    return this.doctorsService.update(id, dto);
  }

  @Post(':id/absences')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createAbsence(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateAbsenceDto,
  ) {
    return this.doctorsService.createAbsence(id, dto);
  }

  @Delete(':id/absences/:absenceId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  removeAbsence(
    @Param('id', ParseIntPipe) id: number,
    @Param('absenceId', ParseIntPipe) absenceId: number,
  ) {
    return this.doctorsService.removeAbsence(id, absenceId);
  }
}
