import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ProbingSiteDto {
  @ApiProperty({ description: 'Profundidad de sondaje en mm (1-15)', example: 3 })
  @IsInt()
  @Min(0)
  @Max(20)
  probingDepth: number; // PS

  @ApiProperty({ description: 'Margen gingival en mm (-10 a +10)', example: 0 })
  @IsInt()
  @Min(-15)
  @Max(15)
  gingivalMargin: number; // MG

  @ApiPropertyOptional({ description: 'Nivel de inserción clínica calculado (PS + MG)', example: 3 })
  @IsOptional()
  @IsInt()
  clinicalAttachmentLevel?: number; // NIC

  @ApiPropertyOptional({ description: 'Sangrado al sondaje (BOP / SS)', default: false })
  @IsOptional()
  @IsBoolean()
  bleeding?: boolean;

  @ApiPropertyOptional({ description: 'Supuración activa (SUP)', default: false })
  @IsOptional()
  @IsBoolean()
  suppuration?: boolean;

  @ApiPropertyOptional({ description: 'Presencia de placa bacteriana (PL)', default: false })
  @IsOptional()
  @IsBoolean()
  plaque?: boolean;
}

export class ToothSitesDto {
  @ApiProperty({ description: 'Sitio Distal' })
  @ValidateNested()
  @Type(() => ProbingSiteDto)
  distal: ProbingSiteDto;

  @ApiProperty({ description: 'Sitio Medio / Central' })
  @ValidateNested()
  @Type(() => ProbingSiteDto)
  middle: ProbingSiteDto;

  @ApiProperty({ description: 'Sitio Mesial' })
  @ValidateNested()
  @Type(() => ProbingSiteDto)
  mesial: ProbingSiteDto;
}

export class PeriodontalToothDto {
  @ApiProperty({ description: 'Número de diente (FDI 11-48)', example: 16 })
  @IsInt()
  toothNumber: number;

  @ApiPropertyOptional({ description: 'Diente ausente', default: false })
  @IsOptional()
  @IsBoolean()
  isMissing?: boolean;

  @ApiPropertyOptional({ description: 'Implante dental', default: false })
  @IsOptional()
  @IsBoolean()
  isImplant?: boolean;

  @ApiPropertyOptional({ description: 'Grado de movilidad (0, 1, 2, 3)', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  mobility?: number;

  @ApiPropertyOptional({ description: 'Compromiso de furca (0, 1, 2, 3, 4)', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  furcation?: number;

  @ApiProperty({ description: 'Tres sitios de medición vestibular (distal, medio, mesial)' })
  @ValidateNested()
  @Type(() => ToothSitesDto)
  vestibular: ToothSitesDto;

  @ApiProperty({ description: 'Tres sitios de medición lingual / palatino (distal, medio, mesial)' })
  @ValidateNested()
  @Type(() => ToothSitesDto)
  lingual: ToothSitesDto;
}

export class PeriodontogramSummaryDto {
  @ApiProperty({ description: 'Índice de placa bacteriana de O\'Leary (%)', example: 18.5 })
  @IsNumber()
  olearyPlaqueIndex: number;

  @ApiProperty({ description: 'Índice de sangrado al sondaje BOP (%)', example: 8.2 })
  @IsNumber()
  bleedingOnProbingIndex: number;

  @ApiProperty({ description: 'Total de sitios con profundidad de sondaje >= 4mm', example: 4 })
  @IsInt()
  periodontalPocketsCount: number;

  @ApiProperty({ description: 'Total de sitios con profundidad de sondaje >= 6mm', example: 1 })
  @IsInt()
  deepPocketsCount: number;

  @ApiProperty({ description: 'Total de dientes evaluados', example: 28 })
  @IsInt()
  evaluatedTeethCount: number;
}

export class UpdatePeriodontogramDto {
  @ApiProperty({ description: 'Mapa de dientes con sus mediciones periodontales indexados por número FDI' })
  @IsObject()
  teeth: Record<string, PeriodontalToothDto>;

  @ApiPropertyOptional({ description: 'Notas clínicas u observaciones periodontales' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Resumen e índices globales', type: PeriodontogramSummaryDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PeriodontogramSummaryDto)
  summary?: PeriodontogramSummaryDto;
}

