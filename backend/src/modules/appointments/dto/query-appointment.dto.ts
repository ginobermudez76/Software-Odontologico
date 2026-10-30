import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAppointmentDto {
  @ApiPropertyOptional({ description: 'ID de la sede' })
  @IsOptional()
  @IsUUID('4')
  branchId?: string;

  @ApiPropertyOptional({ description: 'ID del sillón dental' })
  @IsOptional()
  @IsUUID('4')
  chairId?: string;

  @ApiPropertyOptional({ description: 'ID del odontólogo' })
  @IsOptional()
  @IsUUID('4')
  doctorId?: string;

  @ApiPropertyOptional({ description: 'ID del paciente' })
  @IsOptional()
  @IsUUID('4')
  patientId?: string;

  @ApiPropertyOptional({
    description: 'Estado de la cita',
    enum: ['PROGRAMADO', 'CONFIRMADO', 'EN_SALA', 'EN_ATENCION', 'ATENDIDO', 'CANCELADO', 'NO_SHOW'],
  })
  @IsOptional()
  @IsIn(['PROGRAMADO', 'CONFIRMADO', 'EN_SALA', 'EN_ATENCION', 'ATENDIDO', 'CANCELADO', 'NO_SHOW'])
  status?: string;

  @ApiPropertyOptional({ description: 'Fecha inicio de rango (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Fecha fin de rango (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;
}

