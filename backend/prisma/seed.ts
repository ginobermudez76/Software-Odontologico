import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- INICIANDO SEEDER DE SIGO-DENTAL ---');

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
    { code: 'CHAIR-02', name: 'Sillón Gabinete 02 (Cirugía)' },
    { code: 'CHAIR-03', name: 'Sillón Gabinete 03 (Ortodoncia)' },
  ];

  for (const chair of chairsData) {
    await prisma.dentalChair.upsert({
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
        description: 'Sillón equipado con unidad de aspiración y lámpara LED',
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
  console.log(`[+] Opciones dinámicas de menú registradas.`);

  // 5. Asignación Rol -> Opción (rol_opcion) con permisos granulares
  const roleAssignments: { role: string; option: string; r: boolean; w: boolean; d: boolean }[] = [
    // ADMIN_TI: Acceso total al sistema
    ...menuOptionsData.map((o) => ({ role: 'ADMIN_TI', option: o.optionCode, r: true, w: true, d: true })),

    // DIRECTOR_MEDICO: Auditoría, agenda, expediente, reportes, caja supervisión
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

    // ODONTOLOGO: Clínica, odontograma, periodonto, sus citas, pacientes
    { role: 'ODONTOLOGO', option: 'OPT_DASHBOARD', r: true, w: false, d: false },
    { role: 'ODONTOLOGO', option: 'OPT_PATIENTS', r: true, w: true, d: false },
    { role: 'ODONTOLOGO', option: 'OPT_APPOINTMENTS', r: true, w: true, d: false },
    { role: 'ODONTOLOGO', option: 'OPT_CLINICAL_RECORDS', r: true, w: true, d: false },
    { role: 'ODONTOLOGO', option: 'OPT_PERIODONTOGRAM', r: true, w: true, d: false },
    { role: 'ODONTOLOGO', option: 'OPT_COMMISSIONS', r: true, w: false, d: false },

    // RECEPCIONISTA: Agenda, pacientes, turnos
    { role: 'RECEPCIONISTA', option: 'OPT_DASHBOARD', r: true, w: false, d: false },
    { role: 'RECEPCIONISTA', option: 'OPT_PATIENTS', r: true, w: true, d: false },
    { role: 'RECEPCIONISTA', option: 'OPT_APPOINTMENTS', r: true, w: true, d: true },
    { role: 'RECEPCIONISTA', option: 'OPT_POS', r: true, w: true, d: false },
    { role: 'RECEPCIONISTA', option: 'OPT_CASH_REGISTER', r: true, w: true, d: false },

    // CAJERO: POS, arqueo ciego, facturación
    { role: 'CAJERO', option: 'OPT_DASHBOARD', r: true, w: false, d: false },
    { role: 'CAJERO', option: 'OPT_PATIENTS', r: true, w: false, d: false },
    { role: 'CAJERO', option: 'OPT_POS', r: true, w: true, d: false },
    { role: 'CAJERO', option: 'OPT_CASH_REGISTER', r: true, w: true, d: false },

    // CONTADOR: Comisiones, caja auditada, inventario valorizado
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
        update: {
          lectura: asg.r,
          escritura: asg.w,
          borrado: asg.d,
        },
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
  console.log(`[+] Tabla rol_opcion vinculada con permisos de lectura/escritura/borrado.`);

  // 6. Usuarios Iniciales del Sistema
  const defaultPasswordHash = await bcrypt.hash('Admin123456!', 10);
  const usersToSeed = [
    {
      email: 'admin@sigodental.com',
      documentNumber: '1700000001',
      firstName: 'Administrador',
      lastName: 'del Sistema',
      role: 'ADMIN_TI',
    },
    {
      email: 'director@sigodental.com',
      documentNumber: '1700000002',
      firstName: 'Dr. Roberto',
      lastName: 'Méndez',
      role: 'DIRECTOR_MEDICO',
    },
    {
      email: 'odontologo@sigodental.com',
      documentNumber: '1700000003',
      firstName: 'Dra. Carla',
      lastName: 'Ortiz',
      role: 'ODONTOLOGO',
    },
    {
      email: 'recepcion@sigodental.com',
      documentNumber: '1700000004',
      firstName: 'Mariana',
      lastName: 'Silva',
      role: 'RECEPCIONISTA',
    },
    {
      email: 'caja@sigodental.com',
      documentNumber: '1700000005',
      firstName: 'Andrea',
      lastName: 'Solís',
      role: 'CAJERO',
    },
  ];

  for (const u of usersToSeed) {
    const role = createdRoles[u.role];
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
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
  console.log(`[+] Usuarios iniciales dados de alta.`);
  console.log('--- SEEDER COMPLETADO CON ÉXITO ---');
}

main()
  .catch((e) => {
    console.error('Error en seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

