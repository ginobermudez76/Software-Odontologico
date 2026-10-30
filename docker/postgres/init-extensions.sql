-- Extensiones requeridas para SIGO-Dental en PostgreSQL 16
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- Requerido para anti-colisión de citas en sillones físicos

