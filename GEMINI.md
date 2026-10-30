# REGLAS DEL PROYECTO PARA GEMINI / ANTIGRAVITY (SIGO-Dental)

**Proyecto:** Sistema Integral de Gestión Odontológica y Expediente Clínico Digital (**SIGO-Dental**)  
**Documentos de Referencia Obligatoria:**
* [`SRS_SIGO_Dental.md`](./SRS_SIGO_Dental.md) (Especificación de Requerimientos de Software)
* [`ARQUITECTURA_TECNICA_SIGO_DENTAL.md`](./ARQUITECTURA_TECNICA_SIGO_DENTAL.md) (Diseño de Arquitectura y Sistema)
* [`PLAN_DE_IMPLEMENTACION.md`](./PLAN_DE_IMPLEMENTACION.md) (Plan de Implementación y Fases)

---

## 1. PRINCIPIOS ARQUITECTÓNICOS FUNDAMENTALES

1. **Monolito Modular con Arquitectura Limpia:**
   * El backend se desarrolla en **NestJS + TypeScript** con PostgreSQL 16 y Prisma ORM.
   * Los módulos de negocio (`Auth`, `Patients`, `ClinicalRecords`, `Appointments`, `Billing`, `Inventory`, `Audit`) deben ser autónomos y comunicarse únicamente mediante interfaces públicas o eventos desacoplados (`EventEmitter2`).
   * No crear dependencias circulares ni acoplamientos directos entre servicios de distintos dominios.

2. **Frontend con Separación Estricta de Responsabilidades (SoC):**
   * El frontend se desarrolla en **React + Vite + TypeScript**.
   * **REGLA DE ORO DE ARCHIVOS:** Cada componente de UI o feature clínica debe estructurarse obligatoriamente en archivos especializados separados:
     * `[NombreComponente].tsx`: Marcado JSX y estructura visual limpia (HTML con accesibilidad).
     * `[NombreComponente].module.css`: Estilos visuales desacoplados (CSS Modules).
     * `use[NombreComponente].ts`: Lógica de negocio, estado y handlers (Custom Hook).
     * `[NombreComponente].types.ts`: Tipos TypeScript, interfaces y contratos de props.
     * `[NombreComponente].test.tsx`: Pruebas unitarias y funcionales con React Testing Library y Vitest.
     * `index.ts`: Exportación pública limpia.
   * **PROHIBICIÓN:** Nunca mezclar estilos CSS, lógica de negocio, marcado HTML y tests en un solo archivo `.tsx`.

3. **Iconografía Profesional (Google Material Symbols):**
   * **SE PROHÍBE EL USO DE EMOJIS** en la interfaz de usuario, componentes y código.
   * Toda iconografía debe utilizar **Google Material Symbols (Outlined)** (`material-symbols-outlined` o `@material-symbols/svg-react`).

---

## 2. REGLAS DE NEGOCIO CLÍNICAS Y LEGALES (INVIOLABLES)

1. **Inmutabilidad Clínica y Metodología SOEP:**
   * Las notas de evolución médica bajo formato SOEP (Subjetivo, Objetivo, Evaluación, Plan) no admiten edición transcurridas 24 horas desde su creación.
   * Toda corrección posterior debe instrumentarse mediante una **Nota de Adenda / Aclaratoria** firmada por el profesional.
2. **Odontograma y Periodontograma:**
   * Soporte simultáneo de nomenclatura FDI (dos dígitos) y Universal.
   * Fórmula del Nivel de Inserción Clínica: $\text{NIC} = \text{Profundidad de Sondaje (PS)} + \text{Margen Gingival (MG)}$.
   * Código cromático: Caries (Rojo), Tratamiento existente (Azul), Tratamiento proyectado (Verde/Naranja).
3. **Control Físico de Sillones:**
   * El sistema debe impedir a nivel de base de datos (`EXCLUDE USING gist`) y servicio el solapamiento horario en el mismo sillón dental físico.
4. **Arqueo y Cierre Ciego de Caja:**
   * Los cajeros no deben tener acceso a los saldos teóricos esperados en el sistema antes de enviar el conteo físico de dinero.
5. **Descargo Automático de Inventario:**
   * Cada procedimiento odontológico completado debe descontar de forma transaccional los insumos del sillón/consultorio según su receta clínica.

---

## 3. SEGURIDAD Y CUMPLIMIENTO LOPDP (DATOS SENSIBLES)

1. **Cifrado a Nivel de Campo (Field-Level Encryption):**
   * Los antecedentes patológicos, diagnósticos médicos y notas clínicas deben cifrarse en reposo mediante **AES-256-GCM** antes de persistir en PostgreSQL.
2. **Archivos y Radiografías:**
   * Todo archivo debe pasar por escaneo de malware en streaming con **ClamAV** antes de almacenarse en S3/MinIO.
   * Los buckets de almacenamiento son 100% privados. Solo se autoriza la visualización mediante **URLs prefirmadas temporales con expiración máxima de 5 minutos (300 s)**.
3. **Auditoría Forense Append-Only:**
   * Toda consulta, exportación o modificación de datos sensibles de pacientes debe generar un log inmutable de auditoría (Actor, IP, Timestamp, Motivo).
4. **Gestión de Sesiones (JWT + Redis):**
   * Access Token con vida máxima de 15 minutos.
   * Refresh Token en cookie HttpOnly / SameSite=Strict.
   * Desconexión automática tras 15 minutos continuos de inactividad gestionada en Redis.

---

## 4. ESTÁNDARES DE CALIDAD Y PRUEBAS

1. **Cobertura de Pruebas:**
   * Mínimo **80% de cobertura de código global** y **85% en módulos críticos** (cálculo de comisiones, NIC, facturación e inventario).
2. **Pirámide de Pruebas:**
   * Pruebas de componentes con **Vitest + React Testing Library**.
   * Pruebas de integración con **Supertest + Testcontainers (PostgreSQL y Redis reales)**.
   * Pruebas End-to-End con **Playwright** en flujos completos.
3. **Documentación:**
   * Mantener sincronizada la especificación OpenAPI 3.0 / Swagger en `/api/docs`.
   * Registrar cualquier cambio arquitectónico relevante en un archivo ADR dentro de `/docs/adr/`.
