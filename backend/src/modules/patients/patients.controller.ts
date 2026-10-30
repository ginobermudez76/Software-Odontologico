import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Ip,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientDto } from './dto/query-patient.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Gestión de Pacientes y Filiación')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/patients')
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo paciente con validación de tutor legal y cifrado LOPDP' })
  @ApiResponse({ status: 201, description: 'Paciente y Expediente creados exitosamente' })
  @ApiResponse({ status: 400, description: 'Fallo de validación o tutor legal ausente para menores' })
  @ApiResponse({ status: 409, description: 'Número de documento duplicado en pacientes activos' })
  async create(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentUser() currentUser: any,
    @Ip() ipAddress: string,
  ) {
    return this.patientsService.create(createPatientDto, currentUser.branchId, currentUser, ipAddress);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar y listar pacientes con paginación' })
  @ApiResponse({ status: 200, description: 'Listado de pacientes paginado' })
  async findAll(@Query() query: QueryPatientDto, @CurrentUser() currentUser: any) {
    return this.patientsService.findAll(query, currentUser.branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar ficha detallada de paciente y antecedentes médicos cifrados' })
  @ApiResponse({ status: 200, description: 'Ficha médica del paciente' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
    @Ip() ipAddress: string,
  ) {
    return this.patientsService.findOne(id, currentUser, ipAddress);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modificar datos demográficos y antecedentes médicos de un paciente' })
  @ApiResponse({ status: 200, description: 'Paciente actualizado' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @CurrentUser() currentUser: any,
    @Ip() ipAddress: string,
  ) {
    return this.patientsService.update(id, updatePatientDto, currentUser, ipAddress);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar paciente lógicamente (Soft Delete) liberando el índice único' })
  @ApiResponse({ status: 200, description: 'Paciente eliminado lógicamente' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
    @Ip() ipAddress: string,
  ) {
    return this.patientsService.remove(id, currentUser, ipAddress);
  }
}

