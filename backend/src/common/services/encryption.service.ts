import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private configService?: ConfigService) {
    const secretKeyHex =
      this.configService?.get<string>(
        'DATA_ENCRYPTION_KEY',
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      ) || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    this.key = Buffer.from(secretKeyHex, 'hex');
    if (this.key.length !== 32) {
      this.key = crypto.scryptSync(secretKeyHex, 'sigo-salt', 32);
    }
  }

  /**
   * Cifra un texto plano mediante AES-256-GCM
   * Retorna una cadena estructurada: iv:authTag:ciphertext (en formato hexadecimal)
   */
  encrypt(plainText: string): string {
    if (!plainText) return plainText;

    const iv = crypto.randomBytes(12); // Vector de inicialización de 96 bits recomendado para GCM
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Descifra una cadena previamente cifrada con AES-256-GCM
   * Verifica la integridad mediante el authentication tag
   */
  decrypt(cipherTextPayload: string): string {
    if (!cipherTextPayload) return cipherTextPayload;

    const parts = cipherTextPayload.split(':');
    if (parts.length !== 3) {
      // Si no tiene el formato iv:tag:data, se retorna tal cual (por si no estaba cifrado)
      return cipherTextPayload;
    }

    try {
      const [ivHex, authTagHex, encryptedHex] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (err: any) {
      this.logger.error(`Fallo de descifrado AES-256-GCM (posible manipulación de datos): ${err.message}`);
      throw new Error('Error al descifrar datos clínicos sensibles.');
    }
  }
}

