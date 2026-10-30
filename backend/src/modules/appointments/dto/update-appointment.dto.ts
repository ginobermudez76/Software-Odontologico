import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @ApiPropertyOptional({
    example: 'CONFIRMADO',
    enum: ['PROGRAMADO', 'CONFIRMADO', 'EN_SALA', 'EN_ATENCION', 'ATENDIDO', 'CANCELADO', 'NO_SHOW'],
  })
  @IsOptional()
  @IsIn(['PROGRAMADO', 'CONFIRMADO', 'EN_SALA', 'EN_ATENCION', 'ATENDIDO', 'CANCELADO', 'NO_SHOW'], {
    message: 'Estado de cita no válido',
  })
  status?: string;

  @ApiPropertyOptional({ example: 15, description: 'Minutos acumulados en sala de espera' })
  @IsOptional()
  @IsInt()
  @Min(0)
  waitingMinutes?: number;
}

