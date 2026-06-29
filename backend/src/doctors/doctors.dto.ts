import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsInt,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { AbsenceReason } from '@prisma/client';

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  specialtyId: number;

  @IsInt()
  centerId: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}

export class UpdateDoctorDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  specialtyId?: number;

  @IsInt()
  @IsOptional()
  centerId?: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}

export class CreateAbsenceDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(AbsenceReason)
  reason: AbsenceReason;
}
