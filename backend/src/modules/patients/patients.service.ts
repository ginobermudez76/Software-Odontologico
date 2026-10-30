import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../../common/services/encryption.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientDto } from './dto/query-patient.dto';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  /**
   * Alta de paciente con validación de tutor legal y cifrado AES-256-GCM de datos médicos
   */
  async create(dto: CreatePatientDto, branchId: string, currentUser: any, ipAddress: string = '127.0.0.1') {
    // 1. Validación de edad y tutor legal obligatorio para menores de 18 años
    const birthDate = new Date(dto.birthDate);
    const age = this.calculateAge(birthDate);

    if (age < 18 && (!dto.legalTutorData || !dto.legalTutorData.tutorName)) {
      throw new BadRequestException({
        errorCode: 'ERR_LEGAL_TUTOR_REQUIRED',
        detail: `El paciente tiene ${age} años (menor de edad). Es obligatorio registrar los datos del tutor legal o representante.`,
      });
    }

    // 2. Validación de unicidad de documento de identidad en registros activos (is_deleted = false)
    const existing = await this.prisma.patient.findFirst({
      where: {
        documentNumber: dto.documentNumber.trim(),
        isDeleted: false,
      },
    });

    if (existing) {
      throw new ConflictException({
        errorCode: 'ERR_PATIENT_DOCUMENT_EXISTS',
        detail: `Ya existe un paciente activo registrado con el documento número [${dto.documentNumber}].`,
      });
    }

    // 3. Cifrado a nivel de campo (Field-Level Encryption) con AES-256-GCM
    const pathologiesEncrypted = dto.pathologies
      ? this.encryptionService.encrypt(dto.pathologies)
      : null;

    const allergiesEncrypted = dto.allergies
      ? this.encryptionService.encrypt(dto.allergies)
      : null;

    // 4. Creación atómica de Paciente y Expediente Clínico en PostgreSQL
    const recordNumber = `EXP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const result = await this.prisma.$transaction(async (tx) => {
      const patient = await tx.patient.create({
        data: {
          branchId,
          documentType: dto.documentType,
          documentNumber: dto.documentNumber.trim(),
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          birthDate,
          gender: dto.gender,
          email: dto.email?.toLowerCase().trim() || null,
          phone: dto.phone || null,
          address: dto.address || null,
          emergencyData: (dto.emergencyData as any) || null,
          legalTutorData: (dto.legalTutorData as any) || null,
          insuranceData: (dto.insuranceData as any) || null,
        },
      });

      const clinicalRecord = await tx.clinicalRecord.create({
        data: {
          patientId: patient.id,
          recordNumber,
          pathologiesEncrypted,
          allergiesEncrypted,
          visibleAlerts: dto.criticalAlerts ? (dto.criticalAlerts as any) : [],
        },
      });

      // Registro de Auditoría Forense LOPDP
      await tx.auditLog.create({
        data: {
          userId: currentUser?.userId,
          userRole: currentUser?.role,
          action: 'CREATE',
          resource: 'PATIENTS',
          resourceId: patient.id,
          ipAddress,
          metadata: {
            documentNumber: patient.documentNumber,
            recordNumber,
          },
        },
      });

      return { patient, clinicalRecord };
    });

    return {
      id: result.patient.id,
      documentNumber: result.patient.documentNumber,
      fullName: `${result.patient.firstName} ${result.patient.lastName}`,
      recordNumber: result.clinicalRecord.recordNumber,
      visibleAlerts: result.clinicalRecord.visibleAlerts,
      createdAt: result.patient.createdAt,
    };
  }

  /**
   * Búsqueda y listado paginado de pacientes
   */
  async findAll(query: QueryPatientDto, branchId?: string) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      isDeleted: false,
      ...(branchId && { branchId }),
    };

    if (search) {
      where.OR = [
        { documentNumber: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, patients] = await Promise.all([
      this.prisma.patient.count({ where }),
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          clinicalRecord: {
            select: {
              recordNumber: true,
              visibleAlerts: true,
            },
          },
        },
      }),
    ]);

    return {
      data: patients.map((p) => ({
        id: p.id,
        documentType: p.documentType,
        documentNumber: p.documentNumber,
        firstName: p.firstName,
        lastName: p.lastName,
        fullName: `${p.firstName} ${p.lastName}`,
        birthDate: p.birthDate,
        age: this.calculateAge(p.birthDate),
        gender: p.gender,
        email: p.email,
        phone: p.phone,
        recordNumber: p.clinicalRecord?.recordNumber,
        visibleAlerts: Array.isArray(p.clinicalRecord?.visibleAlerts)
          ? p.clinicalRecord.visibleAlerts
          : typeof p.clinicalRecord?.visibleAlerts === 'object' && p.clinicalRecord?.visibleAlerts !== null
            ? [
                ...((p.clinicalRecord.visibleAlerts as any).allergies?.map((a: string) => `Alergia: ${a}`) || []),
                ...((p.clinicalRecord.visibleAlerts as any).systemicConditions || []),
                ...((p.clinicalRecord.visibleAlerts as any).bleedingRisk ? ['Riesgo de Sangrado'] : []),
              ]
            : [],
        createdAt: p.createdAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Consulta detallada del paciente y su expediente clínico con descifrado condicional LOPDP
   */
  async findOne(id: string, currentUser: any, ipAddress: string = '127.0.0.1') {
    const patient = await this.prisma.patient.findFirst({
      where: { id, isDeleted: false },
      include: {
        clinicalRecord: true,
        branch: { select: { id: true, name: true } },
      },
    });

    if (!patient) {
      throw new NotFoundException({
        errorCode: 'ERR_PATIENT_NOT_FOUND',
        detail: `No se encontró un paciente activo con el ID especificado.`,
      });
    }

    // Evaluación de privilegios LOPDP: Solo roles médicos tienen acceso a descifrar antecedentes
    const canViewSensitive = ['ADMIN_TI', 'DIRECTOR_MEDICO', 'ODONTOLOGO'].includes(currentUser?.role);

    let decryptedPathologies: string | null = null;
    let decryptedAllergies: string | null = null;

    if (canViewSensitive && patient.clinicalRecord) {
      if (patient.clinicalRecord.pathologiesEncrypted) {
        decryptedPathologies = this.encryptionService.decrypt(patient.clinicalRecord.pathologiesEncrypted);
      }
      if (patient.clinicalRecord.allergiesEncrypted) {
        decryptedAllergies = this.encryptionService.decrypt(patient.clinicalRecord.allergiesEncrypted);
      }

      // Registro de Auditoría Forense por consulta de datos médicos sensibles
      await this.prisma.auditLog.create({
        data: {
          userId: currentUser?.userId,
          userRole: currentUser?.role,
          action: 'READ',
          resource: 'PATIENT_MEDICAL_RECORDS',
          resourceId: patient.id,
          ipAddress,
          metadata: {
            reason: 'CONSULTA_CLINICA',
          },
        },
      });
    }

    return {
      id: patient.id,
      branchId: patient.branchId,
      branchName: patient.branch.name,
      documentType: patient.documentType,
      documentNumber: patient.documentNumber,
      firstName: patient.firstName,
      lastName: patient.lastName,
      fullName: `${patient.firstName} ${patient.lastName}`,
      birthDate: patient.birthDate,
      age: this.calculateAge(patient.birthDate),
      gender: patient.gender,
      email: patient.email,
      phone: patient.phone,
      address: patient.address,
      emergencyData: patient.emergencyData,
      legalTutorData: patient.legalTutorData,
      insuranceData: patient.insuranceData,
      clinicalRecord: {
        recordNumber: patient.clinicalRecord?.recordNumber,
        visibleAlerts: patient.clinicalRecord?.visibleAlerts || [],
        // Campos descifrados solo para roles autorizados; de lo contrario enmascarados
        pathologies: canViewSensitive ? decryptedPathologies : '*** DATOS CONFIDENCIALES LOPDP ***',
        allergies: canViewSensitive ? decryptedAllergies : '*** DATOS CONFIDENCIALES LOPDP ***',
      },
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  }

  /**
   * Actualización de paciente
   */
  async update(id: string, dto: UpdatePatientDto, currentUser: any, ipAddress: string = '127.0.0.1') {
    const patient = await this.prisma.patient.findFirst({
      where: { id, isDeleted: false },
      include: { clinicalRecord: true },
    });

    if (!patient) {
      throw new NotFoundException({
        errorCode: 'ERR_PATIENT_NOT_FOUND',
        detail: `No se encontró el paciente a actualizar.`,
      });
    }

    // Cifrado de campos actualizados si fueron enviados
    const pathologiesEncrypted = dto.pathologies !== undefined
      ? (dto.pathologies ? this.encryptionService.encrypt(dto.pathologies) : null)
      : undefined;

    const allergiesEncrypted = dto.allergies !== undefined
      ? (dto.allergies ? this.encryptionService.encrypt(dto.allergies) : null)
      : undefined;

    await this.prisma.$transaction(async (tx) => {
      await tx.patient.update({
        where: { id },
        data: {
          ...(dto.documentType && { documentType: dto.documentType }),
          ...(dto.documentNumber && { documentNumber: dto.documentNumber.trim() }),
          ...(dto.firstName && { firstName: dto.firstName.trim() }),
          ...(dto.lastName && { lastName: dto.lastName.trim() }),
          ...(dto.birthDate && { birthDate: new Date(dto.birthDate) }),
          ...(dto.gender && { gender: dto.gender }),
          ...(dto.email !== undefined && { email: dto.email }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
          ...(dto.address !== undefined && { address: dto.address }),
          ...(dto.emergencyData !== undefined && { emergencyData: dto.emergencyData as any }),
          ...(dto.legalTutorData !== undefined && { legalTutorData: dto.legalTutorData as any }),
          ...(dto.insuranceData !== undefined && { insuranceData: dto.insuranceData as any }),
        },
      });

      if (patient.clinicalRecord) {
        await tx.clinicalRecord.update({
          where: { id: patient.clinicalRecord.id },
          data: {
            ...(pathologiesEncrypted !== undefined && { pathologiesEncrypted }),
            ...(allergiesEncrypted !== undefined && { allergiesEncrypted }),
            ...(dto.criticalAlerts !== undefined && { visibleAlerts: dto.criticalAlerts as any }),
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: currentUser?.userId,
          userRole: currentUser?.role,
          action: 'UPDATE',
          resource: 'PATIENTS',
          resourceId: patient.id,
          ipAddress,
        },
      });
    });

    return { message: 'Paciente actualizado exitosamente.' };
  }

  /**
   * Borrado Lógico (Soft Delete) liberando el índice parcial único
   */
  async remove(id: string, currentUser: any, ipAddress: string = '127.0.0.1') {
    const patient = await this.prisma.patient.findFirst({
      where: { id, isDeleted: false },
    });

    if (!patient) {
      throw new NotFoundException({
        errorCode: 'ERR_PATIENT_NOT_FOUND',
        detail: `No se encontró el paciente a eliminar.`,
      });
    }

    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.patient.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: now,
        },
      });

      await tx.clinicalRecord.updateMany({
        where: { patientId: id },
        data: {
          isDeleted: true,
          deletedAt: now,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: currentUser?.userId,
          userRole: currentUser?.role,
          action: 'SOFT_DELETE',
          resource: 'PATIENTS',
          resourceId: patient.id,
          ipAddress,
          metadata: {
            documentNumber: patient.documentNumber,
            deletedAt: now.toISOString(),
          },
        },
      });
    });

    return { message: 'Paciente eliminado lógicamente. Documento liberado para nuevos registros.' };
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}

