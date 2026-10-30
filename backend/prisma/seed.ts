import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- INICIANDO SEEDER INTEGRAL DE SIGO-DENTAL ---');

  // 1. Sede Principal
  const branch = await prisma.branch.upsert({
    where: { code: 'SEDE-CENTRAL' },
    update: {},
    create: {
      code: 'SEDE-CENTRAL',
      name: 'Clínica Odontológica Central',
      address: 'Av. Médica 450 y Naciones Unidas',
      phone: '+593 2 298 7654',
      email: 'central@sigodental.com',
    },
  });
  console.log(`[+] Sede creada: ${branch.name}`);

  // 2. Sillones Dentales Físicos
  const chairsData = [
    { code: 'CHAIR-01', name: 'Sillón Gabinete 01 (General)' },
    { code: 'CHAIR-02', name: 'Sillón Gabinete 02 (Cirugía & Periodoncia)' },
    { code: 'CHAIR-03', name: 'Sillón Gabinete 03 (Ortodoncia)' },
  ];

  const createdChairs: Record<string, any> = {};
  for (const chair of chairsData) {
    createdChairs[chair.code] = await prisma.dentalChair.upsert({
      where: {
        branchId_code: {
          branchId: branch.id,
          code: chair.code,
        },
      },
      update: {},
      create: {
        branchId: branch.id,
        code: chair.code,
        name: chair.name,
        description: 'Sillón equipado con unidad de aspiración de alta potencia y lámpara LED',
      },
    });
  }
  console.log(`[+] Sillones dentales registrados.`);

  // 3. Roles del Sistema con booleanos lectura, escritura, borrado
  const rolesData = [
    { name: 'ADMIN_TI', description: 'Administrador de infraestructura y seguridad', lectura: true, escritura: true, borrado: true },
    { name: 'DIRECTOR_MEDICO', description: 'Director Médico y supervisor general', lectura: true, escritura: true, borrado: true },
    { name: 'ODONTOLOGO', description: 'Cirujano Dentista / Odontólogo Especialista', lectura: true, escritura: true, borrado: false },
    { name: 'ASISTENTE_DENTAL', description: 'Asistente de gabinete y soporte clínico', lectura: true, escritura: true, borrado: false },
    { name: 'RECEPCIONISTA', description: 'Recepción, agendamiento y atención a pacientes', lectura: true, escritura: true, borrado: false },
    { name: 'CAJERO', description: 'Caja, cobranzas y facturación fiscal', lectura: true, escritura: true, borrado: false },
    { name: 'CONTADOR', description: 'Contabilidad, arqueos y liquidaciones', lectura: true, escritura: true, borrado: false },
    { name: 'PACIENTE', description: 'Paciente usuario del portal clínico', lectura: true, escritura: false, borrado: false },
  ];

  const createdRoles: Record<string, any> = {};
  for (const r of rolesData) {
    createdRoles[r.name] = await prisma.role.upsert({
      where: { name: r.name },
      update: {
        lectura: r.lectura,
        escritura: r.escritura,
        borrado: r.borrado,
      },
      create: r,
    });
  }
  console.log(`[+] Roles del sistema configurados.`);

  // 4. Catálogo de Opciones de Menú (Dynamic Navigation)
  const menuOptionsData = [
    { optionCode: 'OPT_DASHBOARD', title: 'Dashboard', frontendRoute: '/dashboard', materialIcon: 'analytics', orderIndex: 10 },
    { optionCode: 'OPT_PATIENTS', title: 'Pacientes', frontendRoute: '/patients', materialIcon: 'person_search', orderIndex: 20 },
    { optionCode: 'OPT_APPOINTMENTS', title: 'Agenda de Citas', frontendRoute: '/appointments', materialIcon: 'calendar_month', orderIndex: 30 },
    { optionCode: 'OPT_CLINICAL_RECORDS', title: 'Expediente & Odontograma', frontendRoute: '/clinical-records', materialIcon: 'dentistry', orderIndex: 40 },
    { optionCode: 'OPT_PERIODONTOGRAM', title: 'Periodontograma', frontendRoute: '/periodontogram', materialIcon: 'vital_signs', orderIndex: 50 },
    { optionCode: 'OPT_POS', title: 'Punto de Venta (POS)', frontendRoute: '/billing/pos', materialIcon: 'receipt_long', orderIndex: 60 },
    { optionCode: 'OPT_CASH_REGISTER', title: 'Arqueo de Caja', frontendRoute: '/billing/cash-register', materialIcon: 'point_of_sale', orderIndex: 70 },
    { optionCode: 'OPT_INVENTORY', title: 'Inventario Clínico', frontendRoute: '/inventory', materialIcon: 'inventory_2', orderIndex: 80 },
    { optionCode: 'OPT_COMMISSIONS', title: 'Liquidación Honorarios', frontendRoute: '/financial/commissions', materialIcon: 'payments', orderIndex: 90 },
    { optionCode: 'OPT_AUDIT', title: 'Auditoría Forense', frontendRoute: '/security/audit-logs', materialIcon: 'security', orderIndex: 100 },
    { optionCode: 'OPT_USERS', title: 'Usuarios y Roles', frontendRoute: '/settings/users', materialIcon: 'manage_accounts', orderIndex: 110 },
  ];

  const createdOptions: Record<string, any> = {};
  for (const opt of menuOptionsData) {
    createdOptions[opt.optionCode] = await prisma.menuOption.upsert({
      where: { optionCode: opt.optionCode },
      update: opt,
      create: opt,
    });
  }

  // 5. Asignación Rol -> Opción (rol_opcion)
  const roleAssignments: { role: string; option: string; r: boolean; w: boolean; d: boolean }[] = [
    // ADMIN_TI
    ...menuOptionsData.map((o) => ({ role: 'ADMIN_TI', option: o.optionCode, r: true, w: true, d: true })),
    // DIRECTOR_MEDICO
    { role: 'DIRECTOR_MEDICO', option: 'OPT_DASHBOARD', r: true, w: true, d: false },
    { role: 'DIRECTOR_MEDICO', option: 'OPT_PATIENTS', r: true, w: true, d: true },
    { role: 'DIRECTOR_MEDICO', option: 'OPT_APPOINTMENTS', r: true, w: true, d: true },
    { role: 'DIRECTOR_MEDICO', option: 'OPT_CLINICAL_RECORDS', r: true, w: true, d: false },
    { role: 'DIRECTOR_MEDICO', option: 'OPT_PERIODONTOGRAM', r: true, w: true, d: false },
    { role: 'DIRECTOR_MEDICO', option: 'OPT_POS', r: true, w: false, d: false },
    { role: 'DIRECTOR_MEDICO', option: 'OPT_CASH_REGISTER', r: true, w: true, d: false },
    { role: 'DIRECTOR_MEDICO', option: 'OPT_INVENTORY', r: true, w: true, d: false },
    { role: 'DIRECTOR_MEDICO', option: 'OPT_COMMISSIONS', r: true, w: true, d: false },
    { role: 'DIRECTOR_MEDICO', option: 'OPT_AUDIT', r: true, w: false, d: false },
    // ODONTOLOGO
    { role: 'ODONTOLOGO', option: 'OPT_DASHBOARD', r: true, w: false, d: false },
    { role: 'ODONTOLOGO', option: 'OPT_PATIENTS', r: true, w: true, d: false },
    { role: 'ODONTOLOGO', option: 'OPT_APPOINTMENTS', r: true, w: true, d: false },
    { role: 'ODONTOLOGO', option: 'OPT_CLINICAL_RECORDS', r: true, w: true, d: false },
    { role: 'ODONTOLOGO', option: 'OPT_PERIODONTOGRAM', r: true, w: true, d: false },
    { role: 'ODONTOLOGO', option: 'OPT_COMMISSIONS', r: true, w: false, d: false },
    // RECEPCIONISTA
    { role: 'RECEPCIONISTA', option: 'OPT_DASHBOARD', r: true, w: false, d: false },
    { role: 'RECEPCIONISTA', option: 'OPT_PATIENTS', r: true, w: true, d: false },
    { role: 'RECEPCIONISTA', option: 'OPT_APPOINTMENTS', r: true, w: true, d: true },
    { role: 'RECEPCIONISTA', option: 'OPT_POS', r: true, w: true, d: false },
    { role: 'RECEPCIONISTA', option: 'OPT_CASH_REGISTER', r: true, w: true, d: false },
    // CAJERO
    { role: 'CAJERO', option: 'OPT_DASHBOARD', r: true, w: false, d: false },
    { role: 'CAJERO', option: 'OPT_PATIENTS', r: true, w: false, d: false },
    { role: 'CAJERO', option: 'OPT_POS', r: true, w: true, d: false },
    { role: 'CAJERO', option: 'OPT_CASH_REGISTER', r: true, w: true, d: false },
    // CONTADOR
    { role: 'CONTADOR', option: 'OPT_DASHBOARD', r: true, w: false, d: false },
    { role: 'CONTADOR', option: 'OPT_POS', r: true, w: false, d: false },
    { role: 'CONTADOR', option: 'OPT_CASH_REGISTER', r: true, w: true, d: false },
    { role: 'CONTADOR', option: 'OPT_COMMISSIONS', r: true, w: true, d: false },
    { role: 'CONTADOR', option: 'OPT_INVENTORY', r: true, w: true, d: false },
    { role: 'CONTADOR', option: 'OPT_AUDIT', r: true, w: false, d: false },
  ];

  for (const asg of roleAssignments) {
    const r = createdRoles[asg.role];
    const opt = createdOptions[asg.option];
    if (r && opt) {
      await prisma.roleMenuOption.upsert({
        where: {
          roleId_menuOptionId: {
            roleId: r.id,
            menuOptionId: opt.id,
          },
        },
        update: { lectura: asg.r, escritura: asg.w, borrado: asg.d },
        create: {
          roleId: r.id,
          menuOptionId: opt.id,
          lectura: asg.r,
          escritura: asg.w,
          borrado: asg.d,
        },
      });
    }
  }
  console.log(`[+] Tabla rol_opcion vinculada con permisos.`);

  // 6. Usuarios del Sistema
  const defaultPasswordHash = await bcrypt.hash('Admin123456!', 10);
  const usersToSeed = [
    { email: 'admin@sigodental.com', documentNumber: '1700000001', firstName: 'Administrador', lastName: 'del Sistema', role: 'ADMIN_TI' },
    { email: 'director@sigodental.com', documentNumber: '1700000002', firstName: 'Dr. Roberto', lastName: 'Méndez', role: 'DIRECTOR_MEDICO' },
    { email: 'odontologo@sigodental.com', documentNumber: '1700000003', firstName: 'Dra. Carla', lastName: 'Ortiz', role: 'ODONTOLOGO' },
    { email: 'recepcion@sigodental.com', documentNumber: '1700000004', firstName: 'Mariana', lastName: 'Silva', role: 'RECEPCIONISTA' },
    { email: 'caja@sigodental.com', documentNumber: '1700000005', firstName: 'Andrea', lastName: 'Solís', role: 'CAJERO' },
    { email: 'cajero@sigodental.com', documentNumber: '1700000010', firstName: 'Juan Carlos', lastName: 'Pérez', role: 'CAJERO' },
    { email: 'contador@sigodental.com', documentNumber: '1700000007', firstName: 'CPA. Marco', lastName: 'Silva', role: 'CONTADOR' },
  ];

  const createdUsers: Record<string, any> = {};
  for (const u of usersToSeed) {
    const role = createdRoles[u.role];
    createdUsers[u.email] = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        passwordHash: defaultPasswordHash,
      },
      create: {
        roleId: role.id,
        branchId: branch.id,
        documentType: 'DNI',
        documentNumber: u.documentNumber,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        passwordHash: defaultPasswordHash,
        phone: '+593 99 123 4567',
        isActive: true,
      },
    });
  }
  console.log(`[+] Usuarios del personal clínico y administrativo dados de alta.`);

  // 7. Turno de Caja (CashShift)
  const cashShift = await prisma.cashShift.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      branchId: branch.id,
      cashierId: createdUsers['cajero@sigodental.com'].id,
      openingBalance: 150.00,
      status: 'ABIERTA',
      notes: 'Turno matutino de caja general iniciado con fondo base de $150.00 en efectivo.',
    },
  });
  console.log(`[+] Turno de caja general abierto.`);

  // 8. Pacientes Ficticios con Datos Clínicos Creíbles
  const patientsData = [
    {
      dni: '1718294012',
      firstName: 'Valeria Sofía',
      lastName: 'Montesdeoca Cárdenas',
      birthDate: new Date('1998-05-14'),
      gender: 'FEMENINO',
      email: 'valeria.montesdeoca@gmail.com',
      phone: '+593 99 812 3456',
      address: 'Av. 6 de Diciembre y Eloy Alfaro, Edif. Platinum Torre A, Dpto 402',
      alerts: { allergies: ['Penicilina G', 'Amoxicilina'], systemicConditions: ['Hipotensión postural'], bleedingRisk: false },
      recordNumber: 'EXP-2026-0001',
    },
    {
      dni: '1729384756',
      firstName: 'Mateo Sebastián',
      lastName: 'Benalcázar Proaño',
      birthDate: new Date('1992-11-23'),
      gender: 'MASCULINO',
      email: 'mateo.benalcazar@outlook.com',
      phone: '+593 98 456 7890',
      address: 'Calle La Niña y Av. Amazonas, Res. El Bosque Casa 12',
      alerts: { allergies: [], systemicConditions: ['Hipertensión arterial controlada'], bleedingRisk: true },
      recordNumber: 'EXP-2026-0002',
    },
    {
      dni: '1708492019',
      firstName: 'Camila Andrea',
      lastName: 'Villacrés Paredes',
      birthDate: new Date('2002-03-08'),
      gender: 'FEMENINO',
      email: 'camila.villacres@hotmail.com',
      phone: '+593 99 123 8475',
      address: 'Av. República de El Salvador 820 y Suecia, Edif. Suecia Plaza',
      alerts: { allergies: ['Látex'], systemicConditions: [], bleedingRisk: false },
      recordNumber: 'EXP-2026-0003',
    },
    {
      dni: '0918273645',
      firstName: 'Carlos Andrés',
      lastName: 'Morales Espinoza',
      birthDate: new Date('1981-08-30'),
      gender: 'MASCULINO',
      email: 'carlos.morales@corporacion.ec',
      phone: '+593 99 765 4321',
      address: 'Cumbayá, Paseo San Francisco, Urb. San Antonio Lote 8',
      alerts: { allergies: [], systemicConditions: ['Diabetes Tipo 2 compensada'], bleedingRisk: false },
      recordNumber: 'EXP-2026-0004',
    },
    {
      dni: '1750293841',
      firstName: 'Lucía Valentina',
      lastName: 'Guayasamín Peña',
      birthDate: new Date('2005-09-17'),
      gender: 'FEMENINO',
      email: 'lucia.guayasamin@gmail.com',
      phone: '+593 98 765 1234',
      address: 'Av. Brasil y Edmundo Carvajal, Condominio Los Pinos',
      alerts: { allergies: ['AINEs (Ibuprofeno)'], systemicConditions: [], bleedingRisk: false },
      recordNumber: 'EXP-2026-0005',
    },
    {
      dni: '1712948576',
      firstName: 'Santiago David',
      lastName: 'Cevallos Hidalgo',
      birthDate: new Date('1985-01-12'),
      gender: 'MASCULINO',
      email: 'santiago.cevallos@seguros.ec',
      phone: '+593 99 432 1987',
      address: 'Monteserrín, Calle De Las Alondras N45-12',
      alerts: { allergies: [], systemicConditions: ['Bruxismo céntrico severo'], bleedingRisk: false },
      recordNumber: 'EXP-2026-0006',
    },
    {
      dni: '1723849102',
      firstName: 'Isabella María',
      lastName: 'Andrade Viteri',
      birthDate: new Date('2018-06-25'),
      gender: 'FEMENINO',
      email: 'roberto.andrade.padre@gmail.com',
      phone: '+593 98 901 2345',
      address: 'La Carolina, Av. Shyris y República de El Salvador',
      alerts: { allergies: [], systemicConditions: ['Paciente pediátrico'], bleedingRisk: false },
      recordNumber: 'EXP-2026-0007',
    },
    {
      dni: '1709283746',
      firstName: 'Diego Alejandro',
      lastName: 'Navarrete Falconí',
      birthDate: new Date('1974-12-04'),
      gender: 'MASCULINO',
      email: 'diego.navarrete@constructora.ec',
      phone: '+593 99 345 6789',
      address: 'Bellavista, Av. 33 Orientales y Guanguiltagua',
      alerts: { allergies: [], systemicConditions: ['Fumador crónico'], bleedingRisk: false },
      recordNumber: 'EXP-2026-0008',
    },
  ];

  const createdPatients: Record<string, any> = {};
  for (const p of patientsData) {
    const patient = await prisma.patient.upsert({
      where: { documentNumber: p.dni },
      update: {
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone,
        address: p.address,
      },
      create: {
        branchId: branch.id,
        documentType: 'DNI',
        documentNumber: p.dni,
        firstName: p.firstName,
        lastName: p.lastName,
        birthDate: p.birthDate,
        gender: p.gender,
        email: p.email,
        phone: p.phone,
        address: p.address,
        isActive: true,
      },
    });

    createdPatients[p.dni] = patient;

    // Crear o actualizar su Expediente Clínico Digital
    await prisma.clinicalRecord.upsert({
      where: { patientId: patient.id },
      update: {
        visibleAlerts: p.alerts,
      },
      create: {
        patientId: patient.id,
        recordNumber: p.recordNumber,
        pathologiesEncrypted: 'U2FsdGVkX18mZ9...[Cifrado AES-256-GCM LOPDP]',
        allergiesEncrypted: 'U2FsdGVkX1+x8k...[Cifrado AES-256-GCM LOPDP]',
        visibleAlerts: p.alerts,
        initialOdontogram: {
          tooth46: { state: 'CARIES', surface: ['O'], color: '#ef4444' },
          tooth36: { state: 'RESTAURADO', surface: ['O', 'D'], color: '#3b82f6' },
          tooth16: { state: 'ENDODONCIA', surface: ['ROOT'], color: '#3b82f6' },
          tooth21: { state: 'AUSENTE', surface: ['ALL'], color: '#10b981' },
        },
        evolutionaryOdontogram: {
          tooth46: { state: 'OBTURADO', surface: ['O'], color: '#3b82f6' },
          tooth21: { state: 'PROYECTO_IMPLANTE', surface: ['ROOT'], color: '#f59e0b' },
        },
        periodontogramData: {
          probedPockets: [
            { tooth: 16, ps: 4, mg: 1, nic: 5, bleeding: true },
            { tooth: 26, ps: 5, mg: 2, nic: 7, bleeding: true },
            { tooth: 36, ps: 3, mg: 0, nic: 3, bleeding: false },
          ],
        },
      },
    });
  }
  console.log(`[+] 8 Pacientes ficticios registrados con sus expedientes odontológicos.`);

  // 9. Citas Odontológicas (Appointments)
  const now = new Date();
  const todayAt = (hours: number, minutes: number = 0) => {
    const d = new Date(now);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };
  const tomorrowAt = (hours: number, minutes: number = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };
  const yesterdayAt = (hours: number, minutes: number = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const doctor1 = createdUsers['odontologo@sigodental.com'];
  const doctor2 = createdUsers['director@sigodental.com'];

  const appointmentsData = [
    {
      patient: createdPatients['1718294012'], // Valeria Montesdeoca
      doctor: doctor1,
      chair: createdChairs['CHAIR-01'],
      start: todayAt(9, 0),
      end: todayAt(10, 0),
      status: 'ATENDIDO',
      reason: 'Restauración oclusal con resina fotocurable compuesta y profilaxis dental',
    },
    {
      patient: createdPatients['1729384756'], // Mateo Benalcázar
      doctor: doctor2,
      chair: createdChairs['CHAIR-02'],
      start: todayAt(11, 0),
      end: todayAt(12, 0),
      status: 'ATENDIDO',
      reason: 'Raspado y alisado radicular (RAR) por sextante anteroinferior',
    },
    {
      patient: createdPatients['1708492019'], // Camila Villacrés
      doctor: doctor1,
      chair: createdChairs['CHAIR-03'],
      start: todayAt(14, 0),
      end: todayAt(15, 0),
      status: 'EN_SALA',
      reason: 'Control mensual y cambio de arcos de ortodoncia autoligable',
    },
    {
      patient: createdPatients['1723849102'], // Isabella Andrade
      doctor: doctor1,
      chair: createdChairs['CHAIR-01'],
      start: todayAt(16, 0),
      end: todayAt(17, 0),
      status: 'CONFIRMADO',
      reason: 'Sellantes de fosas y fisuras en piezas 16, 26, 36 y fluorización tópica',
    },
    {
      patient: createdPatients['0918273645'], // Carlos Morales
      doctor: doctor2,
      chair: createdChairs['CHAIR-02'],
      start: tomorrowAt(10, 0),
      end: tomorrowAt(11, 30),
      status: 'PROGRAMADO',
      reason: 'Toma de impresión definitiva y prueba de pilar de implante de zirconio pieza 21',
    },
    {
      patient: createdPatients['1750293841'], // Lucía Guayasamín
      doctor: doctor2,
      chair: createdChairs['CHAIR-02'],
      start: tomorrowAt(15, 0),
      end: tomorrowAt(16, 30),
      status: 'PROGRAMADO',
      reason: 'Exodoncia quirúrgica compleja de terceros molares inferiores incluidos',
    },
    {
      patient: createdPatients['1712948576'], // Santiago Cevallos
      doctor: doctor1,
      chair: createdChairs['CHAIR-01'],
      start: tomorrowAt(9, 30),
      end: tomorrowAt(10, 30),
      status: 'PROGRAMADO',
      reason: 'Entrega y ajuste de férula miorrelajante rígida de descarga nocturna',
    },
    {
      patient: createdPatients['1709283746'], // Diego Navarrete
      doctor: doctor1,
      chair: createdChairs['CHAIR-01'],
      start: yesterdayAt(15, 0),
      end: yesterdayAt(16, 0),
      status: 'ATENDIDO',
      reason: 'Obturación estética clase V cervical con ionómero vítreo y resina',
    },
  ];

  const createdAppointments: any[] = [];
  for (const app of appointmentsData) {
    const existing = await prisma.appointment.findFirst({
      where: {
        patientId: app.patient.id,
        startDateTime: app.start,
      },
    });

    if (!existing) {
      const created = await prisma.appointment.create({
        data: {
          branchId: branch.id,
          patientId: app.patient.id,
          doctorId: app.doctor.id,
          chairId: app.chair.id,
          startDateTime: app.start,
          endDateTime: app.end,
          status: app.status,
          reason: app.reason,
        },
      });
      createdAppointments.push(created);
    } else {
      createdAppointments.push(existing);
    }
  }
  console.log(`[+] Citas agendadas en los 3 gabinetes dentales.`);

  // 10. Facturación y Cobranzas (Invoices & Payments)
  const cashier = createdUsers['cajero@sigodental.com'];
  const invoicesData = [
    {
      appointment: createdAppointments[0], // Valeria Montesdeoca ($85.00)
      patient: createdPatients['1718294012'],
      seriesNumber: 'FAC-001-000001',
      subtotal: 75.89,
      tax: 9.11,
      total: 85.00,
      payments: [
        { method: 'EFECTIVO', amount: 50.00, ref: 'BILLETES_EFECTIVO' },
        { method: 'TARJETA', amount: 35.00, ref: 'DATAFAST_VISA_4829' },
      ],
    },
    {
      appointment: createdAppointments[1], // Mateo Benalcázar ($160.00)
      patient: createdPatients['1729384756'],
      seriesNumber: 'FAC-001-000002',
      subtotal: 142.86,
      tax: 17.14,
      total: 160.00,
      payments: [
        { method: 'TRANSFERENCIA', amount: 160.00, ref: 'TRANSF_BANCO_PICHINCHA_91823' },
      ],
    },
    {
      appointment: createdAppointments[7], // Diego Navarrete ($110.00)
      patient: createdPatients['1709283746'],
      seriesNumber: 'FAC-001-000003',
      subtotal: 98.21,
      tax: 11.79,
      total: 110.00,
      payments: [
        { method: 'TARJETA', amount: 110.00, ref: 'MEDIANET_MASTERCARD_1029' },
      ],
    },
    {
      appointment: createdAppointments[2], // Camila Villacrés ($70.00 anticipo)
      patient: createdPatients['1708492019'],
      seriesNumber: 'FAC-001-000004',
      subtotal: 62.50,
      tax: 7.50,
      total: 70.00,
      payments: [
        { method: 'TARJETA', amount: 70.00, ref: 'DATAFAST_DEBITO_3321' },
      ],
    },
  ];

  for (const inv of invoicesData) {
    const existing = await prisma.invoice.findUnique({
      where: { seriesNumber: inv.seriesNumber },
    });

    if (!existing) {
      await prisma.invoice.create({
        data: {
          appointmentId: inv.appointment?.id,
          patientId: inv.patient.id,
          cashierId: cashier.id,
          invoiceType: 'FACTURA',
          seriesNumber: inv.seriesNumber,
          subtotal: inv.subtotal,
          tax: inv.tax,
          total: inv.total,
          fiscalStatus: 'AUTORIZADO_SRI',
          cufeCae: `1030202601179238475001200100100000${inv.seriesNumber.slice(-4)}1234567819`,
          paymentDetails: {
            create: inv.payments.map((p) => ({
              paymentMethod: p.method,
              amount: p.amount,
              voucherReference: p.ref,
            })),
          },
        },
      });
    }
  }
  console.log(`[+] Facturas fiscales emitidas con métodos de pago combinados.`);

  // 11. Insumos Odontológicos y Lotes FEFO (Inventario)
  const suppliesData = [
    {
      sku: 'SUP-001',
      name: 'Resina Compuesta Nanohíbrida 3M Filtek Z250 (4g)',
      brand: '3M ESPE',
      unit: 'Jeringa',
      minStock: 5,
      currentStock: 25,
      unitCost: 28.50,
      batchNumber: 'L-2026-A1',
      expiresInMonths: 4,
    },
    {
      sku: 'SUP-002',
      name: 'Anestésico Dental Lidocaína 2% + Epinefrina 1:100.000 (Caja x 50)',
      brand: 'New Stetic',
      unit: 'Caja',
      minStock: 3,
      currentStock: 15,
      unitCost: 32.00,
      batchNumber: 'L-2026-B4',
      expiresInMonths: 8,
    },
    {
      sku: 'SUP-003',
      name: 'Agujas Dentales Descartables Cortas 30G (Caja x 100)',
      brand: 'Septodont',
      unit: 'Caja',
      minStock: 10,
      currentStock: 40,
      unitCost: 12.00,
      batchNumber: 'L-2026-C2',
      expiresInMonths: 12,
    },
    {
      sku: 'SUP-004',
      name: 'Guantes de Examen de Nitrilo Talla M (Caja x 100)',
      brand: 'Cranberry',
      unit: 'Caja',
      minStock: 15,
      currentStock: 60,
      unitCost: 8.50,
      batchNumber: 'L-2026-D1',
      expiresInMonths: 18,
    },
    {
      sku: 'SUP-005',
      name: 'Brackets Metálicos Autoligables Roth .022 (Caso 5x5)',
      brand: 'Morelli',
      unit: 'Caso',
      minStock: 2,
      currentStock: 10,
      unitCost: 65.00,
      batchNumber: 'L-2026-E9',
      expiresInMonths: 24,
    },
  ];

  for (const s of suppliesData) {
    let supply = await prisma.clinicalSupply.findFirst({
      where: { sku: s.sku },
    });

    if (!supply) {
      supply = await prisma.clinicalSupply.create({
        data: {
          sku: s.sku,
          name: s.name,
          brand: s.brand,
          unit: s.unit,
          minStock: s.minStock,
          currentStock: s.currentStock,
        },
      });
    } else {
      supply = await prisma.clinicalSupply.update({
        where: { id: supply.id },
        data: { currentStock: s.currentStock },
      });
    }

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + s.expiresInMonths);

    const existingBatch = await prisma.supplyBatch.findFirst({
      where: {
        supplyId: supply.id,
        batchNumber: s.batchNumber,
      },
    });

    if (!existingBatch) {
      await prisma.supplyBatch.create({
        data: {
          supplyId: supply.id,
          batchNumber: s.batchNumber,
          initialQuantity: s.currentStock,
          availableQuantity: s.currentStock,
          unitCost: s.unitCost,
          expirationDate: expiryDate,
        },
      });
    }
  }
  console.log(`[+] Inventario de insumos clínicos y lotes FEFO registrados.`);

  // 12. Catálogo de Procedimientos y Presupuestos
  const procOrtInstalacion = await prisma.procedureCatalog.upsert({
    where: { id: '00000000-0000-0000-0000-000000000101' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000101',
      code: 'ORT-01',
      name: 'Cementado de Brackets Autoligables Superiores e Inferiores',
      category: 'Ortodoncia',
      basePrice: 400.00,
      suggestedLabCost: 0,
      durationMinutes: 60,
    },
  });

  const procOrtControl = await prisma.procedureCatalog.upsert({
    where: { id: '00000000-0000-0000-0000-000000000102' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000102',
      code: 'ORT-02',
      name: 'Controles Mensuales y Ajustes de Ortodoncia',
      category: 'Ortodoncia',
      basePrice: 50.00,
      suggestedLabCost: 0,
      durationMinutes: 30,
    },
  });

  const patientCamila = createdPatients['1708492019'];
  const planCamila = await prisma.treatmentPlan.upsert({
    where: { planCode: 'PRE-2026-0001' },
    update: {},
    create: {
      patientId: patientCamila.id,
      doctorId: doctor1.id,
      planCode: 'PRE-2026-0001',
      title: 'Tratamiento Integral de Ortodoncia Autoligable',
      description: 'Corrección de apiñamiento anteroinferior y mordida profunda clase II',
      totalAmount: 1000.00,
      status: 'APROBADO',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // RN-04: 30 días
      phases: {
        create: [
          {
            phaseNumber: 1,
            name: 'Alineación y Nivelación',
            status: 'EN_PROCESO',
            subtotal: 400.00,
            items: {
              create: [
                {
                  procedureId: procOrtInstalacion.id,
                  quantity: 1,
                  unitPrice: 400.00,
                  finalPrice: 400.00,
                  status: 'APROBADO',
                },
              ],
            },
          },
          {
            phaseNumber: 2,
            name: 'Cierre de Espacios y Mecánica',
            status: 'PENDIENTE',
            subtotal: 600.00,
            items: {
              create: [
                {
                  procedureId: procOrtControl.id,
                  quantity: 12,
                  unitPrice: 50.00,
                  finalPrice: 600.00,
                  status: 'PENDIENTE',
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`[+] Plan de tratamiento y presupuesto registrado: ${planCamila.title}`);

  console.log('=======================================================');
  console.log('  --- SEEDER INTEGRAL DE SIGO-DENTAL COMPLETADO ---');
  console.log('=======================================================');
}

main()
  .catch((e) => {
    console.error('Error en seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
