import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class GenerateSettlementDto {
  @ApiProperty({ description: 'ID del odontólogo a liquidar', example: '00000000-0000-0000-0000-000000000001' })
  @IsUUID('4')
  doctorId: string;

  @ApiProperty({ description: 'Fecha de inicio del periodo', example: '2026-10-01' })
  @IsDateString()
  periodStart: string;

  @ApiProperty({ description: 'Fecha de fin del periodo', example: '2026-10-31' })
  @IsDateString()
  periodEnd: string;

  @ApiPropertyOptional({ description: 'Observaciones o notas de la liquidación' })
  @IsOptional()
  @IsString()
  notes?: string;
}

