import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { OpenCashShiftDto } from './dto/open-cash-shift.dto';
import { CloseBlindCashShiftDto } from './dto/close-cash-shift.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { QueryInvoiceDto } from './dto/query-invoice.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Facturación y Arqueo Ciego de Caja')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('shifts/open')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Abrir un nuevo turno de caja con fondo fijo inicial' })
  @ApiResponse({ status: 201, description: 'Turno de caja abierto correctamente' })
  @ApiResponse({ status: 409, description: 'Ya existe un turno abierto para este cajero' })
  async openShift(@Body() dto: OpenCashShiftDto, @Req() req: any) {
    return this.billingService.openShift(dto, req.user?.id);
  }

  @Get('shifts/current')
  @ApiOperation({ summary: 'Obtener el turno activo del cajero (sin filtrar saldo teórico)' })
  @ApiResponse({ status: 200, description: 'Turno activo obtenido o null' })
  async getCurrentShift(@Query('branchId') branchId: string, @Req() req: any) {
    return this.billingService.getCurrentShift(req.user?.id, branchId);
  }

  @Post('shifts/:id/close-blind')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Arqueo y Cierre Ciego de Caja: envía conteo físico y recibe acta de conciliación' })
  @ApiResponse({ status: 200, description: 'Cierre ciego procesado y acta generada' })
  @ApiResponse({ status: 400, description: 'Turno ya cerrado o datos inválidos' })
  async closeBlindShift(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: CloseBlindCashShiftDto,
    @Req() req: any,
  ) {
    return this.billingService.closeBlindShift(id, dto, req.user?.id);
  }

  @Get('shifts/history')
  @ApiOperation({ summary: 'Historial de turnos de caja para auditoría de sede' })
  @ApiResponse({ status: 200, description: 'Historial de turnos' })
  async getShiftHistory(@Query('branchId', new ParseUUIDPipe({ version: '4' })) branchId: string) {
    return this.billingService.getShiftHistory(branchId);
  }

  @Post('invoices')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Emisión de comprobante de pago con desglose de pagos mixtos' })
  @ApiResponse({ status: 201, description: 'Factura emitida con éxito' })
  @ApiResponse({ status: 400, description: 'Diferencia en pagos mixtos o caja cerrada' })
  async createInvoice(@Body() dto: CreateInvoiceDto, @Req() req: any) {
    return this.billingService.createInvoice(dto, req.user?.id);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Listado de facturas y boletas emitidas' })
  @ApiResponse({ status: 200, description: 'Listado de facturas obtenido' })
  async findAllInvoices(@Query() query: QueryInvoiceDto) {
    return this.billingService.findAllInvoices(query);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Obtener detalle de factura por UUID' })
  @ApiResponse({ status: 200, description: 'Factura encontrada' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async findInvoiceById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.billingService.findInvoiceById(id);
  }
}

