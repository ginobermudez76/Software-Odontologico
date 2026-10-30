import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClinicalRecordsService } from './clinical-records.service';

@ApiTags('Verificación Pública de Recetas')
@Controller('api/v1/public/prescriptions')
export class PublicPrescriptionsController {
  constructor(private readonly clinicalRecordsService: ClinicalRecordsService) {}

  @Get('verify/:qrCode')
  @ApiOperation({
    summary: 'Verificación pública de autenticidad de receta odontológica mediante código QR',
  })
  @ApiResponse({ status: 200, description: 'Receta válida y detalles autenticados' })
  @ApiResponse({ status: 404, description: 'Receta no encontrada o código inválido' })
  async verifyPrescription(@Param('qrCode') qrCode: string) {
    return this.clinicalRecordsService.verifyPublicPrescription(qrCode);
  }
}

