import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class ChangeAppointmentStatusDto {
  @ApiProperty({
    example: 'EN_SALA',
    enum: ['PROGRAMADO', 'CONFIRMADO', 'EN_SALA', 'EN_ATENCION', 'ATENDIDO', 'CANCELADO', 'NO_SHOW'],
  })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsIn(['PROGRAMADO', 'CONFIRMADO', 'EN_SALA', 'EN_ATENCION', 'ATENDIDO', 'CANCELADO', 'NO_SHOW'], {
    message: 'Estado de cita no válido',
  })
  status: string;

  @ApiPropertyOptional({ example: 10, description: 'Minutos de espera calculados' })
  @IsOptional()
  @IsInt()
  @Min(0)
  waitingMinutes?: number;
}

