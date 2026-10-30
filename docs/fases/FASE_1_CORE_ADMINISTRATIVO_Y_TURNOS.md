# FASE 1: CORE ADMINISTRATIVO, PACIENTES, AGENDA Y FACTURACIÓN BÁSICA

**Proyecto:** Sistema Integral de Gestión Odontológica y Expediente Clínico Digital (**SIGO-Dental**)  
**Duración Estimada:** Sprints 1 al 4 (8 Semanas)  
**Estado Actual:** `[x] Sprints 1 y 2 Completados (En Progreso: 50%)`  
**Documento Maestro:** [`PLAN_DE_IMPLEMENTACION.md`](../../PLAN_DE_IMPLEMENTACION.md)  

---

## 1. OBJETIVO DE LA FASE 1
Establecer la infraestructura base en Docker, el esquema de persistencia relacional con PostgreSQL y Redis, el sistema de autenticación RBAC con gestión de sesiones híbrida JWT + Redis, el módulo de filiación y anamnesis general de pacientes (con alertas críticas LOPDP), la agenda multirrecinto con control de colisión por sillón físico dental, y el punto de venta básico con arqueo y cierre ciego de caja.

---

## 2. CHECKLIST DE ENTREGABLES Y TAREAS TÉCNICAS

### Sprint 1: Infraestructura Base, Docker y Autenticación RBAC
- [x] **1.1 Configuración de Infraestructura y Contenedores:**
  - [x] `docker-compose.yml` multi-servicio funcional (PostgreSQL 16, Redis 7, MinIO, ClamAV, Backend NestJS, Frontend Vite).
  - [x] Configuración de variables de entorno `.env.example`, `.env` y script SQL de extensiones `init-extensions.sql`.
  - [x] Healthchecks de conexión para base de datos y memoria caché.
- [x] **1.2 Modelo de Base de Datos y Migraciones Iniciales (Prisma):**
  - [x] Esquema Prisma inicial: tablas `users`, `roles` (con `lectura`, `escritura`, `borrado`), `branches`, `dental_chairs`, `menu_options`, `role_menu_options`, `endpoints`, `menu_option_endpoints`.
  - [x] Seeders de desarrollo (`prisma/seed.ts`) con roles preconfigurados (Admin TI, Director Médico, Odontólogo, Asistente, Recepción, Cajero, Contador, Paciente) y catálogo de navegación dinámica.
- [x] **1.3 Módulo de Autenticación y Sesiones:**
  - [x] Login con credenciales, hash de contraseña bcrypt y estructura para validación MFA.
  - [x] Emisión de Access Token JWT (15 minutos) con claims `sub`, `role`, `branchId`, `sessionId`, `jti`.
  - [x] Refresh Token criptográfico y persistencia de sesión activa en Redis (`session:active:{userId}:{sessionId}`).
  - [x] Middleware/Estrategia para control de inactividad de 15 minutos en Redis y revocación por lista negra (`blacklist:token:{jti}`).
  - [x] Endpoint dinámico `GET /api/v1/auth/my-navigation` para entregar el árbol de menú con `lectura`, `escritura`, `borrado`.
- [x] **1.4 UI Base y Layout (Frontend):**
  - [x] Configuración de React 18 con TypeScript, Vite, Tailwind CSS y Google Material Symbols (cero emojis).
  - [x] Layout principal (`AppLayout.tsx`, `.module.css`, `useAppLayout.ts`) con Sidebar dinámico conectado a base de datos (`Sidebar.tsx`, `.module.css`, `useSidebar.ts`).
  - [x] Navbar superior (`Navbar.tsx`, `.module.css`, `useNavbar.ts`) con selector de sede, badge de conexión y temporizador de sesión activa regresivo.
  - [x] Pantalla de Login (`LoginView.tsx`, `.module.css`, `useLoginView.ts`).
  - [x] Custom Hook `useCurrentOptionPermissions` para renderizado y visibilidad condicional de botones según `lectura`, `escritura`, `borrado`.

---

### Sprint 2: Filiación de Pacientes, Anamnesis y Protección LOPDP
- [x] **2.1 Backend de Gestión de Pacientes:**
  - [x] Endpoints CRUD `/api/v1/patients` con paginación, filtros de búsqueda rápida por DNI/nombres.
  - [x] Validación de tutor legal obligatorio para pacientes menores de 18 años.
  - [x] Servicio de Cifrado a Nivel de Campo (**AES-256-GCM**) para antecedentes médicos y alergias críticas (`EncryptionService`).
  - [x] Interceptor de auditoría forense append-only para cada lectura y mutación de datos médicos sensibles.
- [x] **2.2 Frontend de Pacientes:**
  - [x] Componente `PatientList` (separado en `.tsx`, `.module.css`, `usePatientList.ts`, `.types.ts`).
  - [x] Modal `PatientFormModal` con cálculo dinámico de edad y tutor legal obligatorio si edad < 18.
  - [x] Componente `MedicalAlertBadge` flotante de alta visibilidad para alergias críticas (penicilina, anticoagulantes).
  - [x] Renderizado condicional de botones según `canWrite` y `canDelete` desde base de datos.
  - [x] Pruebas unitarias de cifrado AES-256-GCM en backend y pruebas de componentes con React Testing Library.

---

### Sprint 3: Agenda Multirrecinto, Colisión de Sillones y Notificaciones
- [x] **3.1 Backend de Agenda y Citas:**
  - [x] Endpoints `/api/v1/appointments` para agendamiento, reprogramación y cambio de estados (`Programado`, `Confirmado`, `En Sala`, `En Atención`, `Atendido`, `Cancelado`, `No-Show`).
  - [x] **Restricción estricta de colisión física:** Bloqueo en base de datos (`EXCLUDE USING gist`) y validación en servicio que impide agendar 2 citas simultáneas en el mismo sillón dental.
  - [x] Cálculo de tiempo de espera en sala en tiempo real.
- [x] **3.2 Frontend de Calendario Clínico:**
  - [x] Calendario interactivo con vistas día/semana/sillón (`AppointmentsCalendar.tsx`, `.module.css`, `useAppointmentsCalendar.ts`).
  - [x] Asignación visual por colores según estado del turno y odontólogo tratante.
  - [x] Modal de agendamiento rápido con detección preventiva de choques de horario.
- [x] **3.3 Notificaciones Transaccionales (Worker asíncrono BullMQ):**
  - [x] Integración con Meta Cloud WhatsApp Business API para confirmación inmediata de reserva.
  - [x] Jobs programados en Redis para recordatorios automáticos 48h y 24h antes de la cita.
  - [x] Webhook para recibir confirmaciones interactivas del paciente (`Confirmar` / `Cancelar`).

---

### Sprint 4: Punto de Venta (POS), Arqueo Ciego y Facturación Básica
- [x] **4.1 Backend de Facturación y Caja:**
  - [x] Apertura de caja con fondo fijo por cajero y turno.
  - [x] Registro de cobros con soporte para **pagos mixtos** (efectivo, tarjeta, transferencia).
  - [x] **Arqueo y Cierre Ciego:** Endpoint de cierre que recibe conteo físico sin exponer los totales teóricos del sistema previamente.
  - [x] Cálculo interno de diferencias (sobrantes/faltantes) y generación de acta inmutable de cierre.
  - [x] Emisión de comprobantes fiscales básicos con generación de PDF/XML.
- [x] **4.2 Frontend de Caja y Cobranza:**
  - [x] Pantalla de Punto de Venta (`PosCheckout.tsx`, `.module.css`, `usePosCheckout.ts`).
  - [x] Modal de Cierre Ciego de Caja (`BlindCloseModal.tsx`, `.module.css`, `useBlindCloseModal.ts`).
  - [x] Visualizador e impresión de tickets/facturas de pago.

---

## 3. CRITERIOS DE FINALIZACIÓN DE FASE (GATE REVIEW)
- [x] Cobertura de pruebas $\ge 80\%$ en endpoints de autenticación, pacientes, colisión de sillones y caja ciega.
- [x] Pruebas de integración automatizadas para:
  - [x] Detección y rechazo de citas superpuestas en el mismo sillón físico (`ERR_CHAIR_COLLISION`).
  - [x] Cierre ciego de caja registrando discrepancias sin filtrar montos teóricos a la UI.
  - [x] Cifrado AES-256-GCM comprobado en campos de salud de la base de datos PostgreSQL.
- [x] Revisión técnica aprobada por Arquitecto de Software y Lead de QA.

