import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateSupplyDto {
  @ApiProperty({ description: 'Código SKU único del insumo', example: 'INS-ANES-01' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  sku: string;

  @ApiProperty({ description: 'Nombre comercial y descriptivo del insumo', example: 'Lidocaína 2% con Epinefrina 1:100.000' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiPropertyOptional({ description: 'Marca o fabricante', example: 'Septodont' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ description: 'Unidad de medida', example: 'Cartucho' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiPropertyOptional({ description: 'Nivel de stock mínimo de seguridad', example: 20, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minStock?: number;
}
