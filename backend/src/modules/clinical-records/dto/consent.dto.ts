import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateConsentDto {
  @ApiProperty({
    description: 'Nombre o tipo del procedimiento odontológico invasivo',
    example: 'Exodoncia quirúrgica de tercer molar inferior (Pieza 48)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  procedureName: string;

  @ApiProperty({
    description: 'Descripción detallada de riesgos, complicaciones potenciales y alternativas',
    example: 'Se informó al paciente de los riesgos inherentes: dolor postoperatorio, inflamación, parestesia temporal del nervio dentario inferior, alveolitis y hemorragia.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  risksDescription: string;

  @ApiPropertyOptional({
    description: 'Clave de plantilla precargada utilizada',
    example: 'EXODONCIA_TERCER_MOLAR',
  })
  @IsOptional()
  @IsString()
  templateKey?: string;
}

export class SignConsentDto {
  @ApiProperty({
    description: 'Firma biométrica capturada (DataURL Base64 de trazo vectorial)',
    example: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==',
  })
  @IsString()
  @IsNotEmpty()
  signatureData: string;

  @ApiPropertyOptional({
    description: 'Código de verificación OTP (en caso de firma remota por WhatsApp)',
    example: '482910',
  })
  @IsOptional()
  @IsString()
  otpCode?: string;

  @ApiPropertyOptional({
    description: 'Dirección IP del dispositivo firmante',
    example: '190.152.12.84',
  })
  @IsOptional()
  @IsString()
  signerIp?: string;
}

