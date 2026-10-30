import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class InvoiceItemDto {
  @ApiProperty({ example: 'Profilaxis Dental y Destartraje', description: 'Descripción del procedimiento o producto' })
  @IsString()
  @IsNotEmpty({ message: 'La descripción del ítem es requerida' })
  description: string;

  @ApiProperty({ example: 1, description: 'Cantidad' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 45.0, description: 'Precio unitario' })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class PaymentSplitDto {
  @ApiProperty({ example: 'EFECTIVO', enum: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'] })
  @IsString()
  @IsIn(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'], {
    message: 'Método de pago debe ser EFECTIVO, TARJETA o TRANSFERENCIA',
  })
  paymentMethod: string;

  @ApiProperty({ example: 25.0, description: 'Monto asignado a este método de pago' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ example: 'VOUCHER-POS-987654', description: 'Referencia o número de comprobante/lote' })
  @IsString()
  @IsOptional()
  voucherReference?: string;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: '00000000-0000-0000-0000-000000000001', description: 'ID del paciente' })
  @IsUUID('4', { message: 'El patientId debe ser un UUID v4' })
  @IsNotEmpty({ message: 'El patientId es obligatorio' })
  patientId: string;

  @ApiPropertyOptional({ example: '00000000-0000-0000-0000-000000000002', description: 'ID de la cita clínica asociada' })
  @IsUUID('4')
  @IsOptional()
  appointmentId?: string;

  @ApiProperty({ example: 'FACTURA', enum: ['FACTURA', 'BOLETA', 'NOTA_CREDITO'] })
  @IsString()
  @IsIn(['FACTURA', 'BOLETA', 'NOTA_CREDITO'], {
    message: 'El tipo de comprobante debe ser FACTURA, BOLETA o NOTA_CREDITO',
  })
  invoiceType: string;

  @ApiProperty({ type: [InvoiceItemDto], description: 'Ítems o procedimientos facturados' })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos un ítem' })
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @ApiProperty({ type: [PaymentSplitDto], description: 'Desglose de pagos mixtos (Efectivo, Tarjeta, etc.)' })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos una forma de pago' })
  @ValidateNested({ each: true })
  @Type(() => PaymentSplitDto)
  paymentDetails: PaymentSplitDto[];
}

