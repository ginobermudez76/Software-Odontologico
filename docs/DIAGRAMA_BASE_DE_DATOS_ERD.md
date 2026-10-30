# DIAGRAMA INTEGRAL DE BASE DE DATOS Y MODELO ENTIDAD-RELACIÓN (ERD)
## Proyecto: Sistema Integral de Gestión Odontológica y Expediente Clínico Digital (SIGO-Dental)

**Documentos de Referencia:** [`SRS_SIGO_Dental.md`](../SRS_SIGO_Dental.md), [`ARQUITECTURA_TECNICA_SIGO_DENTAL.md`](../ARQUITECTURA_TECNICA_SIGO_DENTAL.md), [`docs/MODELO_DATOS_RBAC_DINAMICO_Y_ERRORES.md`](./MODELO_DATOS_RBAC_DINAMICO_Y_ERRORES.md)  
**Motor de Base de Datos:** PostgreSQL 16 con extensiones `pgcrypto` y `btree_gist`  
**Convenciones Obligatorias:**
* Identificadores Universales **UUID v4** en todas las tablas (`id UUID PRIMARY KEY DEFAULT gen_random_uuid()`).
* Soft Delete con campos `is_deleted BOOLEAN NOT NULL DEFAULT FALSE` y `deleted_at TIMESTAMP WITH TIME ZONE NULL`.
* **Partial Unique Indexes** en campos clave condicionados a `WHERE is_deleted = false`.
* Permisos booleanos en roles y opciones: **`lectura`**, **`escritura`** y **`borrado`** para control dinámico de visibilidad de botones en la UI.

---

## 1. DIAGRAMA ENTIDAD-RELACIÓN COMPLETO (MERMAID)

```mermaid
erDiagram
    %% ==========================================
    %% 1. SUBDOMINIO: SEGURIDAD, ROLES Y ACCESOS
    %% ==========================================
    SEDES ||--o{ USUARIOS : "emplea"
    SEDES ||--o{ SILLONES_DENTALES : "dispone_de"
    ROLES ||--o{ USUARIOS : "asigna_a"
    ROLES ||--o{ ROL_OPCION : "autoriza_en"
    MENU_OPCIONES ||--o{ ROL_OPCION : "se_vincula_con"
    MENU_OPCIONES ||--o{ MENU_OPCIONES : "subopcion_de (parent_id)"
    MENU_OPCIONES ||--o{ OPCION_ENDPOINT : "enlaza_con"
    ENDPOINTS ||--o{ OPCION_ENDPOINT : "se_asigna_a"

    ROLES {
        uuid id PK
        string nombre UK "WHERE is_deleted=false"
        string descripcion
        boolean lectura "Permiso global de lectura"
        boolean escritura "Permiso global de escritura"
        boolean borrado "Permiso global de borrado"
        boolean is_active
        boolean is_deleted
        timestamp deleted_at
    }

    USUARIOS {
        uuid id PK
        uuid rol_id FK
        uuid sede_id FK
        string tipo_documento
        string numero_documento UK "WHERE is_deleted=false"
        string nombres
        string apellidos
        string email UK "WHERE is_deleted=false"
        string password_hash
        string telefono
        string mfa_secret
        boolean is_mfa_enabled
        boolean is_active
        boolean is_deleted
        timestamp deleted_at
    }

    SEDES {
        uuid id PK
        string codigo UK "WHERE is_deleted=false"
        string nombre
        string direccion
        string telefono
        string email
        boolean is_active
        boolean is_deleted
        timestamp deleted_at
    }

    SILLONES_DENTALES {
        uuid id PK
        uuid sede_id FK
        string codigo UK "WHERE is_deleted=false"
        string nombre
        string descripcion
        boolean is_active
        boolean is_deleted
        timestamp deleted_at
    }

    MENU_OPCIONES {
        uuid id PK
        uuid parent_id FK "nullable"
        string codigo_opcion UK "WHERE is_deleted=false"
        string titulo
        string ruta_frontend
        string icono_material
        int orden_posicion
        boolean is_active
        boolean is_deleted
        timestamp deleted_at
    }

    ROL_OPCION {
        uuid id PK
        uuid rol_id FK
        uuid menu_opcion_id FK
        boolean lectura "Habilita ver la pantalla y listar datos"
        boolean escritura "Habilita botones Nuevo y Editar"
        boolean borrado "Habilita botones Eliminar y Anular"
        boolean is_deleted
        timestamp deleted_at
    }

    ENDPOINTS {
        uuid id PK
        string metodo_http "GET, POST, PUT, DELETE, PATCH"
        string ruta_api
        string accion_permiso
        string modulo_dominio
        boolean is_active
        boolean is_deleted
        timestamp deleted_at
    }

    OPCION_ENDPOINT {
        uuid id PK
        uuid menu_opcion_id FK
        uuid endpoint_id FK
    }

    %% ==========================================
    %% 2. SUBDOMINIO: PACIENTES Y EXPEDIENTE
    %% ==========================================
    SEDES ||--o{ PACIENTES : "registra_en"
    PACIENTES ||--|| EXPEDIENTES_CLINICOS : "posee"
    EXPEDIENTES_CLINICOS ||--o{ ODONTOGRAMAS : "contiene"
    EXPEDIENTES_CLINICOS ||--o{ PERIODONTOGRAMAS : "contiene"
    EXPEDIENTES_CLINICOS ||--o{ NOTAS_SOEP : "registra"
    NOTAS_SOEP ||--o{ ADENDAS_SOEP : "corrige_con"
    EXPEDIENTES_CLINICOS ||--o{ CONSENTIMIENTOS_INFORMADOS : "incluye"
    EXPEDIENTES_CLINICOS ||--o{ RECETAS_MEDICAS : "emite"

    PACIENTES {
        uuid id PK
        uuid sede_id FK
        string tipo_documento
        string numero_documento UK "WHERE is_deleted=false"
        string nombres
        string apellidos
        date fecha_nacimiento
        string sexo
        string email
        string telefono
        string direccion
        jsonb contacto_emergencia
        jsonb datos_tutor_legal "Exigido si < 18 años"
        jsonb seguro_convenio
        boolean is_active
        boolean is_deleted
        timestamp deleted_at
    }

    EXPEDIENTES_CLINICOS {
        uuid id PK
        uuid paciente_id FK UK
        string numero_expediente UK "WHERE is_deleted=false"
        text antecedentes_patologicos_cifrados "AES-256-GCM"
        text alergias_criticas_cifradas "AES-256-GCM"
        jsonb alertas_visibles "Para badge flotante en UI"
        timestamp fecha_creacion
        boolean is_deleted
        timestamp deleted_at
    }

    ODONTOGRAMAS {
        uuid id PK
        uuid expediente_id FK
        uuid odontologo_id FK
        string tipo_odontograma "INICIAL o EVOLUCION"
        string nomenclatura_activa "FDI o UNIVERSAL"
        string tipo_denticion "ADULTO (32) o NINO (20)"
        jsonb estado_piezas "Superficies, hallazgos, colores"
        text observaciones
        boolean is_deleted
        timestamp deleted_at
    }

    PERIODONTOGRAMAS {
        uuid id PK
        uuid expediente_id FK
        uuid odontologo_id FK
        timestamp fecha_registro
        jsonb datos_sondaje "6 puntos x diente: PS, MG, NIC, SS, SUP"
        decimal indice_placa
        decimal indice_sangrado
        boolean is_deleted
        timestamp deleted_at
    }

    NOTAS_SOEP {
        uuid id PK
        uuid expediente_id FK
        uuid cita_id FK "nullable"
        uuid odontologo_id FK
        text subjetivo_cifrado "AES-256-GCM"
        text objetivo
        string evaluacion_cie10 "K02.0, K04.0, etc."
        text plan
        boolean es_inmutable "True tras 24h"
        timestamp fecha_bloqueo
        timestamp created_at
        boolean is_deleted
        timestamp deleted_at
    }

    ADENDAS_SOEP {
        uuid id PK
        uuid nota_soep_id FK
        uuid odontologo_id FK
        text motivo_adenda
        text contenido_aclaratorio
        string firma_digital_hash "SHA-256"
        timestamp fecha_adenda
    }

    CONSENTIMIENTOS_INFORMADOS {
        uuid id PK
        uuid expediente_id FK
        uuid paciente_id FK
        uuid odontologo_id FK
        string tipo_procedimiento
        text texto_consentimiento
        string estado_firma "PENDIENTE, FIRMADO, RECHAZADO"
        text firma_biometrica_svg
        string ip_firma
        string otp_verificado
        string pdf_url "Bucket S3 Privado"
        string hash_sha256
        boolean is_deleted
        timestamp deleted_at
    }

    RECETAS_MEDICAS {
        uuid id PK
        uuid expediente_id FK
        uuid odontologo_id FK
        string codigo_verificacion_qr UK "WHERE is_deleted=false"
        jsonb medicamentos "Dosis, vía, frecuencia, días"
        text indicaciones_generales
        date fecha_emision
        date fecha_caducidad
        boolean is_deleted
        timestamp deleted_at
    }

    %% ==========================================
    %% 3. SUBDOMINIO: AGENDA Y TURNOS
    %% ==========================================
    PACIENTES ||--o{ CITAS : "recibe"
    USUARIOS ||--o{ CITAS : "atiende_como_odontologo"
    SILLONES_DENTALES ||--o{ CITAS : "se_realiza_en"
    SEDES ||--o{ CITAS : "aloja"

    CITAS {
        uuid id PK
        uuid paciente_id FK
        uuid odontologo_id FK
        uuid sillon_id FK
        uuid sede_id FK
        timestamp fecha_hora_inicio
        timestamp fecha_hora_fin
        string estado_cita "Programado, Confirmado, En Sala, Atendido, etc."
        string motivo_consulta
        int tiempo_espera_minutos
        boolean recordatorio_enviado_48h
        boolean recordatorio_enviado_24h
        boolean is_deleted
        timestamp deleted_at
    }

    %% ==========================================
    %% 4. SUBDOMINIO: FACTURACIÓN, POS Y CAJA
    %% ==========================================
    SEDES ||--o{ CAJAS_TURNOS : "opera_en"
    USUARIOS ||--o{ CAJAS_TURNOS : "custodia_como_cajero"
    CITAS ||--o{ COMPROBANTES_PAGO : "origina"
    PACIENTES ||--o{ COMPROBANTES_PAGO : "factura_a"
    USUARIOS ||--o{ COMPROBANTES_PAGO : "emite_como_cajero"
    COMPROBANTES_PAGO ||--o{ DETALLES_PAGO : "se_liquida_con"
    USUARIOS ||--o{ LIQUIDACIONES_HONORARIOS : "percibe_comision"

    CAJAS_TURNOS {
        uuid id PK
        uuid sede_id FK
        uuid cajero_id FK
        timestamp fecha_apertura
        timestamp fecha_cierre
        decimal monto_apertura
        decimal monto_teorico_calculado "Oculto en cierre ciego"
        decimal monto_fisico_declarado
        decimal diferencia_arqueo "Sobrante o Faltante"
        string estado_caja "ABIERTA, CERRADA_CIEGA, AUDITADA"
        text observaciones_arqueo
        boolean is_deleted
        timestamp deleted_at
    }

    COMPROBANTES_PAGO {
        uuid id PK
        uuid cita_id FK "nullable"
        uuid paciente_id FK
        uuid cajero_id FK
        string tipo_comprobante "FACTURA, BOLETA, NOTA_CREDITO"
        string serie_numero UK "WHERE is_deleted=false"
        decimal subtotal
        decimal iva
        decimal total
        string estado_fiscal "EMITIDO, TIMBRADO, RECHAZADO, ANULADO"
        string cufe_cae_fiscal
        string xml_url
        string pdf_url
        boolean is_deleted
        timestamp deleted_at
    }

    DETALLES_PAGO {
        uuid id PK
        uuid comprobante_id FK
        string metodo_pago "EFECTIVO, TARJETA, TRANSFERENCIA"
        decimal monto
        string referencia_voucher
        boolean is_deleted
        timestamp deleted_at
    }

    LIQUIDACIONES_HONORARIOS {
        uuid id PK
        uuid odontologo_id FK
        date periodo_inicio
        date periodo_fin
        decimal total_bruto_procedimientos
        decimal deducciones_laboratorio "RN-07"
        decimal porcentaje_comision
        decimal monto_neto_liquidado
        string estado_liquidacion "BORRADOR, APROBADA, PAGADA"
        boolean is_deleted
        timestamp deleted_at
    }

    %% ==========================================
    %% 5. SUBDOMINIO: INVENTARIOS Y CONSUMOS
    %% ==========================================
    PROCEDIMIENTOS_CATALOGO ||--o{ RECETAS_PROCEDIMIENTO : "especifica"
    INSUMOS_CLINICOS ||--o{ RECETAS_PROCEDIMIENTO : "es_consumido_en"
    INSUMOS_CLINICOS ||--o{ LOTES_INSUMO : "ingresa_por"
    CITAS ||--o{ DESCARGOS_INVENTARIO : "consume_al_atender"
    INSUMOS_CLINICOS ||--o{ DESCARGOS_INVENTARIO : "se_descarga"
    LOTES_INSUMO ||--o{ DESCARGOS_INVENTARIO : "descuenta_de"

    PROCEDIMIENTOS_CATALOGO {
        uuid id PK
        string codigo UK "WHERE is_deleted=false"
        string nombre
        string categoria "Operatoria, Cirugía, Endodoncia, etc."
        decimal precio_base
        decimal costo_laboratorio_sugerido
        int duracion_minutos
        boolean is_active
        boolean is_deleted
        timestamp deleted_at
    }

    INSUMOS_CLINICOS {
        uuid id PK
        string sku UK "WHERE is_deleted=false"
        string nombre
        string marca
        string unidad_medida "Cartucho, Gramo, Unidad, Par"
        int stock_minimo_seguridad
        boolean is_deleted
        timestamp deleted_at
    }

    LOTES_INSUMO {
        uuid id PK
        uuid insumo_id FK
        string numero_lote
        date fecha_vencimiento
        int cantidad_disponible
        decimal costo_unitario
        boolean is_deleted
        timestamp deleted_at
    }

    RECETAS_PROCEDIMIENTO {
        uuid id PK
        uuid procedimiento_id FK
        uuid insumo_id FK
        decimal cantidad_estandar_consumo
    }

    DESCARGOS_INVENTARIO {
        uuid id PK
        uuid cita_id FK
        uuid sillon_id FK
        uuid insumo_id FK
        uuid lote_id FK
        decimal cantidad_descargada
        timestamp timestamp_descargo
    }

    %% ==========================================
    %% 6. SUBDOMINIO: AUDITORÍA FORENSE APPEND-ONLY
    %% ==========================================
    USUARIOS ||--o{ AUDIT_LOGS : "genera_evento"

    AUDIT_LOGS {
        uuid id PK
        uuid usuario_id FK "nullable"
        string rol_momento
        string accion "LOGIN, READ, WRITE, UPDATE, SOFT_DELETE, EXPORT"
        string recurso "PACIENTES, SOEP, ODONTOGRAMA, FACTURA"
        uuid recurso_id
        string ip_origen
        string user_agent
        timestamp timestamp_evento
        jsonb metadata_cambios "Valores previos y nuevos"
        string hash_sha256 "Cadena de integridad WORM"
    }
```

---

## 2. MECANISMO DE CONTROL DE ACCIONES: `lectura`, `escritura`, `borrado`

### 2.1 Modelo Relacional en `roles` y `rol_opcion`

Cada rol posee valores por defecto para `lectura`, `escritura` y `borrado`, pero la tabla `rol_opcion` permite **granularidad por pantalla / módulo**:

```sql
-- Definición en tabla roles (comportamiento base del rol)
ALTER TABLE roles ADD COLUMN lectura BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE roles ADD COLUMN escritura BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE roles ADD COLUMN borrado BOOLEAN NOT NULL DEFAULT false;

-- Definición en tabla rol_opcion (permiso específico sobre una pantalla)
ALTER TABLE rol_opcion ADD COLUMN lectura BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE rol_opcion ADD COLUMN escritura BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE rol_opcion ADD COLUMN borrado BOOLEAN NOT NULL DEFAULT false;
```

* **`lectura = true`:** La opción es visible en el menú lateral Sidebar y el usuario puede ingresar a la pantalla y consultar listados / reportes. Si es `false`, la opción ni siquiera se dibuja en el menú.
* **`escritura = true`:** Habilita en la interfaz los botones de acción para crear nuevos registros o modificar existentes (ej. `[ + Nuevo Paciente ]`, `[ Guardar Odontograma ]`, `[ Confirmar Cita ]`).
* **`borrado = true`:** Habilita en la interfaz los botones destructivos de borrado lógico o anulación (ej. `[ Eliminar Insumo ]`, `[ Cancelar Turno ]`, `[ Anular Factura ]`).

---

### 2.2 Patrón de Frontend: Visibilidad Condicional de Botones

En el Frontend (React + TypeScript), el Custom Hook `useCurrentOptionPermissions()` consulta los permisos de la opción activa consumidos desde el payload de navegación (`GET /api/v1/auth/my-navigation`):

```typescript
// frontend/src/hooks/useCurrentOptionPermissions.ts
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export interface ActionPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

export function useCurrentOptionPermissions(): ActionPermissions {
  const location = useLocation();
  const navigationTree = useAuthStore((state) => state.navigationTree);

  // Busca la opción activa por ruta
  const currentOption = navigationTree.find((opt) => opt.ruta_frontend === location.pathname);

  return {
    canRead: currentOption ? currentOption.lectura : false,
    canWrite: currentOption ? currentOption.escritura : false,
    canDelete: currentOption ? currentOption.borrado : false,
  };
}
```

#### Uso en Vistas (Ejemplo en `PatientsList.tsx`):
```tsx
export function PatientsList() {
  const { canWrite, canDelete } = useCurrentOptionPermissions();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Ficha de Pacientes</h2>
        {/* Botón de Escritura: Se oculta completamente si canWrite es false */}
        {canWrite && (
          <button className={styles.btnPrimary} onClick={handleOpenCreateModal}>
            <span className="material-symbols-outlined">person_add</span>
            Nuevo Paciente
          </button>
        )}
      </div>

      <PatientTable
        renderActions={(patient) => (
          <div className={styles.actions}>
            <button title="Ver Ficha" onClick={() => handleView(patient.id)}>
              <span className="material-symbols-outlined">visibility</span>
            </button>
            {/* Botón de Modificación/Escritura */}
            {canWrite && (
              <button title="Editar" onClick={() => handleEdit(patient.id)}>
                <span className="material-symbols-outlined">edit</span>
              </button>
            )}
            {/* Botón de Eliminación: Se oculta si canDelete es false */}
            {canDelete && (
              <button title="Eliminar" onClick={() => handleDelete(patient.id)}>
                <span className="material-symbols-outlined">delete</span>
              </button>
            )}
          </div>
        )}
      />
    </div>
  );
}
```

---

## 3. COMPORTAMIENTO DE ÍNDICES PARCIALES ÚNICOS EN ACCIONES DE BORRADO

Al ejecutar un borrado (`borrado = true`), el backend ejecuta un **Soft Delete**:
```sql
-- Ejecución de borrado lógico
UPDATE procedure_catalog 
SET is_deleted = true, deleted_at = NOW() 
WHERE id = 'a5e8f491-3b7c-4a92-8012-98e3b5e41201';
```

Al estar indexado con:
```sql
CREATE UNIQUE INDEX uq_procedures_code_active 
ON procedure_catalog (code) 
WHERE is_deleted = false;
```
El registro eliminado deja de formar parte del índice único activo, permitiendo inmediatamente la reinserción de un nuevo procedimiento con el mismo código `code` sin error `409 Conflict`.
