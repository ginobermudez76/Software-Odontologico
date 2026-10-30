import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class TreatmentPlanItemInputDto {
  @ApiProperty({ description: 'ID del procedimiento de catálogo', example: '00000000-0000-0000-0000-000000000001' })
  @IsUUID('4')
  procedureId: string;

  @ApiPropertyOptional({ description: 'Pieza dental FDI (ej. 18, 24, 36)', example: 36 })
  @IsOptional()
  @IsInt()
  toothNumber?: number;

  @ApiPropertyOptional({ description: 'Superficie dental (ej. O, MOD, V)', example: 'MOD' })
  @IsOptional()
  @IsString()
  surface?: string;

  @ApiProperty({ description: 'Cantidad del procedimiento', example: 1, default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Precio unitario pactado', example: 85.0 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Porcentaje de descuento', example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Costo de laboratorio dental externo a deducir', example: 25.0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  labCost?: number;
}

export class TreatmentPlanPhaseInputDto {
  @ApiProperty({ description: 'Número secuencial de la fase (1: Higiene, 2: Operatorias, 3: Rehabilitación)', example: 1 })
  @IsInt()
  @Min(1)
  phaseNumber: number;

  @ApiProperty({ description: 'Nombre descriptivo de la fase clínica', example: 'Fase 1: Saneamiento y Profilaxis' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Ítems o procedimientos de esta fase', type: [TreatmentPlanItemInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TreatmentPlanItemInputDto)
  items: TreatmentPlanItemInputDto[];
}

export class CreateTreatmentPlanDto {
  @ApiProperty({ description: 'ID del paciente', example: '00000000-0000-0000-0000-000000000001' })
  @IsUUID('4')
  patientId: string;

  @ApiProperty({ description: 'ID del odontólogo tratante que presupuesta', example: '00000000-0000-0000-0000-000000000002' })
  @IsUUID('4')
  doctorId: string;

  @ApiProperty({ description: 'Título del plan de tratamiento', example: 'Plan Integral de Rehabilitación Oral' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Notas explicativas o alternativas para el paciente' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Indica si es un plan alternativo (ej. Plan Ideal vs Plan Económico)', default: false })
  @IsOptional()
  @IsBoolean()
  isAlternative?: boolean;

  @ApiProperty({ description: 'Fases clínicas del presupuesto', type: [TreatmentPlanPhaseInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TreatmentPlanPhaseInputDto)
  phases: TreatmentPlanPhaseInputDto[];
}

