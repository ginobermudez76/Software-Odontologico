import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CloseBlindCashShiftDto {
  @ApiProperty({
    example: 450.5,
    description: 'Monto físico total contado a ciegas por el cajero en el cajón',
  })
  @IsNumber({}, { message: 'El balance físico declarado debe ser numérico' })
  @Min(0, { message: 'El monto declarado no puede ser negativo' })
  @IsNotEmpty({ message: 'El conteo físico ciego es obligatorio' })
  declaredPhysicalBalance: number;

  @ApiPropertyOptional({ example: 'Billetes de alta denominación revisados', description: 'Observaciones de cierre' })
  @IsString()
  @IsOptional()
  notes?: string;
}
