import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CommissionsService } from './commissions.service';
import { ConfigureCommissionRuleDto } from './dto/configure-commission-rule.dto';
import { GenerateSettlementDto } from './dto/generate-settlement.dto';

@ApiTags('Liquidación de Comisiones y Honorarios Médicos')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Post('rules')
  @ApiOperation({
    summary: 'Configurar regla de comisiones por porcentaje o monto fijo para un profesional',
  })
  async configureRule(@Body() dto: ConfigureCommissionRuleDto) {
    return this.commissionsService.configureRule(dto);
  }

  @Get('rules/doctor/:doctorId')
  @ApiOperation({
    summary: 'Obtener reglas de comisión activas de un odontólogo',
  })
  async getDoctorRules(@Param('doctorId', ParseUUIDPipe) doctorId: string) {
    return this.commissionsService.getDoctorRules(doctorId);
  }

  @Post('settlements/preview')
  @ApiOperation({
    summary: 'Previsualizar cálculo de liquidación (Regla RN-07: deducción previa obligatoria de costos de laboratorio)',
  })
  async calculateSettlementPreview(@Body() dto: GenerateSettlementDto) {
    return this.commissionsService.calculateSettlementPreview(dto);
  }

  @Post('settlements')
  @ApiOperation({
    summary: 'Generar y registrar formalmente la liquidación de honorarios del periodo',
  })
  async generateAndSaveSettlement(@Body() dto: GenerateSettlementDto) {
    return this.commissionsService.generateAndSaveSettlement(dto);
  }

  @Get('settlements')
  @ApiOperation({
    summary: 'Listar liquidaciones emitidas con filtro opcional por doctor',
  })
  async findAllSettlements(@Query('doctorId') doctorId?: string) {
    return this.commissionsService.findAllSettlements(doctorId);
  }

  @Patch('settlements/:id/pay')
  @ApiOperation({
    summary: 'Marcar una liquidación de honorarios como Pagada',
  })
  async markSettlementPaid(@Param('id', ParseUUIDPipe) id: string) {
    return this.commissionsService.markSettlementPaid(id);
  }
}
