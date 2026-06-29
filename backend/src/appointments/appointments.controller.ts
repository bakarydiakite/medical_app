import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './appointments.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

/**
 * Toutes les routes sont protégées par JWT.
 * La distinction patient / admin est gérée dans le service ou via @Roles.
 */
@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  findAll(@Req() req: Request) {
    const { sub: userId, role } = req['user'];
    return this.appointmentsService.findAll(userId, role);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const { sub: userId, role } = req['user'];
    return this.appointmentsService.findOne(id, userId, role);
  }

  @Post()
  create(@Body() dto: CreateAppointmentDto, @Req() req: Request) {
    return this.appointmentsService.create(req['user'].sub, dto);
  }

  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  confirm(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.confirm(id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const { sub: userId, role } = req['user'];
    return this.appointmentsService.cancel(id, userId, role);
  }
}
