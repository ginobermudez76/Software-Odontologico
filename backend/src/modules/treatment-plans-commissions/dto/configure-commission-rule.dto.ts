import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class ConfigureCommissionRuleDto {
  @ApiProperty({ description: 'ID del odontólogo', example: '00000000-0000-0000-0000-000000000001' })
  @IsUUID('4')
  doctorId: string;

  @ApiPropertyOptional({ description: 'ID del procedimiento específico (null si aplica como regla general)', example: null })
  @IsOptional()
  @IsUUID('4')
  procedureId?: string;

  @ApiProperty({
    description: 'Tipo de regla de cálculo',
    enum: ['PERCENTAGE_NET', 'FIXED_AMOUNT'],
    example: 'PERCENTAGE_NET',
  })
  @IsIn(['PERCENTAGE_NET', 'FIXED_AMOUNT'])
  ruleType: 'PERCENTAGE_NET' | 'FIXED_AMOUNT';

  @ApiPropertyOptional({
    description: 'Porcentaje sobre la base comisionable neta (0 - 100)',
    example: 40.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage?: number;

  @ApiPropertyOptional({
    description: 'Monto fijo por procedimiento realizado',
    example: 30.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedAmount?: number;

  @ApiPropertyOptional({ description: 'Estado activo de la regla', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

