import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ToothSurfacesDto {
  @ApiPropertyOptional({ example: 'CARIES' })
  @IsOptional()
  @IsString()
  vestibular?: string;

  @ApiPropertyOptional({ example: 'RESTORATION' })
  @IsOptional()
  @IsString()
  lingual?: string;

  @ApiPropertyOptional({ example: 'HEALTHY' })
  @IsOptional()
  @IsString()
  mesial?: string;

  @ApiPropertyOptional({ example: 'HEALTHY' })
  @IsOptional()
  @IsString()
  distal?: string;

  @ApiPropertyOptional({ example: 'CARIES' })
  @IsOptional()
  @IsString()
  occlusal?: string;
}

export class ToothFindingDto {
  @ApiProperty({ example: '18', description: 'Número de pieza dental en notación FDI' })
  @IsString()
  @IsNotEmpty()
  toothId: string;

  @ApiProperty({
    example: 'CARIES',
    description: 'Estado general de la pieza dental',
    enum: [
      'HEALTHY',
      'CARIES',
      'RESTORATION',
      'CROWN',
      'ENDODONTICS',
      'IMPLANT',
      'EXTRACTION_PROJECTED',
      'EXTRACTED',
      'SEALANT',
      'FRACTURE',
    ],
  })
  @IsString()
  state: string;

  @ApiPropertyOptional({ type: ToothSurfacesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ToothSurfacesDto)
  surfaces?: ToothSurfacesDto;

  @ApiPropertyOptional({ example: 'Caries de esmalte en fosa mesio-oclusal' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'Restauración con resina compuesta fotocurable' })
  @IsOptional()
  @IsString()
  projectedTreatment?: string;
}

export class UpdateOdontogramDto {
  @ApiProperty({
    example: 'EVOLUTIONARY',
    enum: ['INITIAL', 'EVOLUTIONARY'],
    description: 'Tipo de odontograma a actualizar (Inicial vs. Evolutivo)',
  })
  @IsNotEmpty()
  @IsIn(['INITIAL', 'EVOLUTIONARY'], {
    message: 'mode debe ser INITIAL o EVOLUTIONARY',
  })
  mode: 'INITIAL' | 'EVOLUTIONARY';

  @ApiProperty({
    description: 'Mapa de estados de piezas dentales indexado por número de pieza',
    example: {
      '18': { toothId: '18', state: 'CARIES', surfaces: { occlusal: 'CARIES' } },
    },
  })
  @IsObject()
  teeth: Record<string, ToothFindingDto>;

  @ApiPropertyOptional({ example: 'Evaluación general tras fase de raspaje' })
  @IsOptional()
  @IsString()
  generalNotes?: string;
}

