import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EmergencyContactDto {
  @ApiProperty({ example: 'Jorge Morales' })
  @IsString()
  @IsNotEmpty()
  contactName: string;

  @ApiProperty({ example: '+593 98 123 4567' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Esposo' })
  @IsString()
  @IsNotEmpty()
  relationship: string;
}

export class LegalTutorDto {
  @ApiProperty({ example: 'Carlos Salazar' })
  @IsString()
  @IsNotEmpty()
  tutorName: string;

  @ApiProperty({ example: '1718293847' })
  @IsString()
  @IsNotEmpty()
  documentNumber: string;

  @ApiProperty({ example: '+593 99 765 4321' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Padre' })
  @IsString()
  @IsNotEmpty()
  relationship: string;
}

export class InsuranceDto {
  @ApiPropertyOptional({ example: 'Dental Blue Shield' })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({ example: 'POL-992182' })
  @IsString()
  @IsOptional()
  policyNumber?: string;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  coveragePercentage?: number;
}

export class CreatePatientDto {
  @ApiProperty({ example: 'DNI' })
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @ApiProperty({ example: '1728394012' })
  @IsString()
  @IsNotEmpty()
  documentNumber: string;

  @ApiProperty({ example: 'María Elena' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Salazar Rojas' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '1995-05-14' })
  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @ApiProperty({ example: 'FEMENINO' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiPropertyOptional({ example: 'm.salazar@email.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+593 99 876 5432' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Av. Amazonas N24-10 y Colón' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ type: EmergencyContactDto })
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  @IsOptional()
  emergencyData?: EmergencyContactDto;

  @ApiPropertyOptional({ type: LegalTutorDto })
  @ValidateNested()
  @Type(() => LegalTutorDto)
  @IsOptional()
  legalTutorData?: LegalTutorDto;

  @ApiPropertyOptional({ type: InsuranceDto })
  @ValidateNested()
  @Type(() => InsuranceDto)
  @IsOptional()
  insuranceData?: InsuranceDto;

  // Antecedentes Médicos (Se cifran en backend con AES-256-GCM)
  @ApiPropertyOptional({ example: 'Hipertensión arterial controlada con Losartán 50mg' })
  @IsString()
  @IsOptional()
  pathologies?: string;

  @ApiPropertyOptional({ example: 'Alergia severa a Penicilina y derivados' })
  @IsString()
  @IsOptional()
  allergies?: string;

  @ApiPropertyOptional({ example: ['ALERGIA_PENICILINA', 'HIPERTENSION'] })
  @IsArray()
  @IsOptional()
  criticalAlerts?: string[];
}

