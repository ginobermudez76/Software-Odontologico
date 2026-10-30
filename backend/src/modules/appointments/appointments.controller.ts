import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import { ChangeAppointmentStatusDto } from './dto/change-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Agenda y Citas')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agendar una nueva cita con validación anti-colisión de sillón dental' })
  @ApiResponse({ status: 201, description: 'Cita programada con éxito' })
  @ApiResponse({ status: 400, description: 'Rango de fechas inválido' })
  @ApiResponse({ status: 409, description: 'Colisión detectada: sillón u odontólogo ocupados' })
  async create(@Body() dto: CreateAppointmentDto, @Req() req: any) {
    return this.appointmentsService.create(dto, req.user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'Consultar citas filtradas por rango, sillón, odontólogo o estado' })
  @ApiResponse({ status: 200, description: 'Listado de citas obtenido correctamente' })
  async findAll(@Query() query: QueryAppointmentDto) {
    return this.appointmentsService.findAll(query);
  }

  @Get('chairs/status')
  @ApiOperation({ summary: 'Obtener estado de ocupación en tiempo real de los sillones de una sede' })
  @ApiResponse({ status: 200, description: 'Estado en vivo de sillones dentales' })
  async getChairsLiveStatus(@Query('branchId', new ParseUUIDPipe({ version: '4' })) branchId: string) {
    return this.appointmentsService.getChairsLiveStatus(branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de una cita por su UUID' })
  @ApiResponse({ status: 200, description: 'Detalle de la cita' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar o reprogramar una cita con validación de colisiones' })
  @ApiResponse({ status: 200, description: 'Cita modificada con éxito' })
  @ApiResponse({ status: 409, description: 'Colisión de horario o sillón' })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateAppointmentDto,
    @Req() req: any,
  ) {
    return this.appointmentsService.update(id, dto, req.user?.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cambiar el estado de la cita (Programado, Sala, Atención, Atendido, etc.)' })
  @ApiResponse({ status: 200, description: 'Estado actualizado correctamente' })
  async changeStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: ChangeAppointmentStatusDto,
    @Req() req: any,
  ) {
    return this.appointmentsService.changeStatus(id, dto, req.user?.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar cita del cronograma (Soft delete)' })
  @ApiResponse({ status: 200, description: 'Cita eliminada y sillón liberado' })
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: any) {
    return this.appointmentsService.remove(id, req.user?.id);
  }
}
