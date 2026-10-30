import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class ConvertPlanItemToAppointmentDto {
  @ApiProperty({ description: 'ID de la sede donde se atenderá la cita', example: '00000000-0000-0000-0000-000000000001' })
  @IsUUID('4')
  branchId: string;

  @ApiProperty({ description: 'ID del sillón dental físico asignado', example: '00000000-0000-0000-0000-000000000002' })
  @IsUUID('4')
  chairId: string;

  @ApiProperty({ description: 'Fecha y hora de inicio de la cita', example: '2026-11-05T09:00:00.000Z' })
  @IsDateString()
  startDateTime: string;

  @ApiProperty({ description: 'Fecha y hora de fin de la cita', example: '2026-11-05T10:00:00.000Z' })
  @IsDateString()
  endDateTime: string;

  @ApiPropertyOptional({ description: 'Motivo o notas adicionales de la cita' })
  @IsOptional()
  @IsString()
  reason?: string;
}

