import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

export class WhatsAppWebhookDto {
  from: string;
  body: string;
}

@ApiTags('Notificaciones & Webhooks')
@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('whatsapp-webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook para recepción de confirmaciones interactivas de pacientes' })
  @ApiResponse({ status: 200, description: 'Respuesta procesada correctamente' })
  async handleWhatsAppWebhook(@Body() dto: WhatsAppWebhookDto) {
    return this.notificationsService.processInteractiveResponse(dto.from, dto.body.trim());
  }
}
