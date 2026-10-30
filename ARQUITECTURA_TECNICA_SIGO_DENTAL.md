# DOCUMENTO DE ARQUITECTURA TÉCNICA Y DISEÑO DE SISTEMA (ADD)
## Proyecto: Sistema Integral de Gestión Odontológica y Expediente Clínico Digital (SIGO-Dental)

**Documento Base:** [`SRS_SIGO_Dental.md`](./SRS_SIGO_Dental.md)  
**Versión:** 1.0  
**Fecha:** 30 de octubre de 2026  
**Estado:** Aprobado para Fase de Construcción Técnica  
**Destinatarios:** Arquitectos de Software, Líderes Técnicos, Desarrolladores Fullstack, DevOps & SecOps  

---

## 1. DECISIÓN DE ARQUITECTURA: MONOLITO MODULAR VS. MICROSERVICIOS

### 1.1 Evaluación Técnica Comparativa

| Dimensión de Análisis | Microservicios Distribuidos | Monolito Modular (Modular Monolith) | Decisión para SIGO-Dental |
| :--- | :--- | :--- | :--- |
| **Integridad Transaccional (ACID)** | Compleja. Requiere patrones Saga / 2PC para operaciones atómicas entre citas, inventario y cobro. | Nativa. Las transacciones de PostgreSQL garantizan atomicidad (ej. cobro + facturación + descargo de stock). | **Monolito Modular** |
| **Latencia de Red** | Alta. Múltiples saltos HTTP/gRPC entre microservicios. | Mínima. Comunicación en memoria mediante llamadas a interfaces y eventos internos. | **Monolito Modular** |
| **Complejidad de Infraestructura & DevOps** | Muy alta. Requiere Service Mesh (Istio), orquestación Kubernetes, API Gateways distribuidos y tracing distribuido (Jaeger). | Óptima. Despliegue unificado en contenedores Docker estándar; menor costo de hosting y mantenimiento. | **Monolito Modular** |
| **Concurrencia (Fase 1: 150-500 usuarios)** | Sobredimensionado para la carga operativa inicial. | Ajustado con holgura. Un monolito optimizado en Node.js/NestJS atiende >1,500 req/s por réplica. | **Monolito Modular** |
| **Evolución y Desacoplamiento Futuro** | Difícil de corregir si los límites de dominio se trazaron erróneamente. | **Altamente desacoplado**. Cada módulo posee sus propios controladores, servicios, repositorios y contratos. Si un módulo (ej. Notificaciones o PACS) requiere escalar de forma independiente en Fase 2, se desacopla a microservicio sin refactorizar su lógica. | **Monolito Modular** |

### 1.2 Veredicto de Arquitectura
Se adopta formalmente el patrón **Monolito Modular con Arquitectura Limpia (Hexagonal / DDD)** para el backend:
1. **Un solo artefacto desplegable**, pero organizado internamente en **módulos de dominio estrictamente delimitados** (`Auth`, `Patients`, `ClinicalRecords`, `Appointments`, `Billing`, `Inventory`, `Audit`).
2. **Cero dependencias cruzadas desordenadas:** Los módulos sólo se comunican a través de contratos de interfaz (*Public Interfaces / Facades*) o un bus de eventos en memoria (`EventEmitter2`).
3. **Workers asíncronos:** Las tareas pesadas (recordatorios por WhatsApp/SMS, timbrado fiscal asíncrono y generación de PDFs) se delegan a un servicio trabajador de colas (*BullMQ* sobre Redis), desacoplado del ciclo de petición HTTP del usuario.

---

## 2. STACK TECNOLÓGICO Y FRAMEWORKS SELECCIONADOS

### 2.1 Frontend (Capa Cliente)
* **Framework:** **React 18/19 con TypeScript** sobre **Vite** (rendimiento de compilación ultrarrápido y tipado estricto de entidades odontológicas).
* **Diseño y Componentes:** **Tailwind CSS v3.4+** combinado con **Shadcn/ui** (componentes accesibles y sin dependencias propietarias basados en Radix UI).
* **Iconografía:** **Google Material Symbols & Icons (Outlined)** (`@material-symbols/svg-react` o Webfont oficial). **Se prohíbe el uso de emojis en toda la interfaz gráfica**, garantizando un diseño clínico sobrio y uniforme.
* **Manejo de Estado del Servidor y Caché:** **TanStack Query v5 (React Query)** para hidratación de datos, invalidación automática tras mutaciones y reintentos automáticos.
* **Manejo de Estado de Aplicación:** **Zustand** (almacenamiento ligero de sesión de usuario, consultorio activo y estado de edición del odontograma interactivo).
* **Formularios y Validación:** **React Hook Form** + **Zod** (esquemas de validación compartibles con el backend).
* **Enrutamiento:** **TanStack Router** o **React Router v6** con guardias de ruta y lazy-loading por submódulo.

### 2.2 Backend (Capa de Negocio y APIs)
* **Framework:** **NestJS 10+ (TypeScript)**. Proporciona inyección de dependencias nativa, modularidad empresarial estricta (`@Module`), interceptores, pipes de validación y generación automática de OpenAPI / Swagger.
* **ORM & Persistencia:** **Prisma ORM** sobre **PostgreSQL 16**.
* **Gestión de Colas y Trabajos Asíncronos:** **BullMQ** sobre **Redis 7**.
* **Motor de Plantillas de Documentos Médicos:** **Puppeteer** o **PDFKit** para renderizado server-side de consentimientos informados PDF/A y recetas con QR.

### 2.3 Persistencia, Caché y Almacenamiento
* **Base de Datos Principal:** **PostgreSQL 16** con soporte nativo de tipos `UUID`, campos semi-estructurados `JSONB` (para antecedentes médicos variables y parámetros de superficies del odontograma) e índices GIN.
* **Caché y Sesiones:** **Redis 7 (Alpine)** para catálogo de sesiones activas, control de inactividad, listas negras de tokens (revocación instantánea) y caché de tablas maestras.
* **Almacenamiento de Archivos (Object Storage):** **MinIO** en entornos locales/desarrollo (100% compatible con la API S3); **AWS S3 / Azure Blob Storage** en producción.
* **Motor Antivirus:** **ClamAV Daemon (`clamd`)** en contenedor dedicado para análisis antivirus de todo archivo médico antes de guardarse en el storage.

---

## 3. ESQUEMA DE CONTENEDORES (DOCKER & DOCKER COMPOSE)

El sistema se orquesta mediante Docker Compose para garantizar reproducibilidad exacta entre entornos de desarrollo, pruebas (Staging) y producción.

```mermaid
flowchart LR
    subgraph DOCKER_COMPOSE["Red Interna Docker (sigo-network: bridge)"]
        NGINX["sigo-frontend\n(Nginx Alpine :80/:443)"]
        API["sigo-backend\n(NestJS Node Alpine :3000)"]
        WORKER["sigo-worker\n(BullMQ Processor)"]
        DB[("sigo-db\n(PostgreSQL 16 :5432)")]
        CACHE[("sigo-redis\n(Redis 7 Alpine :6379)")]
        STORAGE[("sigo-storage\n(MinIO S3 :9000/:9001)")]
        CLAMAV["sigo-antivirus\n(ClamAV Daemon :3310)"]
    end

    CLIENT["Navegador Web / Tablet"] -->|HTTP/HTTPS| NGINX
    NGINX -->|Reverse Proxy /api| API
    API -->|Consultas SQL| DB
    API -->|Sesiones & Cache| CACHE
    API -->|Stream Análisis| CLAMAV
    API -->|S3 API| STORAGE
    API -->|Encolar Jobs| CACHE
    WORKER -->|Consumir Jobs| CACHE
    WORKER -->|Acceso DB| DB
```

### 3.1 Archivo `docker-compose.yml` (Entorno de Desarrollo / Producción Base)

```yaml
version: '3.8'

networks:
  sigo-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  minio_data:
  clamav_definitions:

services:
  # 1. Base de Datos Relacional
  sigo-db:
    image: postgres:16-alpine
    container_name: sigo-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: sigo_dental_db
      POSTGRES_USER: sigo_user
      POSTGRES_PASSWORD: sigo_password_secure
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - sigo-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sigo_user -d sigo_dental_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 2. Caché, Sesiones y Mensajería de Colas
  sigo-redis:
    image: redis:7-alpine
    container_name: sigo-redis
    restart: unless-stopped
    command: ["redis-server", "--requirepass", "redis_secure_password", "--appendonly", "yes"]
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - sigo-network
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "redis_secure_password", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 3. Motor Antivirus para Escaneo de Archivos Médicos
  sigo-antivirus:
    image: clamav/clamav:stable
    container_name: sigo-antivirus
    restart: unless-stopped
    volumes:
      - clamav_definitions:/var/lib/clamav
    networks:
      - sigo-network
    healthcheck:
      test: ["CMD", "clamdscan", "--ping", "10"]
      interval: 30s
      timeout: 10s
      retries: 3

  # 4. Almacenamiento de Archivos Compatible con S3
  sigo-storage:
    image: minio/minio:latest
    container_name: sigo-storage
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minio_admin
      MINIO_ROOT_PASSWORD: minio_secret_key_2026
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    networks:
      - sigo-network

  # 5. Backend API (NestJS Modular Monolith)
  sigo-backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: sigo-backend
    restart: unless-stopped
    depends_on:
      sigo-db:
        condition: service_healthy
      sigo-redis:
        condition: service_healthy
      sigo-antivirus:
        condition: service_healthy
    environment:
      NODE_ENV: development
      PORT: 3000
      DATABASE_URL: "postgresql://sigo_user:sigo_password_secure@sigo-db:5432/sigo_dental_db?schema=public"
      REDIS_HOST: sigo-redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: redis_secure_password
      CLAMAV_HOST: sigo-antivirus
      CLAMAV_PORT: 3310
      S3_ENDPOINT: "http://sigo-storage:9000"
      S3_ACCESS_KEY: minio_admin
      S3_SECRET_KEY: minio_secret_key_2026
      S3_BUCKET: "sigo-dental-docs"
      JWT_SECRET: "sigo_jwt_super_secret_key_change_in_prod"
      JWT_REFRESH_SECRET: "sigo_jwt_refresh_super_secret_key"
    ports:
      - "3000:3000"
    networks:
      - sigo-network

  # 6. Worker de Procesamiento en Segundo Plano
  sigo-worker:
    build:
      context: ./backend
      dockerfile: Dockerfile.worker
    container_name: sigo-worker
    restart: unless-stopped
    depends_on:
      sigo-db:
        condition: service_healthy
      sigo-redis:
        condition: service_healthy
    environment:
      NODE_ENV: development
      DATABASE_URL: "postgresql://sigo_user:sigo_password_secure@sigo-db:5432/sigo_dental_db?schema=public"
      REDIS_HOST: sigo-redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: redis_secure_password
    networks:
      - sigo-network

  # 7. Frontend Web Application (React + Vite + Nginx)
  sigo-frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: sigo-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - sigo-backend
    networks:
      - sigo-network
```

---

## 4. ESTRUCTURA DEL PROYECTO Y SEPARACIÓN ESTRICTA DE RESPONSABILIDADES

Para garantizar alta mantenibilidad, desacoplamiento absoluto y escalabilidad, el proyecto adopta una **Separación Estricta de Responsabilidades (Separation of Concerns - SoC)**.

### 4.1 Regla de Oro de Separación en el Frontend (Por Componente)

**Ningún archivo de componente debe mezclar lógica de negocio, estilos, marcado HTML y pruebas en un solo archivo.** Cada componente de UI o feature reside en su propia carpeta con **cinco archivos especializados**:

```
[NombreComponente]/
├── [NombreComponente].tsx         # 1. Capa de Vista / Marcado JSX (HTML estructurado con accesibilidad)
├── [NombreComponente].module.css  # 2. Capa de Estilos (CSS Modules / utilidades CSS personalizadas)
├── use[NombreComponente].ts       # 3. Capa Lógica / ViewModel (Custom Hook: estado, handlers, API)
├── [NombreComponente].types.ts    # 4. Capa de Contratos (Tipos TypeScript, Interfaces y Props)
├── [NombreComponente].test.tsx    # 5. Capa de Pruebas Funcionales y Unitarias (React Testing Library)
└── index.ts                       # 6. Barrel file de exportación pública limpia
```

#### Ejemplo Concreto: Componente `OdontogramTooth` (Pieza Dental Individual)

* **`OdontogramTooth.tsx` (Estructura / HTML / SVG):** Solo renderiza los polígonos vectoriales de las 5 superficies (vestibular, lingual, mesial, distal, oclusal), vinculando eventos limpios devueltos por el hook. Cero lógica de negocio incrustada.
* **`OdontogramTooth.module.css` (CSS):** Define las animaciones de selección táctil, gradientes SVG, sombras de profundidad y clases de alto contraste para el sillón dental.
* **`useOdontogramTooth.ts` (Lógica TS):** Gestiona el estado reactivo del diente, la conversión entre nomenclatura FDI y Universal, la validación de hallazgos (caries, amalgama, resina) y la emisión de mutaciones al store de Zustand.
* **`OdontogramTooth.types.ts` (Tipos TS):** Define las interfaces `ToothProps`, `ToothSurface`, `ToothFindingType` y los eventos `OnSurfaceClick`.
* **`OdontogramTooth.test.tsx` (Test TSX):** Verifica funcionalmente que hacer clic en la superficie oclusal aplique el color rojo (caries) y llame a la función `onUpdate`.

---

### 4.2 Regla de Oro de Separación en el Backend (Por Dominio / Módulo)

Cada módulo de NestJS aplica la **Arquitectura Hexagonal**:

```
[modulo-dominio]/
├── [dominio].controller.ts        # 1. Capa de Transporte / HTTP (Rutas, Swagger, Guards, Status Codes)
├── [dominio].service.ts           # 2. Capa de Aplicación / Casos de Uso (Lógica pura de negocio)
├── [dominio].repository.ts        # 3. Capa de Persistencia (Consultas SQL Prisma optimizadas)
├── dto/
│   ├── create-[dominio].dto.ts    # 4. Esquemas de validación de entrada (Zod / class-validator)
│   └── update-[dominio].dto.ts
├── entities/
│   └── [dominio].entity.ts        # 5. Entidades de Dominio e Interfaces de negocio
├── [dominio].spec.ts              # 6. Pruebas Unitarias del Servicio (Mocks)
├── [dominio].e2e-spec.ts          # 7. Pruebas de Integración de Endpoints (Supertest)
└── [dominio].module.ts            # 8. Contenedor de Inyección de Dependencias
```

---

### 4.3 Árbol Completo de Directorios del Repositorio

```
c:\Users\Gino\Proyectos\Software-Odontologico\
├── docker-compose.yml
├── .env.example
├── README.md
├── docs/
│   ├── adr/                         # Architectural Decision Records
│   ├── swagger/                     # Especificaciones OpenAPI / Swagger
│   └── lopdp-compliance.md          # Manual de protección de datos
│
├── frontend/                        # Aplicación React 18/19 + Vite + TypeScript
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── vitest.config.ts             # Configuración del Test Runner de Frontend
│   └── src/
│       ├── app/                     # Providers globales (QueryClient, AuthProvider) y Router
│       ├── assets/                  # Logos SVG y assets estáticos
│       ├── styles/                  # Estilos globales
│       │   ├── globals.css          # Tailwind base y variables de tema
│       │   └── typography.css       # Fuentes y tamaños
│       ├── components/              # Componentes de UI genéricos (Reutilizables)
│       │   ├── ui/                  # Primitivas tipo Shadcn (separadas por tsx, css, types, test)
│       │   │   ├── button/
│       │   │   │   ├── Button.tsx
│       │   │   │   ├── Button.module.css
│       │   │   │   ├── Button.types.ts
│       │   │   │   ├── Button.test.tsx
│       │   │   │   └── index.ts
│       │   │   ├── dialog/
│       │   │   ├── input/
│       │   │   └── select/
│       │   ├── icons/               # Adaptadores Google Material Symbols
│       │   │   ├── MaterialIcon.tsx
│       │   │   ├── MaterialIcon.types.ts
│       │   │   └── index.ts
│       │   ├── feedback/            # Toasts, AlertBanners, Skeletons
│       │   └── tables/              # DataTable genérica con paginación y orden
│       ├── layouts/                 # Plantillas de estructura de interfaz
│       │   ├── app-layout/
│       │   │   ├── AppLayout.tsx
│       │   │   ├── AppLayout.module.css
│       │   │   ├── useAppLayout.ts
│       │   │   ├── AppLayout.types.ts
│       │   │   ├── AppLayout.test.tsx
│       │   │   └── index.ts
│       │   └── components/
│       │       ├── navbar/
│       │       │   ├── Navbar.tsx
│       │       │   ├── Navbar.module.css
│       │       │   ├── useNavbar.ts
│       │       │   └── Navbar.test.tsx
│       │       ├── sidebar/
│       │       │   ├── Sidebar.tsx
│       │       │   ├── Sidebar.module.css
│       │       │   ├── useSidebar.ts
│       │       │   └── Sidebar.test.tsx
│       │       └── user-dropdown/
│       ├── features/                # Módulos por dominio clínico-administrativo
│       │   ├── auth/                # Login, MFA, Recuperación de clave
│       │   ├── patients/            # Filiación, Anamnesis, Alertas de salud
│       │   ├── clinical-record/     # Expediente Clínico Digital
│       │   │   ├── components/
│       │   │   │   ├── odontogram-2d/
│       │   │   │   │   ├── Odontogram2D.tsx
│       │   │   │   │   ├── Odontogram2D.module.css
│       │   │   │   │   ├── useOdontogram2D.ts
│       │   │   │   │   ├── Odontogram2D.types.ts
│       │   │   │   │   ├── Odontogram2D.test.tsx
│       │   │   │   │   └── index.ts
│       │   │   │   ├── odontogram-tooth/
│       │   │   │   │   ├── OdontogramTooth.tsx
│       │   │   │   │   ├── OdontogramTooth.module.css
│       │   │   │   │   ├── useOdontogramTooth.ts
│       │   │   │   │   ├── OdontogramTooth.types.ts
│       │   │   │   │   ├── OdontogramTooth.test.tsx
│       │   │   │   │   └── index.ts
│       │   │   │   ├── periodontogram-table/
│       │   │   │   │   ├── PeriodontogramTable.tsx
│       │   │   │   │   ├── PeriodontogramTable.module.css
│       │   │   │   │   ├── usePeriodontogramTable.ts
│       │   │   │   │   ├── PeriodontogramTable.types.ts
│       │   │   │   │   ├── PeriodontogramTable.test.tsx
│       │   │   │   │   └── index.ts
│       │   │   │   ├── soep-editor/
│       │   │   │   │   ├── SoepEditor.tsx
│       │   │   │   │   ├── SoepEditor.module.css
│       │   │   │   │   ├── useSoepEditor.ts
│       │   │   │   │   ├── SoepEditor.types.ts
│       │   │   │   │   ├── SoepEditor.test.tsx
│       │   │   │   │   └── index.ts
│       │   │   │   └── medical-alert-badge/
│       │   │   ├── hooks/       # Custom hooks propios del expediente
│       │   │   ├── services/    # Clientes de API clínica
│       │   │   └── types/       # Tipos TypeScript del dominio clínico
│       │   ├── appointments/        # Agenda, Colisión de sillones, Turnos
│       │   ├── treatment-plans/     # Presupuestos, Fases, Aprobaciones
│       │   ├── billing/             # POS, Arqueo de caja ciega, Facturación
│       │   ├── inventory/           # Stock por consultorio, Receta de insumos
│       │   └── audit-logs/          # Visor forense de accesos LOPDP
│       ├── hooks/                   # Custom Hooks globales (useAuth, useSessionTimeout)
│       ├── stores/                  # Stores Zustand (authStore, odontogramStore)
│       └── lib/                     # Axios/Fetch client interceptors, formatters
│
└── backend/                         # Monolito Modular NestJS + TypeScript
    ├── Dockerfile
    ├── Dockerfile.worker
    ├── package.json
    ├── tsconfig.json
    ├── prisma/
    │   ├── schema.prisma            # Esquema maestro de datos PostgreSQL
    │   └── migrations/              # Historial reproducible de migraciones SQL
    ├── test/                        # Pruebas End-to-End globales
    │   ├── jest-e2e.json
    │   ├── appointments-collision.e2e-spec.ts
    │   ├── blind-cash-close.e2e-spec.ts
    │   └── lopdp-encryption.e2e-spec.ts
    └── src/
        ├── app.module.ts            # Módulo raíz que ensambla los subdominios
        ├── main.ts                  # Bootstrap: CORS, Swagger, ValidationPipes
        ├── common/                  # Elementos transversales reutilizables
        │   ├── decorators/          # @CurrentUser(), @Roles(), @Audited()
        │   ├── filters/             # GlobalHttpExceptionFilter
        │   ├── guards/              # JwtAuthGuard, RolesGuard, LOPDPGuard
        │   ├── interceptors/        # AuditLogInterceptor, EncryptionInterceptor
        │   └── pipes/               # ZodValidationPipe, SanitizerPipe
        ├── config/                  # Carga y validación de variables de entorno (.env)
        ├── modules/                 # Subdominios de negocio aislados
        │   ├── auth/                # Login, MFA, JWT, Redis Session Manager
        │   ├── users/               # Gestión de usuarios, perfiles y credenciales
        │   ├── patients/            # Pacientes y filiación (Cifrado LOPDP)
        │   ├── clinical-records/    # Odontograma, Periodontograma, SOEP, Recetas
        │   ├── appointments/        # Agenda, Prevención colisión de sillones
        │   ├── treatment-plans/     # Catálogo médico, Presupuestos y Fases
        │   ├── billing/             # POS, Comprobantes fiscales, Caja ciega
        │   ├── inventory/           # Insumos, Deducción automática, Lotes
        │   ├── storage/             # Streaming a ClamAV y carga privada S3/MinIO
        │   ├── audit/               # Auditoría inmutable de sólo adición
        │   └── notifications/       # Jobs asíncronos para WhatsApp/SMS/Email
        └── workers/                 # Procesadores de fondo BullMQ con Redis
```

---

## 5. DISEÑO DE PANTALLAS, MENÚ EN SIDEBAR Y NAVBAR

### 5.1 Estandarización de Iconografía (Google Material Symbols)

Se implementa el paquete `@material-symbols/svg-react` o clases CSS `material-symbols-outlined`. **Ningún emoji es admitido en la aplicación.**

| Nombre del Icono (Google) | Representación en SIGO-Dental | Uso en el Sistema |
| :--- | :--- | :--- |
| `dentistry` | Pieza dental médica | Odontograma, expediente clínico, procedimientos |
| `calendar_month` | Calendario con cuadrícula | Agenda médica, citas por sillón, turnos |
| `person_search` | Persona con lupa | Búsqueda y ficha maestra de pacientes |
| `assignment` | Portapapeles con líneas | Notas de evolución SOEP y prescripciones |
| `vital_signs` | Trazo de pulso cardíaco | Periodontograma, signos vitales y anamnesis |
| `draw` | Lápiz manuscrito | Firma de consentimiento informado |
| `receipt_long` | Factura detallada | Punto de venta (POS), facturación fiscal |
| `point_of_sale` | Caja registradora | Apertura y cierre ciego de caja |
| `inventory_2` | Caja de almacenamiento | Inventario de insumos clínicos, lotes |
| `payments` | Billetes apilados | Liquidación de honorarios a profesionales |
| `analytics` | Gráficos estadísticos | Tableros de control directivo (BI) |
| `security` | Escudo con tilde | Auditoría forense y cumplimiento LOPDP |
| `settings` | Engranaje | Configuración del sistema y catálogos |

---

### 5.2 Estructura del Menú en Sidebar (Navegación Dinámica por Tablas en DB)

**Regla Arquitectónica Inviolable:** Queda terminantemente prohibido hardcodear las opciones del menú lateral en el frontend. La navegación se renderiza dinámicamente consumiendo el árbol JSON retornado por `GET /api/v1/auth/my-navigation`, el cual se alimenta de las tablas relacionales:
* `menu_options` (id UUID, parent_id UUID, codigo_opcion, titulo, ruta_frontend, icono_material, orden_posicion, is_deleted)
* `role_menu_options` (rol_opcion: id UUID, role_id UUID, menu_option_id UUID, puede_leer, puede_escribir, is_deleted)
* `menu_option_endpoints` (opcion_endpoint: vincula cada opción de pantalla con los endpoints autorizados en backend)

El Sidebar itera reactivamente este catálogo sin tener rutas fijas en código:

```
[ LOGO SIGO-DENTAL ]  Sede: Consultorio Central
─────────────────────────────────────────────────────────────
CLÍNICA
  [dentistry]        Expediente Clínico & Odontograma
  [calendar_month]   Agenda de Turnos y Sillones
  [person_search]    Gestión de Pacientes
  [vital_signs]      Periodontograma

ADMINISTRACIÓN & CAJA
  [receipt_long]     Punto de Venta (POS) & Cobros
  [point_of_sale]    Arqueo y Cierre Ciego de Caja
  [request_quote]    Presupuestos Odontológicos

LOGÍSTICA & ALMACÉN
  [inventory_2]      Inventario de Insumos & Lotes
  [category]         Catálogo de Procedimientos & Recetas

FINANZAS & GESTIÓN
  [payments]         Liquidación de Honorarios Médicos
  [analytics]        Dashboard Directivo de KPIs

SISTEMA & SEGURIDAD
  [security]         Bitácora de Auditoría (LOPDP)
  [manage_accounts]  Usuarios y Asignación de Roles
  [settings]         Parámetros de Sede & Consultorios
─────────────────────────────────────────────────────────────
[? help_outline] Soporte Técnico        [⇥ logout] Cerrar Sesión
```

### 5.3 Estructura del Navbar Superior

El Navbar permanece visible en toda la navegación clínica y contiene:
1. **Selector de Sede Activa:** Dropdown para cambiar entre clínicas de la red (si el usuario tiene permisos multirrecinto).
2. **Badge de Estado de Conexión:** Indicador dinámico (`En línea` en verde / `Modo Offline` en amarillo).
3. **Campana de Notificaciones:** Despliega alertas de inventario bajo, turnos confirmados por WhatsApp y avisos de citas en sala de espera.
4. **Reloj de Caducidad de Sesión:** Temporizador regresivo visible cuando restan menos de 2 minutos para el timeout de 15 minutos, con botón `Extender Sesión`.
5. **Perfil de Usuario:** Avatar, nombre completo, rol activo (ej. `Dr. Odontólogo Especialista`) y menú contextual con acceso a credenciales y botón de cierre forzoso.

---

## 6. GESTIÓN DE SESIONES, JWT Y EXPIRACIÓN EN REDIS

Para conjugar alta seguridad, expiración estricta y capacidad de revocación inmediata, se implementa una arquitectura **Híbrida JWT + Redis Token Store**:

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant FE as Frontend (React)
    participant API as Backend (NestJS Auth)
    participant REDIS as Redis (Session Store)
    participant DB as PostgreSQL

    U->>FE: Ingresa credenciales (Usuario + Clave)
    FE->>API: POST /api/v1/auth/login
    API->>DB: Verifica credenciales y MFA
    DB-->>API: Usuario Válido
    API->>API: Genera Access Token (JWT - 15 min)
    API->>API: Genera Refresh Token criptográfico (UUID v4)
    API->>REDIS: Guarda sesión activa (SETEX session:user_id:device_id, 28800s, refreshTokenHash)
    API->>REDIS: Registra último timestamp de actividad
    API-->>FE: Retorna Access Token + Refresh Token (HttpOnly Cookie)

    Note over FE,API: Cada llamada requiere Authorization: Bearer <AccessToken>

    FE->>API: GET /api/v1/patients/123
    API->>API: Valida firma de JWT y expiración
    API->>REDIS: Verifica si el token está en Blacklist o sesión expiró por inactividad
    REDIS-->>API: Sesión válida (actualiza TTL de inactividad de 15 min)
    API-->>FE: Respuesta HTTP 200 OK

    Note over U,API: Si transcurren 15 min sin peticiones:
    FE->>API: GET /api/v1/patients/123 (tras 15 min de inactividad)
    API->>REDIS: Consulta TTL de actividad
    REDIS-->>API: Inactividad excedida
    API-->>FE: HTTP 401 Unauthorized (SESSION_EXPIRED_INACTIVITY)
```

### 6.1 Detalle de Parámetros de Token y Sesión

1. **Access Token (JWT):**
   * **Algoritmo:** RS256 (clave pública/privada) o HS512.
   * **Tiempo de Vida:** **15 minutos** continuos.
   * **Contenido (Payload):** `sub` (ID de usuario), `role` (Rol primario), `permissions` (array de strings RBAC), `branchId` (ID de sede activa), `sessionId` (UUID de sesión en Redis).
2. **Refresh Token:**
   * Almacenado como cookie `HttpOnly`, `Secure`, `SameSite=Strict`.
   * **Tiempo de Vida:** **8 horas** (equivalente a una jornada clínica).
3. **Control de Inactividad y Blacklist en Redis:**
   * Clave: `session:active:{userId}:{sessionId}` con expiración deslizante (*Sliding Expiration*) de **15 minutos** que se refresca en cada interacción mediante un middleware interceptor.
   * Si el usuario cierra sesión voluntariamente o el Administrador revoca el acceso de una terminal, el `sessionId` o el `jti` del JWT se almacena en `blacklist:token:{jti}` con TTL remanente del JWT, invalidando cualquier llamada futura inmediatamente.

---

## 7. CONTROL DE ACCESO BASADO EN ROLES (RBAC)

Se define un modelo RBAC con permisos atómicos bajo la convención `dominio:accion`:

```mermaid
flowchart TD
    subgraph ROLES["Roles del Sistema"]
        R1["ADMIN_TI"]
        R2["DIRECTOR_MEDICO"]
        R3["ODONTOLOGO"]
        R4["ASISTENTE_DENTAL"]
        R5["RECEPCION_CAJA"]
        R6["CONTADOR"]
    end

    subgraph PERMISOS["Catálogo de Permisos Granulares"]
        P1["patient:create"]
        P2["patient:read_sensitive"]
        P3["clinical_record:write_soep"]
        P4["clinical_record:add_adenda"]
        P5["billing:create_invoice"]
        P6["billing:blind_close"]
        P7["inventory:deduct_stock"]
        P8["audit:view_forensic_logs"]
    end

    R1 --> P8
    R2 --> P2 & P3 & P4 & P8
    R3 --> P1 & P2 & P3 & P4 & P7
    R4 --> P1 & P7
    R5 --> P1 & P5 & P6
    R6 --> P5 & P6 & P8
```

### 7.1 Matriz de Permisos Detallada

| Permiso Técnico | Admin TI | Director Médico | Odontólogo | Asistente | Recepción / Caja | Contador |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `patient:create` / `patient:edit` | Sí | Sí | Sí | Sí | Sí | No |
| `patient:read_sensitive` (Anamnesis LOPDP) | No | Sí | Sí | Solo Alertas | Solo Datos Contacto | No |
| `clinical_record:write_soep` | No | Sí | Sí | No | No | No |
| `clinical_record:add_adenda` | No | Sí (Supervisor) | Sí (Autor) | No | No | No |
| `appointments:manage` | Sí | Sí | Solo suyas | Solo de su sillón | Sí (Todas) | No |
| `billing:blind_close` | No | Supervisión | No | No | Ejecución | Aprobación |
| `inventory:manage_stock` | Sí | Auditoría | Consulta | Registro uso | No | Control Costos |
| `audit:view_forensic_logs` | Sí | Sí | No | No | No | Auditoría |

---

## 8. ALMACENAMIENTO DE ARCHIVOS Y ESCANEO DE SEGURIDAD (CLAMAV)

Los archivos clínicos (fotografías intraorales, radiografías periapicales/panorámicas en JPG/PNG/DICOM y consentimientos informados en PDF/A) exigen un flujo de carga con estricta validación de ciberseguridad:

```mermaid
sequenceDiagram
    autonumber
    actor U as Odontólogo / Asistente
    participant FE as Frontend
    participant API as Backend (Storage Module)
    participant AV as Contenedor ClamAV
    participant S3 as MinIO / AWS S3
    participant DB as PostgreSQL

    U->>FE: Selecciona archivo (ej. Radiografia.png)
    FE->>API: POST /api/v1/storage/upload (Multipart/form-data)
    
    API->>API: Valida tamaño (Max 25MB) y extensión
    API->>API: Inspecciona Magic Bytes (MIME Type real, no simulado)
    
    API->>AV: Envía buffer en streaming vía socket TCP (INSTREAM)
    AV-->>API: Respuesta ClamAV: "stream: OK" (o "FOUND: Win.Malware...")
    
    alt Si contiene malware o virus
        API-->>FE: HTTP 422 Unprocessable Entity ("Archivo infectado rechazado")
        API->>DB: Registra evento de incidente en Auditoría
    else Archivo Limpio
        API->>API: Renombra archivo con hash único SHA-256 + UUID
        API->>S3: Sube objeto a Bucket Privado (Bucket con cifrado SSE-S3/KMS)
        API->>DB: Guarda metadata del archivo (ID, URL interna, Hash, Tamaño, PacienteID)
        API-->>FE: HTTP 201 Created (ID de archivo registrado)
    end

    Note over FE,API: Visualización de Archivos
    FE->>API: GET /api/v1/storage/file/:fileId/presigned-url
    API->>API: Valida permiso RBAC del solicitante
    API->>S3: Solicita URL prefirmada temporal (Válida por 5 minutos)
    S3-->>API: Retorna https://s3.amazonaws.com/...token...
    API-->>FE: Retorna URL temporal segura para renderizar en pantalla
```

### 8.1 Políticas de Seguridad de Archivos
1. **Acceso Cero a Buckets Públicos:** Los buckets de S3/MinIO no tienen permisos de lectura pública. Cualquier acceso requiere una **URL prefirmada temporal con tiempo de caducidad máximo de 300 segundos (5 minutos)**.
2. **Inspección de Firmas Binarias (Magic Bytes):** Se verifica la cabecera real de los archivos con librerías como `file-type` para prevenir ataques de ejecución de código disfrazados de imágenes (`.php.png` o `.exe.pdf`).
3. **Sanitización de Nombres de Archivo:** Se elimina el nombre original enviado por el cliente para impedir ataques de *Path Traversal*. El almacenamiento utiliza la convención:  
   `{paciente_uuid}/{categoria}/{sha256_hash}_{uuid}.{ext}`

---

## 9. PROTECCIÓN DE DATOS SENSIBLES SEGÚN LA LOPDP

La **Ley Orgánica de Protección de Datos Personales (LOPDP)** clasifica la información sobre diagnósticos médicos, enfermedades preexistentes y tratamientos odontológicos como **Datos Sensibles de Salud**, los cuales demandan un régimen reforzado de protección legal y técnica.

### 9.1 Matriz de Clasificación y Medidas LOPDP

| Categoría de Dato | Ejemplos | Nivel de Riesgo LOPDP | Medida Técnica de Protección |
| :--- | :--- | :---: | :--- |
| **Identificadores Generales** | Nombres, teléfono, correo, ciudad | Medio | Cifrado en tránsito (TLS 1.3), control RBAC estándar. |
| **Identificador Único Legal** | Cédula de Identidad / DNI / Pasaporte | Alto | Indexado determinista con HMAC-SHA256 para búsquedas; visible solo con rol autorizado. |
| **Datos Sensibles de Salud** | Alergias, VIH, hepatitis, diabetes, notas SOEP, radiografías | **Crítico** | **Cifrado en reposo a nivel de campo (Field-Level Encryption) con AES-256-GCM**. |
| **Datos Biométricos** | Trazos de firma digital, vectores de presión | **Crítico** | Cifrado asimétrico incrustado en contenedor PDF/A inalterable. |

### 9.2 Implementación de Cifrado a Nivel de Campo (Field-Level Encryption)

Para los campos de salud sensibles en PostgreSQL (`antecedentes_patologicos`, `alergias_criticas`, `notas_subjetivas`), la base de datos almacena un payload binario cifrado mediante un servicio de criptografía desacoplado:

$$\text{Payload Cifrado} = \text{AES-256-GCM}(\text{Dato Plano}, K_{\text{DEK}}, \text{IV}) + \text{Auth Tag}$$

* Las llaves de cifrado de datos (*Data Encryption Keys - DEK*) rotan periódicamente y son administradas mediante variables de entorno seguras o KMS.
* Si un atacante extrae una copia cruda de la base de datos mediante *SQL Injection* o volcado de backups, **no podrá descifrar los historiales clínicos ni las alertas de salud** al carecer de la llave maestra del servidor.

### 9.3 Gestión de Derechos ARCO vs. Obligación Sanitaria Legal

La LOPDP otorga a los ciudadanos derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO). No obstante, el sistema implementa una **Regla de Armonización Normativa con la Ley General de Salud**:

* **Derecho de Acceso:** El paciente puede solicitar la exportación de su historial clínico en formato PDF firmado digitalmente.
* **Derecho de Rectificación:** Si un paciente objeta un dato histórico, **no se borra el registro original** (para evitar fraude médico); en su lugar, se inserta una *Nota de Rectificación Aclaratoria* vinculada formalmente al registro objetado.
* **Derecho de Cancelación / Supresión:** **Excepción legal médica obligatoria**. Los datos de historia clínica están legalmente protegidos por la obligación sanitaria de conservación mínima por **10 años**. La supresión de la base de datos operativa se sustituye por un estado de **Bloqueo / Disociación (Seudonimización)**, archivando los registros fuera del alcance de la operación diaria pero disponibles exclusivamente ante mandatos judiciales o auditorías de la autoridad de salud.

---

## 10. DOCUMENTACIÓN TÉCNICA Y ESTÁNDARES DE CALIDAD

1. **Documentación Viva de APIs (OpenAPI 3.0 / Swagger):**
   * Endpoint de consulta interactiva: `/api/docs`.
   * Exportación JSON del contrato: `/api/docs-json`.
   * Todo endpoint debe contener tipado de respuesta, modelos de DTO con validaciones, y ejemplos de códigos de respuesta (`200`, `201`, `400`, `401`, `403`, `404`, `422`, `500`).

2. **Catálogo de Componentes UI (Storybook):**
   * El equipo de frontend mantiene un catálogo de componentes interactivos documentando cada variante de:
     * `Odontogram2D` (estados con caries, restauraciones, exodoncias, modo selección permanente y temporal).
     * `PeriodontogramTable` (entradas de 6 puntos, cálculo reactivo de NIC y validación de rangos 0-15 mm).
     * Primitivas de formulario y botones según el Design System de SIGO-Dental.

3. **Registros de Decisiones de Arquitectura (ADRs):**
   * Almacenados en el repositorio bajo `/docs/adr/`:
     * `ADR-001-modular-monolith-over-microservices.md`
     * `ADR-002-field-level-encryption-lopdp.md`
     * `ADR-003-google-material-symbols-standard.md`
     * `ADR-004-redis-session-jwt-hybrid-strategy.md`
     * `ADR-005-clamav-antivirus-file-scanning.md`
     * `ADR-006-component-strict-separation-of-concerns.md`

---

## 11. ESTRATEGIA INTEGRAL DE PRUEBAS FUNCIONALES Y AUTOMATIZACIÓN

Para asegurar que cada regla clínica y financiera opere con precisión absoluta, el proyecto adopta una estrategia basada en la **Pirámide de Pruebas de Automatización**:

```mermaid
flowchart TD
    E2E["Pruebas Funcionales End-to-End (Playwright)\nFlujos clínicos completos y visual testing"]
    INT["Pruebas de Integración (Supertest + Testcontainers)\nEndpoints API + PostgreSQL y Redis reales"]
    COMP["Pruebas de Componentes UI y Hooks (Vitest + RTL)\nInteracción de Odontograma, Periodontograma, Formularios"]
    UNIT["Pruebas Unitarias de Dominio (Vitest / Jest)\nCálculo de NIC, Fórmulas de Comisiones, Cifrado LOPDP"]

    E2E --> INT
    INT --> COMP
    COMP --> UNIT
```

### 11.1 Frameworks y Herramientas del Ecosistema de Pruebas

| Nivel de Prueba | Herramienta / Runner | Ámbito de Ejecución | Separación de Archivo |
| :--- | :--- | :--- | :--- |
| **Pruebas de Componente UI** | **Vitest** + **React Testing Library (RTL)** | Interacciones de UI, accesibilidad, clics en polígonos de dientes, eventos táctiles y reactividad. | `[Componente].test.tsx` (en la misma carpeta del componente). |
| **Pruebas de Hooks / Estado** | **Vitest** + **`renderHook`** | Lógica pura de `useOdontogramTooth`, `usePeriodontogramTable`, `useAuthStore`. | `use[Componente].test.ts`. |
| **Pruebas Unitarias Backend** | **Jest / Vitest** | Métodos de servicio, validadores DTO con Zod, funciones matemáticas y de encriptación. | `[dominio].service.spec.ts`. |
| **Pruebas de Integración API** | **Supertest** + **Testcontainers** | Controladores HTTP, middlewares, queries de Prisma contra un contenedor temporal real de PostgreSQL. | `[dominio].e2e-spec.ts`. |
| **Pruebas Funcionales E2E** | **Playwright** | Navegador real simulado (Chromium / WebKit) evaluando flujos completos desde login hasta facturación. | `tests/e2e/[flujo].spec.ts`. |

---

### 11.2 Casos de Prueba Funcionales Críticos (Especificación Gherkin)

#### TC-FUNC-01: Marcado Interactivo y Mutación de Superficies en Odontograma 2D
* **Archivo de Prueba:** `frontend/src/features/clinical-record/components/odontogram-2d/Odontogram2D.test.tsx`
* **Escenario:** Marcado de caries oclusal en pieza 16 (FDI).
```gherkin
Escenario: Registro de caries en la superficie oclusal de un molar
  Dado que el odontólogo tiene abierta la ficha de evolución del paciente
  Y el selector de herramienta está posicionado en "Caries (Rojo)"
  Cuando el profesional hace clic o pulsa sobre la superficie "Oclusal" de la pieza dental "16"
  Entonces el polígono oclusal de la pieza 16 debe cambiar su color a rojo (#EF4444)
  Y el store de Zustand debe registrar la mutación con estado "caries_activa"
  Y el resumen textual inferior debe listar: "Pieza 16 - Superficie Oclusal: Caries diagnosticada"
```

#### TC-FUNC-02: Periodontograma Digital y Cálculo Automático de NIC
* **Archivo de Prueba:** `frontend/src/features/clinical-record/components/periodontogram-table/PeriodontogramTable.test.tsx`
* **Escenario:** Cálculo instantáneo del Nivel de Inserción Clínica ($NIC = PS + MG$).
```gherkin
Escenario: Cálculo de NIC ante profundidad de sondaje y recesión gingival
  Dado que el profesional ingresa a la cuadrícula del periodontograma para la pieza 21
  Cuando ingresa una Profundidad de Sondaje (PS) de 4 mm en el punto Disto-Vestibular
  E ingresa un Margen Gingival (MG) de 2 mm (recesión)
  Entonces el sistema debe calcular automáticamente un NIC de 6 mm
  Y debe aplicar un indicador visual de alerta periodontal (color ámbar/rojo) al superar el umbral clínico de 4 mm
```

#### TC-FUNC-03: Bloqueo de Inmutabilidad de Notas SOEP a las 24 Horas
* **Archivo de Prueba:** `backend/src/modules/clinical-records/clinical-records.service.spec.ts`
* **Escenario:** Intento de modificación directa de una nota SOEP expirada.
```gherkin
Escenario: Rechazo de edición directa en nota SOEP con más de 24 horas de antigüedad
  Dado que existe una nota SOEP registrada con timestamp creado hace 25 horas
  Cuando un odontólogo envía un PUT /api/v1/clinical-records/soep/:id con nuevo texto de plan
  Entonces el backend debe rechazar la operación con HTTP 403 Forbidden
  Y debe retornar el mensaje de error: "La nota clínica ha expirado su ventana de edición (24h). Debe registrar una Nota de Adenda."
  Y el contenido original en PostgreSQL debe permanecer inalterado
```

#### TC-FUNC-04: Prevención de Colisión Física de Sillones Dentales (Anti-Overbooking)
* **Archivo de Prueba:** `backend/test/appointments-collision.e2e-spec.ts`
* **Escenario:** Intento de agendar dos turnos coincidentes en el mismo sillón físico.
```gherkin
Escenario: Detección y bloqueo de doble reserva en el mismo sillón dental
  Dado que el "Sillón Dental 02" tiene una cita agendada de 10:00 a 11:00 horas
  Cuando la recepcionista intenta agendar otra cita para el mismo "Sillón Dental 02" de 10:30 a 11:30 horas con otro profesional
  Entonces el sistema debe rechazar la solicitud con HTTP 409 Conflict
  Y debe retornar el código de error "CHAIR_ALREADY_OCCUPIED"
  Y la base de datos debe impedir la inserción mediante una restricción de exclusión temporal (EXCLUDE USING gist)
```

#### TC-FUNC-05: Cierre Ciego de Caja Registradora
* **Archivo de Prueba:** `backend/test/blind-cash-close.e2e-spec.ts`
* **Escenario:** Arqueo ciego con discrepancia calculada post-ingreso.
```gherkin
Escenario: Cierre de turno de caja sin revelar saldo teórico
  Dado que el cajero solicita el cierre de su turno
  Cuando visualiza la pantalla de arqueo
  Entonces los campos de "Total Sistema", "Total Esperado" y "Diferencia" deben estar ocultos en la UI y no transmitidos en el payload HTTP
  Cuando el cajero ingresa el conteo físico de $450.00 en efectivo y confirma el arqueo
  Entonces el sistema calcula internamente contra el saldo teórico ($480.00)
  Y genera el acta de cierre registrando un faltante de -$30.00 en auditoría
  Y bloquea la caja impidiendo nuevos cobros en ese turno
```

#### TC-FUNC-06: Descargo Automático de Stock Clínico al Atender Cita
* **Archivo de Prueba:** `backend/src/modules/inventory/inventory.service.spec.ts`
* **Escenario:** Deducción de anestesia y resina por catálogo de procedimiento.
```gherkin
Escenario: Descuento atómico de insumos al completar procedimiento
  Dado que el consultorio 1 tiene un stock de 50 cartuchos de "Mepivacaína 2%"
  Y el procedimiento "Restauración Resina Simple" tiene una receta vinculada de 1 cartucho de anestesia
  Cuando el odontólogo marca la cita como "Atendido" y confirma el procedimiento realizado
  Entonces el stock del consultorio 1 debe actualizarse a 49 cartuchos de forma transaccional en PostgreSQL
  Y se debe generar un movimiento de inventario de tipo "CONSUMO_CLINICO" con ID de cita asociado
```

#### TC-FUNC-07: Escaneo Antivirus en Carga de Archivos Clínicos (ClamAV)
* **Archivo de Prueba:** `backend/src/modules/storage/storage.service.spec.ts`
* **Escenario:** Intercepción de archivo infectado (prueba con firma estándar EICAR).
```gherkin
Escenario: Rechazo y aislamiento de archivo malicioso durante la subida
  Dado que un usuario intenta subir un archivo PDF que contiene la cadena de prueba EICAR
  Cuando el archivo es transmitido vía stream al socket de ClamAV
  Entonces ClamAV responde "FOUND: Eicar-Test-Signature"
  Y el backend aborta la carga a MinIO/S3 inmediatamente
  Y retorna HTTP 422 Unprocessable Entity con código "FILE_INFECTED_MALWARE"
  Y se registra un evento de alerta de seguridad en la bitácora de auditoría
```

#### TC-FUNC-08: Cifrado LOPDP a Nivel de Campo y Registro de Auditoría Forense
* **Archivo de Prueba:** `backend/test/lopdp-encryption.e2e-spec.ts`
* **Escenario:** Verificación de cifrado AES-256-GCM en base de datos física y log de consulta.
```gherkin
Escenario: Almacenamiento seguro e inalterable de antecedentes patológicos
  Dado que el odontólogo registra una nota clínica con el texto sensible "Paciente VIH positivo en tratamiento TARV"
  Cuando se inspecciona la fila cruda en la tabla "expediente_clinico" de PostgreSQL
  Entonces el campo "antecedentes_patologicos" debe contener bytes cifrados ininteligibles (AES-256-GCM con IV)
  Y cuando el Director Médico consulta el expediente a través del sistema
  Entonces el texto se descifra en memoria para su visualización autorizada
  Y se inserta automáticamente un registro inmutable en la tabla "audit_logs" con:
    | user_id | action | resource | ip_address | timestamp |
    | <uuid>  | READ   | MEDICAL_SENSITIVE_DATA | 192.168.1.45 | 2026-10-30T10:00:00Z |
```

---

### 11.3 Métricas de Cobertura de Código y Umbrales de Calidad

Para autorizar cualquier pase a producción o fusión en la rama principal (`main`), el pipeline de pruebas impone los siguientes **umbrales mínimos obligatorios**:

| Componente del Sistema | Cobertura de Líneas (% Lines) | Cobertura de Ramas (% Branches) | Cobertura de Funciones (% Funcs) |
| :--- | :---: | :---: | :---: |
| **Módulos Críticos de Dominio** (Cálculo NIC, Facturación, Inventario, Cifrado) | $\ge 85\%$ | $\ge 80\%$ | $\ge 90\%$ |
| **Componentes de UI Complejos** (Odontograma 2D, Periodontograma, SOEP) | $\ge 80\%$ | $\ge 75\%$ | $\ge 85\%$ |
| **Controladores y Endpoints API** | $\ge 80\%$ | $\ge 75\%$ | $\ge 80\%$ |
| **Promedio Global del Proyecto** | **$\ge 80\%$** | **$\ge 75\%$** | **$\ge 80\%$** |

---

## 12. PIPELINE DE INTEGRACIÓN CONTINUA (CI/CD) Y MATRIZ DE CALIDAD

Cada *Pull Request* ejecuta una secuencia de validación automatizada en GitHub Actions / GitLab CI:

```mermaid
flowchart LR
    A["1. Lint & Format Check\n(ESLint, Prettier, tsc)"] --> B["2. Pruebas Unitarias & Componentes\n(Vitest: tsx, module.css, hooks)"]
    B --> C["3. Pruebas de Integración\n(NestJS + Testcontainers Postgres/Redis)"]
    C --> D["4. Pruebas E2E y Accesibilidad\n(Playwright + Axe WCAG 2.1 AA)"]
    D --> E["5. Escaneo de Ciberseguridad\n(SonarQube, Trivy Container, Snyk)"]
    E --> F["6. Build & Empaquetado\n(Docker Multi-Stage Images)"]
```


