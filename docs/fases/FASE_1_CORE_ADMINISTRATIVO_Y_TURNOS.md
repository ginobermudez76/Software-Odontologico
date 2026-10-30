# FASE 1: CORE ADMINISTRATIVO, PACIENTES, AGENDA Y FACTURACIÓN BÁSICA

**Proyecto:** Sistema Integral de Gestión Odontológica y Expediente Clínico Digital (**SIGO-Dental**)  
**Duración Estimada:** Sprints 1 al 4 (8 Semanas)  
**Estado Actual:** `[ ] Pendiente de Inicio`  
**Documento Maestro:** [`PLAN_DE_IMPLEMENTACION.md`](../../PLAN_DE_IMPLEMENTACION.md)  

---

## 1. OBJETIVO DE LA FASE 1
Establecer la infraestructura base en Docker, el esquema de persistencia relacional con PostgreSQL y Redis, el sistema de autenticación RBAC con gestión de sesiones híbrida JWT + Redis, el módulo de filiación y anamnesis general de pacientes (con alertas críticas LOPDP), la agenda multirrecinto con control de colisión por sillón físico dental, y el punto de venta básico con arqueo y cierre ciego de caja.

---

## 2. CHECKLIST DE ENTREGABLES Y TAREAS TÉCNICAS

### Sprint 1: Infraestructura Base, Docker y Autenticación RBAC
- [ ] **1.1 Configuración de Infraestructura y Contenedores:**
  - [ ] `docker-compose.yml` multi-servicio funcional (PostgreSQL 16, Redis 7, MinIO, ClamAV, Backend NestJS, Frontend Vite).
  - [ ] Configuración de variables de entorno `.env.example` y scripts de inicialización.
  - [ ] Healthchecks de conexión para base de datos y memoria caché.
- [ ] **1.2 Modelo de Base de Datos y Migraciones Iniciales (Prisma):**
  - [ ] Esquema Prisma inicial: tablas `users`, `roles`, `permissions`, `branches`, `dental_chairs`.
  - [ ] Seeders de desarrollo con roles preconfigurados (Admin TI, Director Médico, Odontólogo, Asistente, Recepción, Contador).
- [ ] **1.3 Módulo de Autenticación y Sesiones:**
  - [ ] Login con credenciales, hash de contraseña bcrypt/argon2 y validación MFA vía TOTP.
  - [ ] Emisión de Access Token JWT (15 minutos) con claims `sub`, `role`, `permissions`, `branchId`.
  - [ ] Refresh Token en cookie segura HttpOnly y persistencia de sesión activa en Redis (`session:active:{userId}:{sessionId}`).
  - [ ] Middleware interceptor para control de inactividad de 15 minutos en Redis.
  - [ ] Endpoint de revocación remota y blacklist de tokens (`blacklist:token:{jti}`).
- [ ] **1.4 UI Base y Layout (Frontend):**
  - [ ] Configuración de React 18/19 con TypeScript, Vite, Tailwind CSS y Google Material Symbols.
  - [ ] Layout principal (`AppLayout.tsx`, `AppLayout.module.css`, `useAppLayout.ts`) con Sidebar retráctil filtrado por RBAC.
  - [ ] Navbar superior con selector de sede, badge de conexión y temporizador de sesión activa.
  - [ ] Pantalla de Login (`LoginForm.tsx`, `LoginForm.module.css`, `useLoginForm.ts`).

---

### Sprint 2: Filiación de Pacientes, Anamnesis y Protección LOPDP
- [ ] **2.1 Backend de Gestión de Pacientes:**
  - [ ] Endpoints CRUD `/api/v1/patients` con paginación, filtros de búsqueda rápida por DNI/nombres.
  - [ ] Validación de tutor legal obligatorio para pacientes menores de 18 años.
  - [ ] Servicio de Cifrado a Nivel de Campo (**AES-256-GCM**) para antecedentes médicos y alergias críticas.
  - [ ] Interceptor de auditoría forense append-only para cada lectura de datos médicos sensibles.
- [ ] **2.2 Frontend de Pacientes:**
  - [ ] Componente `PatientForm` (separado en `.tsx`, `.module.css`, `usePatientForm.ts`, `.types.ts`, `.test.tsx`).
  - [ ] Tabla de pacientes con búsqueda en tiempo real, filtros avanzados y paginación.
  - [ ] Componente `MedicalAlertBadge` flotante de alta visibilidad para alergias críticas (penicilina, anticoagulantes).
  - [ ] Pruebas unitarias de validación de campos con Zod y React Testing Library.

---

### Sprint 3: Agenda Multirrecinto, Colisión de Sillones y Notificaciones
- [ ] **3.1 Backend de Agenda y Citas:**
  - [ ] Endpoints `/api/v1/appointments` para agendamiento, reprogramación y cambio de estados (`Programado`, `Confirmado`, `En Sala`, `En Atención`, `Atendido`, `Cancelado`, `No-Show`).
  - [ ] **Restricción estricta de colisión física:** Bloqueo en base de datos (`EXCLUDE USING gist`) y validación en servicio que impide agendar 2 citas simultáneas en el mismo sillón dental.
  - [ ] Cálculo de tiempo de espera en sala en tiempo real.
- [ ] **3.2 Frontend de Calendario Clínico:**
  - [ ] Calendario interactivo con vistas día/semana/sillón (`AppointmentsCalendar.tsx`, `.module.css`, `useAppointmentsCalendar.ts`).
  - [ ] Asignación visual por colores según estado del turno y odontólogo tratante.
  - [ ] Modal de agendamiento rápido con detección preventiva de choques de horario.
- [ ] **3.3 Notificaciones Transaccionales (Worker asíncrono BullMQ):**
  - [ ] Integración con Meta Cloud WhatsApp Business API para confirmación inmediata de reserva.
  - [ ] Jobs programados en Redis para recordatorios automáticos 48h y 24h antes de la cita.
  - [ ] Webhook para recibir confirmaciones interactivas del paciente (`Confirmar` / `Cancelar`).

---

### Sprint 4: Punto de Venta (POS), Arqueo Ciego y Facturación Básica
- [ ] **4.1 Backend de Facturación y Caja:**
  - [ ] Apertura de caja con fondo fijo por cajero y turno.
  - [ ] Registro de cobros con soporte para **pagos mixtos** (efectivo, tarjeta, transferencia).
  - [ ] **Arqueo y Cierre Ciego:** Endpoint de cierre que recibe conteo físico sin exponer los totales teóricos del sistema previamente.
  - [ ] Cálculo interno de diferencias (sobrantes/faltantes) y generación de acta inmutable de cierre.
  - [ ] Emisión de comprobantes fiscales básicos con generación de PDF/XML.
- [ ] **4.2 Frontend de Caja y Cobranza:**
  - [ ] Pantalla de Punto de Venta (`PosCheckout.tsx`, `.module.css`, `usePosCheckout.ts`).
  - [ ] Modal de Cierre Ciego de Caja (`BlindCloseModal.tsx`, `.module.css`, `useBlindCloseModal.ts`).
  - [ ] Visualizador e impresión de tickets/facturas de pago.

---

## 3. CRITERIOS DE FINALIZACIÓN DE FASE (GATE REVIEW)
- [ ] Cobertura de pruebas $\ge 80\%$ en endpoints de autenticación, pacientes, colisión de sillones y caja ciega.
- [ ] Pruebas de integración E2E automatizadas para:
  - [ ] Detección y rechazo de citas superpuestas en el mismo sillón físico.
  - [ ] Cierre ciego de caja registrando discrepancias sin filtrar montos teóricos a la UI.
  - [ ] Cifrado AES-256-GCM comprobado en campos de salud de la base de datos PostgreSQL.
- [ ] Revisión técnica aprobada por Arquitecto de Software y Lead de QA.

