import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEvolutionNoteDto {
  @ApiProperty({
    description: 'Subjetivo (S): Motivo de consulta y síntomas referidos por el paciente',
    example: 'Paciente refiere dolor punzante en cuadrante 1 ante estímulos fríos desde hace 3 días.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  subjective: string;

  @ApiProperty({
    description: 'Objetivo (O): Hallazgos del examen clínico, sondeo y pruebas de vitalidad',
    example: 'Pieza 16 presenta cavidad profunda en cara oclusal. Vitalidad pulpar positiva con respuesta prolongada al frío. Percusión vertical negativa.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  objective: string;

  @ApiProperty({
    description: 'Evaluación (E): Diagnóstico presuntivo/definitivo y código CIE-10 Odontológico',
    example: 'K04.0 Pulpitis reversible en pieza 16. K02.1 Caries de la dentina.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  assessment: string;

  @ApiProperty({
    description: 'Plan (P): Tratamiento ejecutado, indicaciones farmacológicas y plan proyectado',
    example: 'Aislamiento absoluto, remoción de caries con fresa carburo, colocación de base de ionómero de vidrio y restauración provisional. Control en 7 días.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  plan: string;

  @ApiPropertyOptional({
    description: 'Códigos CIE-10 odontológicos estructurados',
    example: ['K04.0', 'K02.1'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cie10Codes?: string[];
}

export class UpdateEvolutionNoteDto {
  @ApiProperty({ description: 'Subjetivo (S)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  subjective: string;

  @ApiProperty({ description: 'Objetivo (O)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  objective: string;

  @ApiProperty({ description: 'Evaluación (E)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  assessment: string;

  @ApiProperty({ description: 'Plan (P)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  plan: string;
}

export class CreateAdendaDto {
  @ApiProperty({
    description: 'Texto aclaratorio o rectificatorio de la adenda médica',
    example: 'Aclaratoria: Se constató en la radiografía periapical una cercanía cameral mayor a 1.5mm. Se ratifica plan de protección pulpar indirecta.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  clarificationText: string;

  @ApiPropertyOptional({
    description: 'Motivo formal de la emisión de la adenda',
    example: 'Aclaración de hallazgo radiográfico complementario',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

