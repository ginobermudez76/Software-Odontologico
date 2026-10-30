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
import { InventoryService } from './inventory.service';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { AddBatchDto } from './dto/add-batch.dto';
import { ConfigureProcedureRecipeDto } from './dto/configure-recipe.dto';
import { DischargeProcedureStockDto } from './dto/discharge-stock.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Inventario Clínico & Insumos')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('supplies')
  @ApiOperation({ summary: 'Listar insumos clínicos con semáforo de stock (Óptimo, Bajo, Crítico)' })
  @ApiResponse({ status: 200, description: 'Listado de insumos obtenido exitosamente' })
  async findAllSupplies(@Query('search') search?: string) {
    return this.inventoryService.findAllSupplies(search);
  }

  @Post('supplies')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo insumo clínico con validación de SKU único' })
  @ApiResponse({ status: 201, description: 'Insumo creado' })
  @ApiResponse({ status: 409, description: 'SKU ya existe en insumo activo' })
  async createSupply(@Body() dto: CreateSupplyDto, @Req() req: any) {
    return this.inventoryService.createSupply(dto, req.user?.id);
  }

  @Post('supplies/:id/batches')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ingresar nuevo lote de insumo con fecha de vencimiento' })
  @ApiResponse({ status: 201, description: 'Lote registrado e incremento atómico de stock' })
  @ApiResponse({ status: 404, description: 'Insumo no encontrado' })
  async addBatch(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: AddBatchDto,
    @Req() req: any,
  ) {
    return this.inventoryService.addBatch(id, dto, req.user?.id);
  }

  @Get('batches/expiring')
  @ApiOperation({ summary: 'Alertas y reporte de insumos próximos a caducar (60, 30 y 15 días)' })
  @ApiResponse({ status: 200, description: 'Lista de lotes con nivel de alerta' })
  async getExpiringBatches(@Query('days') days?: string) {
    const daysAhead = days ? parseInt(days, 10) : 60;
    return this.inventoryService.getExpiringBatches(daysAhead);
  }

  @Get('procedures/:procedureId/recipe')
  @ApiOperation({ summary: 'Consultar receta de consumo de insumos por procedimiento' })
  @ApiResponse({ status: 200, description: 'Receta de insumos' })
  async getProcedureRecipe(
    @Param('procedureId', new ParseUUIDPipe({ version: '4' })) procedureId: string,
  ) {
    return this.inventoryService.getProcedureRecipe(procedureId);
  }

  @Post('procedures/:procedureId/recipe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Configurar receta clínica de insumos por procedimiento odontológico' })
  @ApiResponse({ status: 200, description: 'Receta configurada' })
  async configureProcedureRecipe(
    @Param('procedureId', new ParseUUIDPipe({ version: '4' })) procedureId: string,
    @Body() dto: ConfigureProcedureRecipeDto,
    @Req() req: any,
  ) {
    return this.inventoryService.configureProcedureRecipe(procedureId, dto, req.user?.id);
  }

  @Post('discharge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Descargo transaccional de stock por procedimiento (Regla RN-06 / FEFO)' })
  @ApiResponse({ status: 200, description: 'Insumos descargados exitosamente del lote más antiguo' })
  async dischargeStock(@Body() dto: DischargeProcedureStockDto, @Req() req: any) {
    return this.inventoryService.dischargeStockByProcedure(dto, req.user?.id);
  }
}

