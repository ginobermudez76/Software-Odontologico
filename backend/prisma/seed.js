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
        var branch, chairsData, _i, chairsData_1, chair, rolesData, createdRoles, _a, rolesData_1, r, _b, _c, menuOptionsData, createdOptions, _d, menuOptionsData_1, opt, _e, _f, roleAssignments, _g, roleAssignments_1, asg, r, opt, defaultPasswordHash, usersToSeed, _h, usersToSeed_1, u, role;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    console.log('--- INICIANDO SEEDER DE SIGO-DENTAL ---');
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
                    branch = _j.sent();
                    console.log("[+] Sede creada: ".concat(branch.name));
                    chairsData = [
                        { code: 'CHAIR-01', name: 'Sillón Gabinete 01 (General)' },
                        { code: 'CHAIR-02', name: 'Sillón Gabinete 02 (Cirugía)' },
                        { code: 'CHAIR-03', name: 'Sillón Gabinete 03 (Ortodoncia)' },
                    ];
                    _i = 0, chairsData_1 = chairsData;
                    _j.label = 2;
                case 2:
                    if (!(_i < chairsData_1.length)) return [3 /*break*/, 5];
                    chair = chairsData_1[_i];
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
                                description: 'Sillón equipado con unidad de aspiración y lámpara LED',
                            },
                        })];
                case 3:
                    _j.sent();
                    _j.label = 4;
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
                    _a = 0, rolesData_1 = rolesData;
                    _j.label = 6;
                case 6:
                    if (!(_a < rolesData_1.length)) return [3 /*break*/, 9];
                    r = rolesData_1[_a];
                    _b = createdRoles;
                    _c = r.name;
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
                    _b[_c] = _j.sent();
                    _j.label = 8;
                case 8:
                    _a++;
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
                    _d = 0, menuOptionsData_1 = menuOptionsData;
                    _j.label = 10;
                case 10:
                    if (!(_d < menuOptionsData_1.length)) return [3 /*break*/, 13];
                    opt = menuOptionsData_1[_d];
                    _e = createdOptions;
                    _f = opt.optionCode;
                    return [4 /*yield*/, prisma.menuOption.upsert({
                            where: { optionCode: opt.optionCode },
                            update: opt,
                            create: opt,
                        })];
                case 11:
                    _e[_f] = _j.sent();
                    _j.label = 12;
                case 12:
                    _d++;
                    return [3 /*break*/, 10];
                case 13:
                    console.log("[+] Opciones din\u00E1micas de men\u00FA registradas.");
                    roleAssignments = __spreadArray(__spreadArray([], menuOptionsData.map(function (o) { return ({ role: 'ADMIN_TI', option: o.optionCode, r: true, w: true, d: true }); }), true), [
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
                    ], false);
                    _g = 0, roleAssignments_1 = roleAssignments;
                    _j.label = 14;
                case 14:
                    if (!(_g < roleAssignments_1.length)) return [3 /*break*/, 17];
                    asg = roleAssignments_1[_g];
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
                        })];
                case 15:
                    _j.sent();
                    _j.label = 16;
                case 16:
                    _g++;
                    return [3 /*break*/, 14];
                case 17:
                    console.log("[+] Tabla rol_opcion vinculada con permisos de lectura/escritura/borrado.");
                    return [4 /*yield*/, bcrypt.hash('Admin123456!', 10)];
                case 18:
                    defaultPasswordHash = _j.sent();
                    usersToSeed = [
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
                    _h = 0, usersToSeed_1 = usersToSeed;
                    _j.label = 19;
                case 19:
                    if (!(_h < usersToSeed_1.length)) return [3 /*break*/, 22];
                    u = usersToSeed_1[_h];
                    role = createdRoles[u.role];
                    return [4 /*yield*/, prisma.user.upsert({
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
                        })];
                case 20:
                    _j.sent();
                    _j.label = 21;
                case 21:
                    _h++;
                    return [3 /*break*/, 19];
                case 22:
                    console.log("[+] Usuarios iniciales dados de alta.");
                    console.log('--- SEEDER COMPLETADO CON ÉXITO ---');
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
