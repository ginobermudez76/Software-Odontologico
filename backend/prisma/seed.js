"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcrypt = require("bcryptjs");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var branch, chairsData, createdChairs, _i, chairsData_1, chair, _a, _b, rolesData, createdRoles, _c, rolesData_1, r, _d, _e, menuOptionsData, createdOptions, _f, menuOptionsData_1, opt, _g, _h, roleAssignments, _j, roleAssignments_1, asg, r, opt, defaultPasswordHash, usersToSeed, createdUsers, _k, usersToSeed_1, u, role, _l, _m, cashShift, patientsData, createdPatients, _o, patientsData_1, p, patient, now, todayAt, tomorrowAt, yesterdayAt, doctor1, doctor2, appointmentsData, createdAppointments, _p, appointmentsData_1, app, existing, created, cashier, invoicesData, _q, invoicesData_1, inv, existing, suppliesData, _r, suppliesData_1, s, supply, expiryDate, existingBatch, procOrtInstalacion, procOrtControl, patientCamila, planCamila;
        var _s;
        return __generator(this, function (_t) {
            switch (_t.label) {
                case 0:
                    console.log('--- INICIANDO SEEDER INTEGRAL DE SIGO-DENTAL ---');
                    return [4 /*yield*/, prisma.branch.upsert({
                            where: { code: 'SEDE-CENTRAL' },
                            update: {},
                            create: {
                                code: 'SEDE-CENTRAL',
                                name: 'Clínica Odontológica Central',
                                address: 'Av. Médica 450 y Naciones Unidas',
                                phone: '+593 2 298 7654',
                                email: 'central@sigodental.com',
                            },
                        })];
                case 1:
                    branch = _t.sent();
                    console.log("[+] Sede creada: ".concat(branch.name));
                    chairsData = [
                        { code: 'CHAIR-01', name: 'Sillón Gabinete 01 (General)' },
                        { code: 'CHAIR-02', name: 'Sillón Gabinete 02 (Cirugía & Periodoncia)' },
                        { code: 'CHAIR-03', name: 'Sillón Gabinete 03 (Ortodoncia)' },
                    ];
                    createdChairs = {};
                    _i = 0, chairsData_1 = chairsData;
                    _t.label = 2;
                case 2:
                    if (!(_i < chairsData_1.length)) return [3 /*break*/, 5];
                    chair = chairsData_1[_i];
                    _a = createdChairs;
                    _b = chair.code;
                    return [4 /*yield*/, prisma.dentalChair.upsert({
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
                        })];
                case 3:
                    _a[_b] = _t.sent();
                    _t.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log("[+] Sillones dentales registrados.");
                    rolesData = [
                        { name: 'ADMIN_TI', description: 'Administrador de infraestructura y seguridad', lectura: true, escritura: true, borrado: true },
                        { name: 'DIRECTOR_MEDICO', description: 'Director Médico y supervisor general', lectura: true, escritura: true, borrado: true },
                        { name: 'ODONTOLOGO', description: 'Cirujano Dentista / Odontólogo Especialista', lectura: true, escritura: true, borrado: false },
                        { name: 'ASISTENTE_DENTAL', description: 'Asistente de gabinete y soporte clínico', lectura: true, escritura: true, borrado: false },
                        { name: 'RECEPCIONISTA', description: 'Recepción, agendamiento y atención a pacientes', lectura: true, escritura: true, borrado: false },
                        { name: 'CAJERO', description: 'Caja, cobranzas y facturación fiscal', lectura: true, escritura: true, borrado: false },
                        { name: 'CONTADOR', description: 'Contabilidad, arqueos y liquidaciones', lectura: true, escritura: true, borrado: false },
                        { name: 'PACIENTE', description: 'Paciente usuario del portal clínico', lectura: true, escritura: false, borrado: false },
                    ];
                    createdRoles = {};
                    _c = 0, rolesData_1 = rolesData;
                    _t.label = 6;
                case 6:
                    if (!(_c < rolesData_1.length)) return [3 /*break*/, 9];
                    r = rolesData_1[_c];
                    _d = createdRoles;
                    _e = r.name;
                    return [4 /*yield*/, prisma.role.upsert({
                            where: { name: r.name },
                            update: {
                                lectura: r.lectura,
                                escritura: r.escritura,
                                borrado: r.borrado,
                            },
                            create: r,
                        })];
                case 7:
                    _d[_e] = _t.sent();
                    _t.label = 8;
                case 8:
                    _c++;
                    return [3 /*break*/, 6];
                case 9:
                    console.log("[+] Roles del sistema configurados.");
                    menuOptionsData = [
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
                    createdOptions = {};
                    _f = 0, menuOptionsData_1 = menuOptionsData;
                    _t.label = 10;
                case 10:
                    if (!(_f < menuOptionsData_1.length)) return [3 /*break*/, 13];
                    opt = menuOptionsData_1[_f];
                    _g = createdOptions;
                    _h = opt.optionCode;
                    return [4 /*yield*/, prisma.menuOption.upsert({
                            where: { optionCode: opt.optionCode },
                            update: opt,
                            create: opt,
                        })];
                case 11:
                    _g[_h] = _t.sent();
                    _t.label = 12;
                case 12:
                    _f++;
                    return [3 /*break*/, 10];
                case 13:
                    roleAssignments = __spreadArray(__spreadArray([], menuOptionsData.map(function (o) { return ({ role: 'ADMIN_TI', option: o.optionCode, r: true, w: true, d: true }); }), true), [
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
                    ], false);
                    _j = 0, roleAssignments_1 = roleAssignments;
                    _t.label = 14;
                case 14:
                    if (!(_j < roleAssignments_1.length)) return [3 /*break*/, 17];
                    asg = roleAssignments_1[_j];
                    r = createdRoles[asg.role];
                    opt = createdOptions[asg.option];
                    if (!(r && opt)) return [3 /*break*/, 16];
                    return [4 /*yield*/, prisma.roleMenuOption.upsert({
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
                        })];
                case 15:
                    _t.sent();
                    _t.label = 16;
                case 16:
                    _j++;
                    return [3 /*break*/, 14];
                case 17:
                    console.log("[+] Tabla rol_opcion vinculada con permisos.");
                    return [4 /*yield*/, bcrypt.hash('Admin123456!', 10)];
                case 18:
                    defaultPasswordHash = _t.sent();
                    usersToSeed = [
                        { email: 'admin@sigodental.com', documentNumber: '1700000001', firstName: 'Administrador', lastName: 'del Sistema', role: 'ADMIN_TI' },
                        { email: 'director@sigodental.com', documentNumber: '1700000002', firstName: 'Dr. Roberto', lastName: 'Méndez', role: 'DIRECTOR_MEDICO' },
                        { email: 'odontologo@sigodental.com', documentNumber: '1700000003', firstName: 'Dra. Carla', lastName: 'Ortiz', role: 'ODONTOLOGO' },
                        { email: 'recepcion@sigodental.com', documentNumber: '1700000004', firstName: 'Mariana', lastName: 'Silva', role: 'RECEPCIONISTA' },
                        { email: 'cajero@sigodental.com', documentNumber: '1700000005', firstName: 'Juan Carlos', lastName: 'Pérez', role: 'CAJERO' },
                        { email: 'caja@sigodental.com', documentNumber: '1700000006', firstName: 'Andrea', lastName: 'Solís', role: 'CAJERO' },
                        { email: 'contador@sigodental.com', documentNumber: '1700000007', firstName: 'CPA. Marco', lastName: 'Silva', role: 'CONTADOR' },
                    ];
                    createdUsers = {};
                    _k = 0, usersToSeed_1 = usersToSeed;
                    _t.label = 19;
                case 19:
                    if (!(_k < usersToSeed_1.length)) return [3 /*break*/, 22];
                    u = usersToSeed_1[_k];
                    role = createdRoles[u.role];
                    _l = createdUsers;
                    _m = u.email;
                    return [4 /*yield*/, prisma.user.upsert({
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
                        })];
                case 20:
                    _l[_m] = _t.sent();
                    _t.label = 21;
                case 21:
                    _k++;
                    return [3 /*break*/, 19];
                case 22:
                    console.log("[+] Usuarios del personal cl\u00EDnico y administrativo dados de alta.");
                    return [4 /*yield*/, prisma.cashShift.upsert({
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
                        })];
                case 23:
                    cashShift = _t.sent();
                    console.log("[+] Turno de caja general abierto.");
                    patientsData = [
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
                    createdPatients = {};
                    _o = 0, patientsData_1 = patientsData;
                    _t.label = 24;
                case 24:
                    if (!(_o < patientsData_1.length)) return [3 /*break*/, 28];
                    p = patientsData_1[_o];
                    return [4 /*yield*/, prisma.patient.upsert({
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
                        })];
                case 25:
                    patient = _t.sent();
                    createdPatients[p.dni] = patient;
                    // Crear o actualizar su Expediente Clínico Digital
                    return [4 /*yield*/, prisma.clinicalRecord.upsert({
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
                        })];
                case 26:
                    // Crear o actualizar su Expediente Clínico Digital
                    _t.sent();
                    _t.label = 27;
                case 27:
                    _o++;
                    return [3 /*break*/, 24];
                case 28:
                    console.log("[+] 8 Pacientes ficticios registrados con sus expedientes odontol\u00F3gicos.");
                    now = new Date();
                    todayAt = function (hours, minutes) {
                        if (minutes === void 0) { minutes = 0; }
                        var d = new Date(now);
                        d.setHours(hours, minutes, 0, 0);
                        return d;
                    };
                    tomorrowAt = function (hours, minutes) {
                        if (minutes === void 0) { minutes = 0; }
                        var d = new Date(now);
                        d.setDate(d.getDate() + 1);
                        d.setHours(hours, minutes, 0, 0);
                        return d;
                    };
                    yesterdayAt = function (hours, minutes) {
                        if (minutes === void 0) { minutes = 0; }
                        var d = new Date(now);
                        d.setDate(d.getDate() - 1);
                        d.setHours(hours, minutes, 0, 0);
                        return d;
                    };
                    doctor1 = createdUsers['odontologo@sigodental.com'];
                    doctor2 = createdUsers['director@sigodental.com'];
                    appointmentsData = [
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
                    createdAppointments = [];
                    _p = 0, appointmentsData_1 = appointmentsData;
                    _t.label = 29;
                case 29:
                    if (!(_p < appointmentsData_1.length)) return [3 /*break*/, 34];
                    app = appointmentsData_1[_p];
                    return [4 /*yield*/, prisma.appointment.findFirst({
                            where: {
                                patientId: app.patient.id,
                                startDateTime: app.start,
                            },
                        })];
                case 30:
                    existing = _t.sent();
                    if (!!existing) return [3 /*break*/, 32];
                    return [4 /*yield*/, prisma.appointment.create({
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
                        })];
                case 31:
                    created = _t.sent();
                    createdAppointments.push(created);
                    return [3 /*break*/, 33];
                case 32:
                    createdAppointments.push(existing);
                    _t.label = 33;
                case 33:
                    _p++;
                    return [3 /*break*/, 29];
                case 34:
                    console.log("[+] Citas agendadas en los 3 gabinetes dentales.");
                    cashier = createdUsers['cajero@sigodental.com'];
                    invoicesData = [
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
                    _q = 0, invoicesData_1 = invoicesData;
                    _t.label = 35;
                case 35:
                    if (!(_q < invoicesData_1.length)) return [3 /*break*/, 39];
                    inv = invoicesData_1[_q];
                    return [4 /*yield*/, prisma.invoice.findUnique({
                            where: { seriesNumber: inv.seriesNumber },
                        })];
                case 36:
                    existing = _t.sent();
                    if (!!existing) return [3 /*break*/, 38];
                    return [4 /*yield*/, prisma.invoice.create({
                            data: {
                                appointmentId: (_s = inv.appointment) === null || _s === void 0 ? void 0 : _s.id,
                                patientId: inv.patient.id,
                                cashierId: cashier.id,
                                invoiceType: 'FACTURA',
                                seriesNumber: inv.seriesNumber,
                                subtotal: inv.subtotal,
                                tax: inv.tax,
                                total: inv.total,
                                fiscalStatus: 'AUTORIZADO_SRI',
                                cufeCae: "1030202601179238475001200100100000".concat(inv.seriesNumber.slice(-4), "1234567819"),
                                paymentDetails: {
                                    create: inv.payments.map(function (p) { return ({
                                        paymentMethod: p.method,
                                        amount: p.amount,
                                        voucherReference: p.ref,
                                    }); }),
                                },
                            },
                        })];
                case 37:
                    _t.sent();
                    _t.label = 38;
                case 38:
                    _q++;
                    return [3 /*break*/, 35];
                case 39:
                    console.log("[+] Facturas fiscales emitidas con m\u00E9todos de pago combinados.");
                    suppliesData = [
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
                    _r = 0, suppliesData_1 = suppliesData;
                    _t.label = 40;
                case 40:
                    if (!(_r < suppliesData_1.length)) return [3 /*break*/, 49];
                    s = suppliesData_1[_r];
                    return [4 /*yield*/, prisma.clinicalSupply.findFirst({
                            where: { sku: s.sku },
                        })];
                case 41:
                    supply = _t.sent();
                    if (!!supply) return [3 /*break*/, 43];
                    return [4 /*yield*/, prisma.clinicalSupply.create({
                            data: {
                                sku: s.sku,
                                name: s.name,
                                brand: s.brand,
                                unit: s.unit,
                                minStock: s.minStock,
                                currentStock: s.currentStock,
                            },
                        })];
                case 42:
                    supply = _t.sent();
                    return [3 /*break*/, 45];
                case 43: return [4 /*yield*/, prisma.clinicalSupply.update({
                        where: { id: supply.id },
                        data: { currentStock: s.currentStock },
                    })];
                case 44:
                    supply = _t.sent();
                    _t.label = 45;
                case 45:
                    expiryDate = new Date();
                    expiryDate.setMonth(expiryDate.getMonth() + s.expiresInMonths);
                    return [4 /*yield*/, prisma.supplyBatch.findFirst({
                            where: {
                                supplyId: supply.id,
                                batchNumber: s.batchNumber,
                            },
                        })];
                case 46:
                    existingBatch = _t.sent();
                    if (!!existingBatch) return [3 /*break*/, 48];
                    return [4 /*yield*/, prisma.supplyBatch.create({
                            data: {
                                supplyId: supply.id,
                                batchNumber: s.batchNumber,
                                initialQuantity: s.currentStock,
                                availableQuantity: s.currentStock,
                                unitCost: s.unitCost,
                                expirationDate: expiryDate,
                            },
                        })];
                case 47:
                    _t.sent();
                    _t.label = 48;
                case 48:
                    _r++;
                    return [3 /*break*/, 40];
                case 49:
                    console.log("[+] Inventario de insumos cl\u00EDnicos y lotes FEFO registrados.");
                    return [4 /*yield*/, prisma.procedureCatalog.upsert({
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
                        })];
                case 50:
                    procOrtInstalacion = _t.sent();
                    return [4 /*yield*/, prisma.procedureCatalog.upsert({
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
                        })];
                case 51:
                    procOrtControl = _t.sent();
                    patientCamila = createdPatients['1708492019'];
                    return [4 /*yield*/, prisma.treatmentPlan.upsert({
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
                        })];
                case 52:
                    planCamila = _t.sent();
                    console.log("[+] Plan de tratamiento y presupuesto registrado: ".concat(planCamila.title));
                    console.log('=======================================================');
                    console.log('  --- SEEDER INTEGRAL DE SIGO-DENTAL COMPLETADO ---');
                    console.log('=======================================================');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('Error en seeder:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
