import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID de la Sede' })
  @IsUUID('4', { message: 'El branchId debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El branchId es obligatorio' })
  branchId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001', description: 'ID del Paciente' })
  @IsUUID('4', { message: 'El patientId debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El patientId es obligatorio' })
  patientId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002', description: 'ID del Odontólogo tratante' })
  @IsUUID('4', { message: 'El doctorId debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El doctorId es obligatorio' })
  doctorId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174003', description: 'ID del Sillón Dental asignado' })
  @IsUUID('4', { message: 'El chairId debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El chairId es obligatorio' })
  chairId: string;

  @ApiProperty({ example: '2026-11-01T09:00:00.000Z', description: 'Fecha y hora de inicio de la cita' })
  @IsDateString({}, { message: 'startDateTime debe tener formato ISO 8601' })
  @IsNotEmpty({ message: 'startDateTime es obligatorio' })
  startDateTime: string;

  @ApiProperty({ example: '2026-11-01T10:00:00.000Z', description: 'Fecha y hora de finalización de la cita' })
  @IsDateString({}, { message: 'endDateTime debe tener formato ISO 8601' })
  @IsNotEmpty({ message: 'endDateTime es obligatorio' })
  endDateTime: string;

  @ApiPropertyOptional({ example: 'Limpieza dental y valoración inicial', description: 'Motivo de consulta' })
  @IsString()
  @IsOptional()
  reason?: string;
}
