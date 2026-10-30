import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { describe, it, expect, beforeEach } from 'vitest';
import { EncryptionService } from './encryption.service';

describe('EncryptionService (AES-256-GCM LOPDP)', () => {
  let service: EncryptionService;

  beforeEach(() => {
    service = new EncryptionService();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debe cifrar y descifrar antecedentes médicos sensibles correctamente', () => {
    const originalMedicalText = 'Paciente alérgico a Penicilina, sufre de Hipertensión diagnosticada';
    const encrypted = service.encrypt(originalMedicalText);

    expect(encrypted).toBeDefined();
    expect(encrypted).not.toBe(originalMedicalText);
    expect(encrypted).toContain(':'); // Formato iv:authTag:ciphertext

    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toBe(originalMedicalText);
  });

  it('debe lanzar error si el texto cifrado o el auth tag fue manipulado (Integridad GCM)', () => {
    const originalText = 'Datos médicos inalterables';
    const encrypted = service.encrypt(originalText);

    const parts = encrypted.split(':');
    // Alterar el payload cifrado
    parts[2] = parts[2].substring(0, parts[2].length - 2) + 'ff';
    const tampered = parts.join(':');

    expect(() => service.decrypt(tampered)).toThrowError();
  });
});
