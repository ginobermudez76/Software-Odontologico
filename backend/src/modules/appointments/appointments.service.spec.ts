import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppointmentsService } from './appointments.service';
import { ConflictException, BadRequestException } from '@nestjs/common';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let mockPrisma: any;
  let mockNotifications: any;

  beforeEach(() => {
    mockPrisma = {
      appointment: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
      },
      dentalChair: {
        findMany: vi.fn(),
      },
    };

    mockNotifications = {
      sendAppointmentBookingNotification: vi.fn().mockResolvedValue(true),
    };

    service = new AppointmentsService(mockPrisma, mockNotifications);
  });

  it('debe rechazar la cita si startDateTime >= endDateTime', async () => {
    const invalidDto = {
      branchId: '00000000-0000-0000-0000-000000000001',
      patientId: '00000000-0000-0000-0000-000000000002',
      doctorId: '00000000-0000-0000-0000-000000000003',
      chairId: '00000000-0000-0000-0000-000000000004',
      startDateTime: '2026-11-01T10:00:00.000Z',
      endDateTime: '2026-11-01T09:00:00.000Z',
    };

    await expect(service.create(invalidDto as any)).rejects.toThrow(BadRequestException);
  });

  it('debe lanzar ConflictException (ERR_CHAIR_COLLISION) si el sillón físico ya está ocupado en ese horario', async () => {
    // Simular que ya existe una cita en ese sillón
    mockPrisma.appointment.findFirst.mockResolvedValueOnce({
      id: 'existing-apt-1',
      chairId: 'chair-1',
      startDateTime: new Date('2026-11-01T09:00:00.000Z'),
      endDateTime: new Date('2026-11-01T10:00:00.000Z'),
      chair: { name: 'Sillón Principal 1' },
      patient: { firstName: 'Juan', lastName: 'Pérez' },
    });

    const dto = {
      branchId: '00000000-0000-0000-0000-000000000001',
      patientId: '00000000-0000-0000-0000-000000000002',
      doctorId: '00000000-0000-0000-0000-000000000003',
      chairId: 'chair-1',
      startDateTime: '2026-11-01T09:30:00.000Z',
      endDateTime: '2026-11-01T10:30:00.000Z',
    };

    await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
  });

  it('debe lanzar ConflictException (ERR_DOCTOR_COLLISION) si el profesional ya tiene otra cita en el mismo horario', async () => {
    // Sillón disponible
    mockPrisma.appointment.findFirst.mockResolvedValueOnce(null);

    // Pero odontólogo ocupado en otro sillón
    mockPrisma.appointment.findFirst.mockResolvedValueOnce({
      id: 'existing-apt-2',
      doctorId: 'doc-1',
      startDateTime: new Date('2026-11-01T09:00:00.000Z'),
      endDateTime: new Date('2026-11-01T10:00:00.000Z'),
      chair: { name: 'Sillón Quirúrgico' },
      patient: { firstName: 'María', lastName: 'Gómez' },
    });

    const dto = {
      branchId: '00000000-0000-0000-0000-000000000001',
      patientId: '00000000-0000-0000-0000-000000000002',
      doctorId: 'doc-1',
      chairId: 'chair-2',
      startDateTime: '2026-11-01T09:15:00.000Z',
      endDateTime: '2026-11-01T09:45:00.000Z',
    };

    await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
  });

  it('debe crear la cita satisfactoriamente cuando sillón y odontólogo están disponibles', async () => {
    // Sillón libre
    mockPrisma.appointment.findFirst.mockResolvedValueOnce(null);
    // Doctor libre
    mockPrisma.appointment.findFirst.mockResolvedValueOnce(null);

    const createdAppointment = {
      id: 'new-apt-uuid',
      branchId: 'b-1',
      patientId: 'p-1',
      doctorId: 'd-1',
      chairId: 'c-1',
      startDateTime: new Date('2026-11-01T14:00:00.000Z'),
      endDateTime: new Date('2026-11-01T15:00:00.000Z'),
      status: 'PROGRAMADO',
      patient: { firstName: 'Carlos', lastName: 'Mendoza', phone: '+593991234567' },
      doctor: { id: 'd-1', firstName: 'Ana', lastName: 'Suárez' },
      chair: { name: 'Sillón 1' },
      branch: { name: 'Sede Central' },
    };

    mockPrisma.appointment.create.mockResolvedValueOnce(createdAppointment);

    const result = await service.create({
      branchId: 'b-1',
      patientId: 'p-1',
      doctorId: 'd-1',
      chairId: 'c-1',
      startDateTime: '2026-11-01T14:00:00.000Z',
      endDateTime: '2026-11-01T15:00:00.000Z',
      reason: 'Valoración',
    });

    expect(result.id).toBe('new-apt-uuid');
    expect(result.status).toBe('PROGRAMADO');
    expect(mockNotifications.sendAppointmentBookingNotification).toHaveBeenCalled();
  });

  it('debe actualizar el estado y registrar el cambio en auditoría', async () => {
    mockPrisma.appointment.findUnique.mockResolvedValueOnce({
      id: 'apt-1',
      status: 'CONFIRMADO',
      updatedAt: new Date(Date.now() - 600000), // hace 10 minutos
      waitingMinutes: 0,
      isDeleted: false,
    });

    mockPrisma.appointment.update.mockResolvedValueOnce({
      id: 'apt-1',
      status: 'EN_SALA',
      waitingMinutes: 0,
      patient: { firstName: 'Luis' },
      doctor: { firstName: 'Dr' },
      chair: { name: 'C1' },
    });

    const res = await service.changeStatus('apt-1', { status: 'EN_SALA' }, 'user-admin');
    expect(res.status).toBe('EN_SALA');
    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
  });
});
