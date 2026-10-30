import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class DischargeProcedureStockDto {
  @ApiProperty({ description: 'ID del procedimiento clínico ejecutado', example: '00000000-0000-0000-0000-000000000001' })
  @IsUUID('4')
  procedureId: string;

  @ApiPropertyOptional({ description: 'ID de la cita clínica asociada', example: '00000000-0000-0000-0000-000000000002' })
  @IsOptional()
  @IsUUID('4')
  appointmentId?: string;

  @ApiPropertyOptional({ description: 'ID del sillón dental físico', example: '00000000-0000-0000-0000-000000000003' })
  @IsOptional()
  @IsUUID('4')
  chairId?: string;

  @ApiPropertyOptional({ description: 'Motivo del descargo', example: 'CONSUMO_PROCEDIMIENTO' })
  @IsOptional()
  @IsString()
  reason?: string;
}
