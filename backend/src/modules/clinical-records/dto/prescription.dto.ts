import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class MedicationItemDto {
  @ApiProperty({ description: 'Nombre comercial o genérico del fármaco', example: 'Amoxicilina + Ácido Clavulánico' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Dosis y concentración', example: '875 / 125 mg' })
  @IsString()
  @IsNotEmpty()
  dose: string;

  @ApiProperty({ description: 'Frecuencia de administración', example: 'Cada 12 horas' })
  @IsString()
  @IsNotEmpty()
  frequency: string;

  @ApiProperty({ description: 'Duración del tratamiento', example: 'Por 7 días' })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiPropertyOptional({ description: 'Indicaciones o precauciones de ingesta', example: 'Tomar con las comidas principales.' })
  @IsOptional()
  @IsString()
  indications?: string;
}

export class CreatePrescriptionDto {
  @ApiProperty({ description: 'Lista de medicamentos prescritos', type: [MedicationItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicationItemDto)
  items: MedicationItemDto[];

  @ApiPropertyOptional({ description: 'Instrucciones generales o de alarma para el paciente' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({
    description: 'Confirmación explícita para omitir advertencia de interacción o alergia detectada',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  bypassAllergyWarning?: boolean;
}

