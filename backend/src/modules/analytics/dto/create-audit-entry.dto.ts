import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAuditEntryDto {
  @ApiPropertyOptional({ description: 'ID del usuario actuante' })
  @IsOptional()
  @IsUUID('4')
  userId?: string;

  @ApiPropertyOptional({ description: 'Rol del usuario' })
  @IsOptional()
  @IsString()
  userRole?: string;

  @ApiProperty({ description: 'Acción realizada (LOGIN, READ, WRITE, UPDATE, SOFT_DELETE, EXPORT)' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ description: 'Recurso afectado' })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiPropertyOptional({ description: 'ID del recurso afectado' })
  @IsOptional()
  @IsUUID('4')
  resourceId?: string;

  @ApiPropertyOptional({ description: 'Dirección IP del cliente' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User-Agent del navegador' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Metadata adicional del evento' })
  @IsOptional()
  metadata?: any;
}

