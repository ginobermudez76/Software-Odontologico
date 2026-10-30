# FASE 4: PRUEBAS UAT, CIBERSEGURIDAD, CARGA Y DESPLIEGUE A PRODUCCIÓN

**Proyecto:** Sistema Integral de Gestión Odontológica y Expediente Clínico Digital (**SIGO-Dental**)  
**Duración Estimada:** Sprint 12 (4 Semanas)  
**Estado Actual:** `[x] Completada (Go-Live Exitoso en VPS y Dominio con SSL)`  
**Documento Maestro:** [`PLAN_DE_IMPLEMENTACION.md`](../../PLAN_DE_IMPLEMENTACION.md)  

---

## 1. OBJETIVO DE LA FASE 4
Realizar las pruebas de aceptación con usuarios finales (UAT) en entorno productivo real, ejecutar auditorías de ciberseguridad SAST/DAST, pruebas de penetración, validación de flujo antivirus, pruebas de estrés y concurrencia, verificación de cumplimiento normativo LOPDP, configuración de Nginx con SSL y salida formal a producción (*Go-Live*).

---

## 2. CHECKLIST DE ENTREGABLES Y TAREAS TÉCNICAS

### Sprint 12: Pruebas UAT, Ciberseguridad y Despliegue en Producción
- [x] **12.1 Pruebas de Aceptación con Usuarios (UAT):**
  - [x] Despliegue en ambiente productivo en Google Cloud VM `software-odontologico` (`35.254.34.194`).
  - [x] Ciclo de pruebas con el Director Médico y Odontólogos: marcado de odontograma, periodontograma, firmas de consentimientos, notas SOEP.
  - [x] Ciclo de pruebas con Recepción y Caja: agendamiento multi-sillón, cobros mixtos, arqueo y cierre ciego de caja.
  - [x] Ciclo de pruebas con Administración y Contabilidad: liquidación de comisiones con deducción de laboratorio y reportes de inventario FEFO.
  - [x] Matriz de corrección de observaciones y refinamiento de ergonomía de interfaz verificado con Playwright E2E.
- [x] **12.2 Auditoría de Ciberseguridad y Pentesting:**
  - [x] Escaneo de código estático (SAST) libre de vulnerabilidades Críticas y Altas.
  - [x] Escaneo dinámico (DAST) contra OWASP Top 10 (inyecciones SQL prevenidas con Prisma ORM, XSS con React escapado, CSRF con SameSite=Strict cookies, BOLA prevenido con UUIDs v4).
  - [x] **Formato Estandarizado de Errores RFC 7807:** Respuestas Problem Details con `type`, `title`, `status`, `detail`, `errorCode`, `timestamp` y `traceId` sin filtrado de trazas en 500.
  - [x] **Auditoría LOPDP:** Verificación de cifrado AES-256-GCM en reposo y generación inmutable de logs de auditoría forense con hash SHA-256.
- [x] **12.3 Pruebas de Carga y Rendimiento (Stress Testing):**
  - [x] Configuración de Docker Compose con límites optimizados y swapfile de 2.0 GiB en Linux host.
  - [x] Comprobación del SLA: latencia $< 1.5\text{ s}$ en renderizado del odontograma y $< 500\text{ ms}$ en consultas de agenda.
  - [x] Verificación de estabilidad y uso de memoria en Redis y PostgreSQL bajo alta concurrencia.
- [x] **12.4 Capacitación y Puesta en Producción (Go-Live):**
  - [x] Configuración de Nginx Reverse Proxy con SSL Let's Encrypt para `eldominiodedesarrollo.me` y `api.eldominiodedesarrollo.me`.
  - [x] Redirección automática HTTP -> HTTPS (301) y cabeceras de seguridad Helmet (HSTS, CSP, X-Content-Type-Options: nosniff).
  - [x] Migración de datos iniciales y seeder administrativo ejecutado (`seed.js`) con roles, opciones dinámicas y usuarios por defecto.
  - [x] Entrega de especificación interactiva OpenAPI 3.0 / Swagger en `https://api.eldominiodedesarrollo.me/api/docs`.

---

## 3. CRITERIOS DE ACEPTACIÓN PARA PASE A PRODUCCIÓN (GO / NO-GO)
- [x] Aprobación formal del despliegue en Google Cloud VPS con dominio propio verificado.
- [x] Reporte de ciberseguridad conforme a estándares OWASP Top 10 y ASVS Nivel 2.
- [x] Cobertura de pruebas automatizadas $\ge 80\%$ en todo el repositorio (90 pruebas unitarias y de integración superadas).
- [x] Verificación de navegación dinámica RBAC y ocultamiento de botones de acción en el DOM para usuarios sin permisos de escritura o borrado.

