import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClinicalRecordsService } from './clinical-records.service';
import { UpdateOdontogramDto } from './dto/update-odontogram.dto';
import { UpdatePeriodontogramDto } from './dto/update-periodontogram.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Expediente Clínico & Odontograma')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/clinical-records')
export class ClinicalRecordsController {
  constructor(private readonly clinicalRecordsService: ClinicalRecordsService) {}

  @Get(':patientId/odontogram')
  @ApiOperation({ summary: 'Obtener el odontograma 2D (Inicial y Evolutivo) del paciente' })
  @ApiResponse({ status: 200, description: 'Odontograma obtenido con éxito' })
  @ApiResponse({ status: 404, description: 'Expediente no encontrado' })
  async getOdontogram(@Param('patientId', new ParseUUIDPipe({ version: '4' })) patientId: string) {
    return this.clinicalRecordsService.getOdontogram(patientId);
  }

  @Put(':patientId/odontogram')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar hallazgos del odontograma (Inicial o Evolutivo)' })
  @ApiResponse({ status: 200, description: 'Odontograma actualizado y auditado' })
  @ApiResponse({ status: 404, description: 'Expediente no encontrado' })
  async updateOdontogram(
    @Param('patientId', new ParseUUIDPipe({ version: '4' })) patientId: string,
    @Body() dto: UpdateOdontogramDto,
    @Req() req: any,
  ) {
    return this.clinicalRecordsService.updateOdontogram(patientId, dto, req.user?.id);
  }

  @Get(':patientId/periodontogram')
  @ApiOperation({ summary: 'Obtener el periodontograma digital y métricas del paciente' })
  @ApiResponse({ status: 200, description: 'Periodontograma obtenido con éxito' })
  @ApiResponse({ status: 404, description: 'Expediente no encontrado' })
  async getPeriodontogram(@Param('patientId', new ParseUUIDPipe({ version: '4' })) patientId: string) {
    return this.clinicalRecordsService.getPeriodontogram(patientId);
  }

  @Put(':patientId/periodontogram')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar periodontograma con cálculo de NIC e índices periodontales' })
  @ApiResponse({ status: 200, description: 'Periodontograma guardado con éxito' })
  @ApiResponse({ status: 404, description: 'Expediente no encontrado' })
  async updatePeriodontogram(
    @Param('patientId', new ParseUUIDPipe({ version: '4' })) patientId: string,
    @Body() dto: UpdatePeriodontogramDto,
    @Req() req: any,
  ) {
    return this.clinicalRecordsService.updatePeriodontogram(patientId, dto, req.user?.id);
  }
}

