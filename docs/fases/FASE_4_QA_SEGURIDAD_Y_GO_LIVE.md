# FASE 4: PRUEBAS UAT, CIBERSEGURIDAD, CARGA Y DESPLIEGUE A PRODUCCIÓN

**Proyecto:** Sistema Integral de Gestión Odontológica y Expediente Clínico Digital (**SIGO-Dental**)  
**Duración Estimada:** Sprint 12 (4 Semanas)  
**Estado Actual:** `[ ] Bloqueada (Depende de Fases 1, 2 y 3)`  
**Documento Maestro:** [`PLAN_DE_IMPLEMENTACION.md`](../../PLAN_DE_IMPLEMENTACION.md)  

---

## 1. OBJETIVO DE LA FASE 4
Realizar las pruebas de aceptación con usuarios finales (UAT) en entorno de pre-producción (Staging), ejecutar auditorías de ciberseguridad SAST/DAST, pruebas de penetración, validación de flujo antivirus con ClamAV, pruebas de estrés y concurrencia con K6/JMeter, verificación final de cumplimiento normativo LOPDP, capacitación al personal de la clínica y salida formal a producción (*Go-Live*).

---

## 2. CHECKLIST DE ENTREGABLES Y TAREAS TÉCNICAS

### Sprint 12: Pruebas UAT, Ciberseguridad y Despliegue en Producción
- [ ] **12.1 Pruebas de Aceptación con Usuarios (UAT):**
  - [ ] Despliegue en ambiente Staging idéntico a producción.
  - [ ] Ciclo de pruebas con el Director Médico y Odontólogos: marcado de odontograma en tablets, firmas de consentimientos, notas SOEP.
  - [ ] Ciclo de pruebas con Recepción y Caja: agendamiento multi-sillón, cobros mixtos, arqueo y cierre ciego de caja.
  - [ ] Ciclo de pruebas con Administración y Contabilidad: liquidación de comisiones y reportes de inventario.
  - [ ] Matriz de corrección de observaciones y refinamiento de ergonomía de interfaz.
- [ ] **12.2 Auditoría de Ciberseguridad y Pentesting:**
  - [ ] Escaneo de código estático (SAST con SonarQube) libre de vulnerabilidades Críticas y Altas.
  - [ ] Escaneo dinámico (DAST) contra OWASP Top 10 (inyecciones SQL, XSS, CSRF, Broken Access Control).
  - [ ] **Prueba de Intercepción de Malware (ClamAV):** Simulación de carga de archivos maliciosos (cadena EICAR) y verificación de rechazo inmediato en memoria.
  - [ ] **Auditoría LOPDP:** Verificación de cifrado AES-256-GCM en disco y validación de generación de logs de auditoría forense para cada acceso médico.
- [ ] **12.3 Pruebas de Carga y Rendimiento (Stress Testing):**
  - [ ] Ejecución de scripts en K6 simulando **300 usuarios concurrentes** navegando simultáneamente.
  - [ ] Comprobación del SLA: latencia $< 1.5\text{ s}$ en renderizado del odontograma y $< 500\text{ ms}$ en consultas de agenda.
  - [ ] Verificación de estabilidad y uso de memoria en Redis y PostgreSQL bajo alta concurrencia.
- [ ] **12.4 Capacitación y Puesta en Producción (Go-Live):**
  - [ ] Manuales de usuario interactivos y guías rápidas en video para el personal clínico.
  - [ ] Configuración del entorno de producción de alta disponibilidad (PostgreSQL con réplica, Redis Cluster / AOF, S3 bucket privado con SSE-KMS, WAF con reglas OWASP).
  - [ ] Migración de datos iniciales / catálogo maestro de procedimientos y aranceles.
  - [ ] Monitoreo en tiempo real (Prometheus / Grafana / Sentry) y soporte presencial el día de lanzamiento.

---

## 3. CRITERIOS DE ACEPTACIÓN PARA PASE A PRODUCCIÓN (GO / NO-GO)
- [ ] Aprobación formal firmada por el Director Médico y el Sponsor del Negocio.
- [ ] Reporte de ciberseguridad emitido por CISO/SecOps sin vulnerabilidades abiertas de severidad Alta o Crítica.
- [ ] Cobertura de pruebas automatizadas $\ge 80\%$ en todo el repositorio.
- [ ] Políticas de respaldo y recuperación ante desastres (RPO $\le 1\text{ h}$, RTO $\le 4\text{ h}$) probadas exitosamente mediante simulacro.
