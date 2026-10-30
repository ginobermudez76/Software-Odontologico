import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AddBatchDto {
  @ApiProperty({ description: 'Número de lote alfanumérico provisto por el fabricante', example: 'LOT-2026-X89' })
  @IsString()
  @IsNotEmpty()
  batchNumber: string;

  @ApiProperty({ description: 'Fecha de caducidad o vencimiento', example: '2027-06-30T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  expirationDate: Date;

  @ApiProperty({ description: 'Cantidad ingresada en el lote', example: 50 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Costo unitario de compra', example: 1.25 })
  @IsNumber()
  @Min(0)
  unitCost: number;
}

