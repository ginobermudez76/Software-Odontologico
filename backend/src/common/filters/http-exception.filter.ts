import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Filtro Global de Excepciones conforme al estándar RFC 7807 (Problem Details for HTTP APIs)
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const traceId = uuidv4();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'Error Interno del Servidor';
    let detail = 'Ocurrió un error inesperado. Por favor contacte al soporte con el traceId proporcionado.';
    let errorCode = 'ERR_INTERNAL_SERVER_ERROR';
    let invalidParams: any[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        detail = res.message || res.detail || exception.message;
        title = res.error || exception.name;
        errorCode = res.errorCode || `ERR_HTTP_${status}`;
        if (Array.isArray(res.message)) {
          detail = 'Fallo de validación en los parámetros enviados';
          invalidParams = res.message;
          errorCode = 'ERR_VALIDATION_FAILED';
        }
      } else {
        detail = res || exception.message;
        title = exception.name;
        errorCode = `ERR_HTTP_${status}`;
      }
    } else if (exception instanceof Error) {
      this.logger.error(`[TraceID: ${traceId}] Error no controlado: ${exception.message}`, exception.stack);
    }

    // Respuesta RFC 7807
    const errorPayload = {
      type: `https://api.sigodental.com/errors/${errorCode}`,
      title,
      status,
      detail,
      instance: request.url,
      errorCode,
      timestamp: new Date().toISOString(),
      traceId,
      ...(invalidParams.length > 0 && { invalidParams }),
    };

    response.status(status).json(errorPayload);
  }
}

