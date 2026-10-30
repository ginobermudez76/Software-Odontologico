import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class QueryInvoiceDto {
  @ApiPropertyOptional({ description: 'ID del paciente' })
  @IsOptional()
  @IsUUID('4')
  patientId?: string;

  @ApiPropertyOptional({ description: 'ID del cajero' })
  @IsOptional()
  @IsUUID('4')
  cashierId?: string;

  @ApiPropertyOptional({ enum: ['FACTURA', 'BOLETA', 'NOTA_CREDITO'] })
  @IsOptional()
  @IsIn(['FACTURA', 'BOLETA', 'NOTA_CREDITO'])
  invoiceType?: string;

  @ApiPropertyOptional({ description: 'Fecha inicio de búsqueda' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Fecha fin de búsqueda' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
