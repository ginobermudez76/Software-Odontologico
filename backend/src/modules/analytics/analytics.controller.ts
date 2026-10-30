import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { KpiQueryDto } from './dto/kpi-query.dto';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { CreateAuditEntryDto } from './dto/create-audit-entry.dto';

@ApiTags('Analítica Directiva (BI) y Auditoría Forense')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('kpis')
  @ApiOperation({
    summary: 'Obtener indicadores directivos clave (No-Show, Ocupación de sillones, Ticket promedio y rentabilidad)',
  })
  async getDirectorKpis(@Query() query: KpiQueryDto) {
    return this.analyticsService.getDirectorKpis(query);
  }

  @Get('audit-logs')
  @ApiOperation({
    summary: 'Consultar logs forenses inmutables de auditoría (Cumplimiento LOPDP / ASVS Nivel 2)',
  })
  async getForensicAuditLogs(@Query() query: AuditLogQueryDto) {
    return this.analyticsService.getForensicAuditLogs(query);
  }

  @Post('audit-logs')
  @ApiOperation({
    summary: 'Registrar un evento de auditoría con hash SHA-256 de integridad criptográfica',
  })
  async createAuditLogEntry(
    @Body() dto: CreateAuditEntryDto,
    @Req() req: any,
  ) {
    if (!dto.ipAddress && req.ip) {
      dto.ipAddress = req.ip;
    }
    if (!dto.userAgent && req.headers['user-agent']) {
      dto.userAgent = req.headers['user-agent'];
    }
    return this.analyticsService.createAuditLogEntry(dto);
  }
}

