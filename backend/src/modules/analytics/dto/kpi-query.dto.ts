import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class KpiQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por sede específica' })
  @IsOptional()
  @IsUUID('4')
  branchId?: string;

  @ApiPropertyOptional({ description: 'Fecha de inicio del periodo de análisis (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin del periodo de análisis (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

