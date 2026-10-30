import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsUUID, Min, ValidateNested } from 'class-validator';

export class RecipeSupplyItemDto {
  @ApiProperty({ description: 'ID del insumo clínico', example: '00000000-0000-0000-0000-000000000001' })
  @IsUUID('4')
  supplyId: string;

  @ApiProperty({ description: 'Cantidad estándar consumida por procedimiento', example: 1.5 })
  @IsNumber()
  @Min(0.01)
  quantity: number;
}

export class ConfigureProcedureRecipeDto {
  @ApiProperty({ description: 'Lista de insumos requeridos con sus cantidades', type: [RecipeSupplyItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeSupplyItemDto)
  supplies: RecipeSupplyItemDto[];
}
