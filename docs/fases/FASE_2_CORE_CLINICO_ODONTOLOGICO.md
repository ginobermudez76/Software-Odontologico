# FASE 2: CORE CLÍNICO, ODONTOGRAMA, PERIODONTOGRAMA Y EXPEDIENTE DIGITAL

**Proyecto:** Sistema Integral de Gestión Odontológica y Expediente Clínico Digital (**SIGO-Dental**)  
**Duración Estimada:** Sprints 5 al 8 (8 Semanas)  
**Estado Actual:** `[x] En Progreso`  
**Documento Maestro:** [`PLAN_DE_IMPLEMENTACION.md`](../../PLAN_DE_IMPLEMENTACION.md)  

---

## 1. OBJETIVO DE LA FASE 2
Desarrollar el núcleo médico-odontológico de la plataforma: odontograma vectorial 2D con soporte FDI y Universal, periodontograma digital automatizado con cálculo de NIC, registro inmutable de notas de evolución SOEP con ventana de bloqueo a las 24 horas y adendas, consentimientos informados con firma digital/biométrica en pantalla y verificación OTP, y recetario odontológico digital con código QR y validación de contraindicaciones.

---

## 2. CHECKLIST DE ENTREGABLES Y TAREAS TÉCNICAS

### Sprint 5: Odontograma Vectorial Interactivo 2D (FDI y Universal)
- [x] **5.1 Modelo y Backend del Odontograma:**
  - [x] Esquema de persistencia JSONB para estado anatómico de 32 piezas permanentes y 20 temporales.
  - [x] Versionado cronológico: Odontograma Inicial (al ingreso) vs. Odontograma Evolutivo (actualizado con tratamientos).
  - [x] Endpoints `/api/v1/clinical-records/:patientId/odontogram` para consulta y actualización de hallazgos.
- [x] **5.2 Componentes Frontend del Odontograma (Separación Estricta de Archivos):**
  - [x] `OdontogramTooth` (piezas vectoriales divididas en 5 superficies: vestibular, lingual, mesial, distal, oclusal).
    - [x] `OdontogramTooth.tsx` (Renderizado SVG puro).
    - [x] `OdontogramTooth.module.css` (Estilos y resaltado táctil para sillón dental).
    - [x] `OdontogramTooth.types.ts` (Tipos e interfaces de superficies y patologías).
    - [x] `OdontogramTooth.test.tsx` (Pruebas unitarias de clic en superficies y pintado).
  - [x] `Odontogram2D` (Lienzo contenedor con conmutador FDI / Universal y dentición adulto / niño).
    - [x] `Odontogram2D.tsx`, `Odontogram2D.module.css`, `useOdontogram2D.ts`, `.types.ts`, `.test.tsx`.
  - [x] Paleta interactiva de herramientas con catálogo cromático estandarizado:
    - [x] Rojo: Caries activa por superficie.
    - [x] Azul: Restauraciones previas (resinas, amalgamas, sellantes).
    - [x] Verde/Naranja: Tratamientos indicados/proyectados (extracciones, coronas, endodoncias).

---

### Sprint 6: Periodontograma Digital y Cálculo Automático de NIC
- [x] **6.1 Motor de Cálculo Periodontal (Backend & Frontend):**
  - [x] Algoritmo reactivo de cálculo: $\text{NIC} = \text{Profundidad de Sondaje (PS)} + \text{Margen Gingival (MG)}$.
  - [x] Registro de 6 puntos por pieza dental (Mesio, Medio y Disto en Vestibular y Lingual/Palatino).
  - [x] Captura de indicadores auxiliares: Sangrado al sondaje (SS), Supuración (SUP), Movilidad (I, II, III), Furca (I, II, III, IV).
  - [x] Cálculo automático de índices de placa bacteriana e índice de sangrado gingival (BOP).
- [x] **6.2 Componente `PeriodontogramTable` (Frontend):**
  - [x] `PeriodontogramTable.tsx` (Matriz tabular accesible optimizada para ingreso rápido por teclado numérico o tablet).
  - [x] `PeriodontogramTable.module.css` (Diseño de celdas con semaforización de alerta periodontal $> 4\text{ mm}$).
  - [x] `usePeriodontogramTable.ts` (Validación de rangos 0-15 mm y cálculo en tiempo real).
  - [x] `PeriodontogramTable.test.tsx` (Pruebas de cálculo exacto de NIC y alertas).

---

### Sprint 7: Notas de Evolución SOEP e Inmutabilidad Médica
- [x] **7.1 Backend de Evolución SOEP:**
  - [x] Registro estructurado de notas con campos: Subjetivo, Objetivo, Evaluación (CIE-10 odontológico) y Plan.
  - [x] **Regla de Inmutabilidad RN-01:** Bloqueo automático de edición transcurridas 24 horas desde la creación.
  - [x] Módulo de **Notas de Adenda / Aclaratorias**: Vinculación formal a la nota original sin modificar su contenido histórico.
- [x] **7.2 Componente `SoepEditor` (Frontend):**
  - [x] `SoepEditor.tsx`, `SoepEditor.module.css`, `useSoepEditor.ts`, `SoepEditor.types.ts`, `SoepEditor.test.tsx`.
  - [x] Indicador de estado de la nota (Editable / Bloqueada por tiempo).
  - [x] Modal para emisión de adendas con firma del profesional tratante.

---

### Sprint 8: Consentimiento Informado Digital y Receta Médica con QR
- [x] **8.1 Consentimiento Informado con Firma Biométrica:**
  - [x] Generador de plantillas de consentimiento dinámicas por tipo de procedimiento invasivo/quirúrgico.
  - [x] Componente `SignaturePad` para captura de firma biométrica táctil en tablet de consultorio.
  - [x] Alternativa de firma remota por WhatsApp mediante token OTP de 6 dígitos.
  - [x] Generación de contenedor con hash criptográfico SHA-256 e incrustación de IP y timestamp.
  - [x] **Regla RN-05:** Bloqueo del procedimiento en estado `Atendido` si el consentimiento no está firmado.
- [x] **8.2 Recetario Odontológico Electrónico con QR:**
  - [x] Catálogo precargado de fármacos con posología sugerida y verificación cruzada de alergias del paciente.
  - [x] Generación de código QR firmado digitalmente y endpoint de verificación farmacéutica externa.

---

## 3. CRITERIOS DE FINALIZACIÓN DE FASE (GATE REVIEW)
- [x] Cobertura de pruebas $\ge 85\%$ en odontograma, cálculo de NIC, notas SOEP, consentimientos y recetas.
- [x] Pruebas funcionales y unitarias aprobadas (29/29 en Backend, 28/28 en Frontend):
  - [x] Registro de caries oclusal y persistencia en estado evolutivo.
  - [x] Cálculo algorítmico correcto de NIC ante diferentes valores de PS y MG.
  - [x] Rechazo HTTP 403 al intentar editar una nota SOEP con más de 24 horas (`ERR_NOTE_LOCKED_AFTER_24H`).
  - [x] Bloqueo de procedimiento quirúrgico si falta la firma del consentimiento informado (`ERR_CONSENT_REQUIRED_NOT_SIGNED`).
  - [x] Detección de colisión de alergias al prescribir medicamentos (`ERR_ALLERGY_CONFLICT_DETECTED`).
- [x] Certificación de usabilidad táctil del odontograma, periodontograma y firma biométrica en tablet $\ge 10.5''$.

