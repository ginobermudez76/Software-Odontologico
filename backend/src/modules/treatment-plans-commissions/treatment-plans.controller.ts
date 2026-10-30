import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TreatmentPlansService } from './treatment-plans.service';
import { CreateTreatmentPlanDto } from './dto/create-treatment-plan.dto';
import { UpdatePlanStatusDto } from './dto/update-plan-status.dto';
import { ConvertPlanItemToAppointmentDto } from './dto/convert-plan-item.dto';

@ApiTags('Presupuestos Clínicos Multinivel')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/treatment-plans')
export class TreatmentPlansController {
  constructor(private readonly treatmentPlansService: TreatmentPlansService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un presupuesto multinivel por fases clínicas (Regla RN-04: validez 30 días)',
  })
  async createPlan(@Body() dto: CreateTreatmentPlanDto) {
    return this.treatmentPlansService.createPlan(dto);
  }

  @Get('patient/:patientId')
  @ApiOperation({
    summary: 'Listar todos los presupuestos de un paciente con control dinámico de vencimiento',
  })
  async findAllByPatient(@Param('patientId', ParseUUIDPipe) patientId: string) {
    return this.treatmentPlansService.findAllByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener el detalle de un presupuesto y sus fases clínicas',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.treatmentPlansService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Aprobar o rechazar un presupuesto (Valida que no esté vencido según Regla RN-04)',
  })
  async updatePlanStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlanStatusDto,
  ) {
    return this.treatmentPlansService.updatePlanStatus(id, dto);
  }

  @Post(':id/items/:itemId/convert-to-appointment')
  @ApiOperation({
    summary: 'Conversión directa de un ítem de presupuesto aprobado a una cita agendada',
  })
  async convertItemToAppointment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: ConvertPlanItemToAppointmentDto,
  ) {
    return this.treatmentPlansService.convertItemToAppointment(id, itemId, dto);
  }
}
