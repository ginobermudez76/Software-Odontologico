import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class OpenCashShiftDto {
  @ApiProperty({ example: '00000000-0000-0000-0000-000000000001', description: 'ID de la Sede' })
  @IsUUID('4', { message: 'El branchId debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El branchId es obligatorio' })
  branchId: string;

  @ApiProperty({ example: 100.0, description: 'Fondo fijo de apertura en caja (Efectivo)' })
  @IsNumber({}, { message: 'El balance inicial debe ser un número' })
  @Min(0, { message: 'El balance de apertura no puede ser negativo' })
  openingBalance: number;

  @ApiPropertyOptional({ example: 'Turno Mañana - Caja 1', description: 'Notas u observaciones' })
  @IsString()
  @IsOptional()
  notes?: string;
}
