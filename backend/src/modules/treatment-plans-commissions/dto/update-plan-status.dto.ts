import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdatePlanStatusDto {
  @ApiProperty({
    description: 'Nuevo estado del plan de tratamiento',
    enum: ['APROBADO', 'RECHAZADO', 'VENCIDO'],
    example: 'APROBADO',
  })
  @IsIn(['APROBADO', 'RECHAZADO', 'VENCIDO'])
  status: 'APROBADO' | 'RECHAZADO' | 'VENCIDO';

  @ApiPropertyOptional({
    description: 'Motivo de rechazo o cancelación en caso de no aceptarse',
    example: 'Paciente solicita postergar por viaje laboral',
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

