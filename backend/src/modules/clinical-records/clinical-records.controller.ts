import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClinicalRecordsService } from './clinical-records.service';
import { UpdateOdontogramDto } from './dto/update-odontogram.dto';
import { UpdatePeriodontogramDto } from './dto/update-periodontogram.dto';
import {
  CreateEvolutionNoteDto,
  UpdateEvolutionNoteDto,
  CreateAdendaDto,
} from './dto/evolution-note.dto';
import { CreateConsentDto, SignConsentDto } from './dto/consent.dto';
import { CreatePrescriptionDto } from './dto/prescription.dto';
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

  // ==========================================
  // SPRINT 7: NOTAS SOEP & ADENDAS
  // ==========================================

  @Get(':patientId/notes')
  @ApiOperation({ summary: 'Listar notas de evolución clínica SOEP del paciente' })
  @ApiResponse({ status: 200, description: 'Notas clínicas obtenidas' })
  @ApiResponse({ status: 404, description: 'Expediente no encontrado' })
  async getEvolutionNotes(@Param('patientId', new ParseUUIDPipe({ version: '4' })) patientId: string) {
    return this.clinicalRecordsService.getEvolutionNotes(patientId);
  }

  @Post(':patientId/notes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nueva nota de evolución médica SOEP' })
  @ApiResponse({ status: 201, description: 'Nota clínica creada exitosamente' })
  async createEvolutionNote(
    @Param('patientId', new ParseUUIDPipe({ version: '4' })) patientId: string,
    @Body() dto: CreateEvolutionNoteDto,
    @Req() req: any,
  ) {
    return this.clinicalRecordsService.createEvolutionNote(patientId, dto, req.user?.id);
  }

  @Put('notes/:noteId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Editar nota SOEP dentro de las 24 horas de gracia' })
  @ApiResponse({ status: 200, description: 'Nota clínica actualizada' })
  @ApiResponse({ status: 403, description: 'Rechazo: Más de 24 horas transcurridas (Inmutabilidad)' })
  @ApiResponse({ status: 404, description: 'Nota no encontrada' })
  async updateEvolutionNote(
    @Param('noteId', new ParseUUIDPipe({ version: '4' })) noteId: string,
    @Body() dto: UpdateEvolutionNoteDto,
    @Req() req: any,
  ) {
    return this.clinicalRecordsService.updateEvolutionNote(noteId, dto, req.user?.id);
  }

  @Post('notes/:noteId/adendas')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Emitir Nota de Adenda / Aclaratoria formal sobre una nota existente' })
  @ApiResponse({ status: 201, description: 'Adenda médica creada y vinculada legalmente' })
  @ApiResponse({ status: 404, description: 'Nota original no encontrada' })
  async createAdenda(
    @Param('noteId', new ParseUUIDPipe({ version: '4' })) noteId: string,
    @Body() dto: CreateAdendaDto,
    @Req() req: any,
  ) {
    return this.clinicalRecordsService.createAdenda(noteId, dto, req.user?.id);
  }

  // ==========================================
  // SPRINT 8: CONSENTIMIENTO INFORMADO & RECETAS
  // ==========================================

  @Get(':patientId/consents')
  @ApiOperation({ summary: 'Listar consentimientos informados del paciente' })
  @ApiResponse({ status: 200, description: 'Lista de consentimientos' })
  async getConsents(@Param('patientId', new ParseUUIDPipe({ version: '4' })) patientId: string) {
    return this.clinicalRecordsService.getConsents(patientId);
  }

  @Post(':patientId/consents')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear consentimiento informado para procedimiento invasivo' })
  @ApiResponse({ status: 201, description: 'Consentimiento generado' })
  async createConsent(
    @Param('patientId', new ParseUUIDPipe({ version: '4' })) patientId: string,
    @Body() dto: CreateConsentDto,
    @Req() req: any,
  ) {
    return this.clinicalRecordsService.createConsent(patientId, dto, req.user?.id);
  }

  @Put('consents/:consentId/sign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Firmar digitalmente consentimiento informado con hash SHA-256 e IP' })
  @ApiResponse({ status: 200, description: 'Consentimiento firmado e inmutable' })
  @ApiResponse({ status: 409, description: 'Consentimiento ya firmado previamente' })
  async signConsent(
    @Param('consentId', new ParseUUIDPipe({ version: '4' })) consentId: string,
    @Body() dto: SignConsentDto,
    @Req() req: any,
  ) {
    const clientIp = req.ip || req.connection?.remoteAddress;
    return this.clinicalRecordsService.signConsent(consentId, dto, clientIp);
  }

  @Get(':patientId/prescriptions')
  @ApiOperation({ summary: 'Listar recetas odontológicas emitidas al paciente' })
  @ApiResponse({ status: 200, description: 'Lista de recetas' })
  async getPrescriptions(@Param('patientId', new ParseUUIDPipe({ version: '4' })) patientId: string) {
    return this.clinicalRecordsService.getPrescriptions(patientId);
  }

  @Post(':patientId/prescriptions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Emitir receta electrónica con QR y validación de alergias' })
  @ApiResponse({ status: 201, description: 'Receta emitida con código QR' })
  @ApiResponse({ status: 409, description: 'Conflicto de alergia detectado (requiere confirmación)' })
  async createPrescription(
    @Param('patientId', new ParseUUIDPipe({ version: '4' })) patientId: string,
    @Body() dto: CreatePrescriptionDto,
    @Req() req: any,
  ) {
    return this.clinicalRecordsService.createPrescription(patientId, dto, req.user?.id);
  }
}



