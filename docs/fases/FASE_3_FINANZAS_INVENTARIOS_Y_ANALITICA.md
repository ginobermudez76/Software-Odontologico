# FASE 3: FINANZAS AVANZADAS, INVENTARIOS, COMISIONES Y REPORTES BI

**Proyecto:** Sistema Integral de Gestión Odontológica y Expediente Clínico Digital (**SIGO-Dental**)  
**Duración Estimada:** Sprints 9 al 11 (6 Semanas)  
**Estado Actual:** `[x] En Progreso (Sprint 9 y Sprint 10 Completados y Verificados; Procediendo a Sprint 11)`  
**Documento Maestro:** [`PLAN_DE_IMPLEMENTACION.md`](../../PLAN_DE_IMPLEMENTACION.md)  

---

## 1. OBJETIVO DE LA FASE 3
Automatizar el control logístico y financiero de la clínica: vinculación de recetas estándar de insumos por procedimiento odontológico con descargo automático de stock por sillón, control de lotes y fechas de vencimiento, liquidación de comisiones a odontólogos con deducción previa de costos de laboratorio externo, presupuestos multinivel con conversión a citas, y tableros directivos de Business Intelligence (BI) para toma de decisiones.

---

## 2. CHECKLIST DE ENTREGABLES Y TAREAS TÉCNICAS

### Sprint 9: Inventario Clínico y Descargo Automático por Procedimiento
- [x] **9.1 Backend de Inventario Clínico:**
  - [x] Tablas `procedure_catalog`, `clinical_supplies`, `supply_batches`, `procedure_recipes`, `inventory_discharges`.
  - [x] Asociación de recetas de consumo estándar a procedimientos clínicos.
  - [x] **Regla RN-06 / Descargo Transaccional FEFO:** Consumo atómico priorizando lotes más próximos a caducar y actualización en `$transaction` de PostgreSQL.
  - [x] Monitoreo preventivo y categorización de caducidades en CADUCADO, URGENTE (<15d), ALERTA (<30d) y PREVENTIVO (<60d).
- [x] **9.2 Frontend de Almacén e Insumos:**
  - [x] Módulo de gestión de stock (`InventoryList.tsx`, `.module.css`, `useInventoryList.ts`, `.test.tsx`).
  - [x] Modal de ingreso de insumos y lotes con fechas de vencimiento y costos unitarios.
  - [x] Trazabilidad FEFO de lotes próximos a vencer (`BatchExpiryTracker.tsx`, `.module.css`, `useBatchExpiryTracker.ts`, `.test.tsx`).
  - [x] Configuración interactiva de recetas de consumo estándar (`ProcedureRecipeConfig.tsx`, `.module.css`, `useProcedureRecipeConfig.ts`, `.test.tsx`).
  - [x] Vista unificada por pestañas (`InventoryView.tsx`) en `/inventory` con control RBAC de botones de acción.

---

### Sprint 10: Presupuestos Multinivel y Liquidación de Honorarios Médicos
- [x] **10.1 Presupuestos Odontológicos Multinivel:**
  - [x] Creación de planes de tratamiento estructurados por fases clínicas (Fase 1: Higiene, Fase 2: Operatorias, Fase 3: Rehabilitación).
  - [x] Soporte para presupuestos alternativos (Plan Ideal vs. Plan Económico).
  - [x] Control estricto de validez de 30 días calendario conforme a **Regla RN-04** (`ERR_TREATMENT_PLAN_EXPIRED`).
  - [x] Flujo de aprobación del paciente y botón de conversión directa de ítems aprobados en citas de agenda (`convertItemToAppointment`).
- [x] **10.2 Motor de Liquidación de Comisiones y Honorarios:**
  - [x] Motor de reglas de cálculo parametrizables por profesional (`PERCENTAGE_NET` y `FIXED_AMOUNT`).
  - [x] **Regla RN-07:** Deducción previa obligatoria del costo de laboratorio dental externo antes de calcular el porcentaje del odontólogo.
  - [x] Generación y persistencia de liquidaciones periódicas con histórico y marcado de estado (`PAGADO`).
  - [x] Interfaz de usuario desacoplada (`TreatmentPlanBuilder`, `DoctorSettlementManager`, `TreatmentPlansCommissionsView`) con control RBAC de botones de acción.

---

### Sprint 11: Tableros de Control Directivo (BI) y Auditoría
- [ ] **11.1 Backend de Analítica y Reportería:**
  - [ ] Consultas analíticas optimizadas y agregaciones en PostgreSQL/Redis.
  - [ ] Métricas clave: tasa de ausentismo (No-Show), ocupación de sillones, ticket promedio, procedimientos más rentables y producción por especialista.
- [ ] **11.2 Frontend de Dashboards Directivos:**
  - [ ] Tablero de mando principal (`DirectorDashboard.tsx`, `.module.css`, `useDirectorDashboard.ts`).
  - [ ] Gráficos interactivos de rendimiento financiero y clínico con exportación de datos.
  - [ ] Visor de auditoría forense para el Administrador de TI y Oficial de Cumplimiento LOPDP.

---

## 3. CRITERIOS DE FINALIZACIÓN DE FASE (GATE REVIEW)
- [ ] Cobertura de pruebas $\ge 85\%$ en motor de comisiones, descargo de stock y presupuestos.
- [ ] Pruebas funcionales E2E aprobadas:
  - [ ] Descargo automático del stock del sillón al marcar cita como atendida.
  - [ ] Cálculo exacto de comisiones descontando el costo del laboratorio dental.
  - [ ] Conversión de un presupuesto aprobado en citas agendadas sin duplicar registros.
- [ ] Validación contable del módulo de liquidación de honorarios aprobada por el Contador General.

