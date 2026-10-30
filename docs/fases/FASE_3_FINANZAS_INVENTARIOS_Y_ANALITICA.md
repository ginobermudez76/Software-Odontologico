# FASE 3: FINANZAS AVANZADAS, INVENTARIOS, COMISIONES Y REPORTES BI

**Proyecto:** Sistema Integral de Gestión Odontológica y Expediente Clínico Digital (**SIGO-Dental**)  
**Duración Estimada:** Sprints 9 al 11 (6 Semanas)  
**Estado Actual:** `[ ] Bloqueada (Depende de Fases 1 y 2)`  
**Documento Maestro:** [`PLAN_DE_IMPLEMENTACION.md`](../../PLAN_DE_IMPLEMENTACION.md)  

---

## 1. OBJETIVO DE LA FASE 3
Automatizar el control logístico y financiero de la clínica: vinculación de recetas estándar de insumos por procedimiento odontológico con descargo automático de stock por sillón, control de lotes y fechas de vencimiento, liquidación de comisiones a odontólogos con deducción previa de costos de laboratorio externo, presupuestos multinivel con conversión a citas, y tableros directivos de Business Intelligence (BI) para toma de decisiones.

---

## 2. CHECKLIST DE ENTREGABLES Y TAREAS TÉCNICAS

### Sprint 9: Inventario Clínico y Descargo Automático por Procedimiento
- [ ] **9.1 Backend de Inventario Clínico:**
  - [ ] Tablas `inventory_items`, `batches` (lotes y caducidades), `stock_by_branch_chair`, `procedure_recipes`.
  - [ ] Asociación de recetas de consumo a procedimientos (ej. 1 cartucho anestesia + 0.3g resina por restauración).
  - [ ] **Regla RN-06 / Descargo Transaccional:** Disparador que deduce automáticamente el stock del consultorio/sillón cuando una cita pasa a estado `Atendido`.
  - [ ] Alertas de stock de seguridad y reportes de insumos próximos a vencer (umbrales de 60, 30 y 15 días).
- [ ] **9.2 Frontend de Almacén e Insumos:**
  - [ ] Módulo de gestión de stock (`InventoryList.tsx`, `.module.css`, `useInventoryList.ts`).
  - [ ] Modal de ingreso de mercadería por lote y fecha de vencimiento.
  - [ ] Pantalla de configuración de recetas de insumos por procedimiento clínico.

---

### Sprint 10: Presupuestos Multinivel y Liquidación de Honorarios Médicos
- [ ] **10.1 Presupuestos Odontológicos Multinivel:**
  - [ ] Creación de planes de tratamiento estructurados por fases clínicas (Fase 1: Higiene, Fase 2: Operatorias, Fase 3: Rehabilitación).
  - [ ] Soporte para presupuestos alternativos (Plan Ideal vs. Plan Económico).
  - [ ] Control de validez de 30 días calendario conforme a **Regla RN-04**.
  - [ ] Flujo de aprobación del paciente y botón de conversión directa de ítems aprobados en citas de agenda.
- [ ] **10.2 Motor de Liquidación de Comisiones y Honorarios:**
  - [ ] Motor de reglas de cálculo parametrizables por profesional:
    - [ ] Porcentaje fijo sobre lo recaudado neto.
    - [ ] Monto fijo por procedimiento.
    - [ ] **Regla RN-07:** Deducción previa del costo de laboratorio dental externo antes de calcular el porcentaje del odontólogo.
  - [ ] Generación de pre-liquidaciones quincenales/mensuales descargables en PDF/Excel.

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
