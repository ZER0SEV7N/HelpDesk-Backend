-- Crear la base de datos
DROP DATABASE IF EXISTS helpdesk_db;
CREATE DATABASE IF NOT EXISTS helpdesk_db;

-- Usar la base de datos
USE helpdesk_db;

-- --------------------------------------------------------
-- 1. TABLAS PRINCIPALES INDEPENDIENTES
-- --------------------------------------------------------

-- Definir la tabla rol
CREATE TABLE rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Definir la tabla Planes
CREATE TABLE planes (
    id_plan INT AUTO_INCREMENT PRIMARY KEY,
    numero_plan INT NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(10, 2) DEFAULT 0.00,
    limite_equipos INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Definir la tabla software
CREATE TABLE software (
    id_software INT AUTO_INCREMENT PRIMARY KEY,
    nombre_software VARCHAR(100) NOT NULL,
    licencia VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    contraseña varchar(255) NOT NULL,
    fecha_instalacion DATE NOT NULL,
    fecha_caducidad DATE NOT NULL CHECK (fecha_caducidad >= fecha_instalacion + INTERVAL 1 YEAR),
    proveedor varchar(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear la tabla de hardware 
CREATE TABLE hardware (
    id_hardware INT AUTO_INCREMENT PRIMARY KEY,
    tipo_equipo VARCHAR(100) NOT NULL,
    numero_serie VARCHAR(100) NOT NULL,
    fecha_compra DATE NOT NULL,
    marca VARCHAR(100) NOT NULL,
    proveedor VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ult_revision DATE,
    rev_programada DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- 2. TABLAS CON DEPENDENCIAS (JERARQUÍA DE CLIENTES)
-- --------------------------------------------------------

-- Crear la tabla clientes UNIFICADOS para Empresas y personas Naturales
CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    tipo_cliente ENUM('JURIDICA', 'NATURAL') DEFAULT 'JURIDICA',
    numero_documento VARCHAR(20) UNIQUE,
    nombre_principal VARCHAR(150) NOT NULL,
    direccion VARCHAR(200),
    telefono VARCHAR(20),
    correo VARCHAR(100),
    rubro VARCHAR(100),
    id_plan INT,
    fecha_finalizacion_plan DATE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    constraint fk_clientes_plan foreign key (id_plan) references planes(id_plan) on delete set null 
);

-- Crear la tabla sucursales
CREATE TABLE sucursales (
    id_sucursal INT AUTO_INCREMENT PRIMARY KEY,
    nombre_sucursal VARCHAR(255) NOT NULL,
    encargado VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    correo VARCHAR(255) NOT NULL,
    id_cliente INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sucursal_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
);

-- Crear la tabla Area
CREATE TABLE area (
    id_area INT AUTO_INCREMENT PRIMARY KEY,
    nombre_area VARCHAR(100) NOT NULL,
    contacto VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    id_sucursal INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_area_sucursal FOREIGN KEY (id_sucursal) REFERENCES sucursales(id_sucursal) ON DELETE CASCADE
);

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    telefono VARCHAR(15),
    is_active BOOLEAN DEFAULT TRUE,
    id_rol INT,
    id_cliente INT,
    id_sucursal INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES rol(id_rol),
    CONSTRAINT fk_usuario_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_sucursal FOREIGN KEY (id_sucursal) REFERENCES sucursales(id_sucursal) ON DELETE SET NULL
);

-- Crear la tabla de equipos
CREATE TABLE equipos (
    id_equipo INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    marca VARCHAR(50) NOT NULL,
    num_serie VARCHAR(100) NOT NULL,
    nombre_usuario VARCHAR(100),
    area VARCHAR(100),
    ult_revision DATE,
    rev_programada DATE,
    id_cliente INT NOT NULL,
    id_sucursal INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_equipos_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    CONSTRAINT fk_equipos_sucursal FOREIGN KEY (id_sucursal) REFERENCES sucursales(id_sucursal) ON DELETE SET NULL
);

-- --------------------------------------------------------
-- 3. TABLAS INTERMEDIAS ENRIQUECIDAS (MAGIA DEL INVENTARIO)
-- --------------------------------------------------------

-- Relación: Un equipo puede tener varios softwares (CON CAMPOS EXTRA)
CREATE TABLE software_equipos (
    id_software_equipos INT AUTO_INCREMENT PRIMARY KEY,
    id_software INT NOT NULL,
    id_equipo INT NOT NULL,
    fecha_instalacion DATETIME DEFAULT CURRENT_TIMESTAMP, 
    licencia_asignada VARCHAR(100),                      
    is_active BOOLEAN DEFAULT TRUE,                       
    observaciones TEXT,                                   
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_se_software FOREIGN KEY (id_software) REFERENCES software(id_software) ON DELETE CASCADE,
    CONSTRAINT fk_se_equipos FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo) ON DELETE CASCADE
);

-- Relación: Historial de piezas/hardware instaladas (CON ID_EQUIPO)
CREATE TABLE registro_hardware (
    id_RH INT AUTO_INCREMENT PRIMARY KEY,
    fecha_instalacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT NOT NULL,
    serie VARCHAR(100) NOT NULL,
    proveedor VARCHAR(255) NOT NULL,
    id_hardware INT NOT NULL,
    id_equipo INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rh_hardware FOREIGN KEY (id_hardware) REFERENCES hardware(id_hardware) ON DELETE CASCADE,
    CONSTRAINT fk_rh_equipo FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo) ON DELETE CASCADE -- NUEVA FK
);

-- --------------------------------------------------------
-- 4. TABLA DE TICKETS
-- --------------------------------------------------------

CREATE TABLE tickets (
    id_tickets INT AUTO_INCREMENT PRIMARY KEY,
    pin VARCHAR(6) NOT NULL UNIQUE,
    asunto VARCHAR(255) NOT NULL,
    detalle TEXT NOT NULL,
    estado ENUM('Pendiente', 'Asignado', 'En Progreso', 'Reabierto', 'Cerrado') DEFAULT 'Pendiente',
    id_equipo INT NOT NULL,
    id_cliente INT NOT NULL,
    id_soporte INT,
    id_software INT, 
    es_software BOOLEAN DEFAULT FALSE,
    imagen_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tickets_equipo FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo),
    CONSTRAINT fk_tickets_clientes FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    CONSTRAINT fk_tickets_soporte FOREIGN KEY (id_soporte) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_tickets_software FOREIGN KEY (id_software) REFERENCES software(id_software) ON DELETE SET NULL
);

-- --------------------------------------------------------
-- INSERCIÓN DE DATOS DE PRUEBA (SEED DATA)
-- --------------------------------------------------------

-- 1. Insertar Roles
INSERT rol VALUES
(null, 'ADMINISTRADOR', NOW()),
(null, 'SOPORTE_TECNICO', NOW()),
(null, 'SOPORTE_INSITU', NOW()),
(null, 'CLIENTE_EMPRESA', NOW()),
(null, 'CLIENTE_SUCURSAL', NOW()),
(null, 'CLIENTE_TRABAJADOR', NOW());

-- 2. Insertar Planes
INSERT planes VALUES 
(NULL, 1, 'Básico', 'Soporte 8x5, respuesta 24h', 49.99, 20, NOW(), NOW()),
(NULL, 2, 'Premium', 'Soporte 4h, mantenimiento preventivo', 149.99, 100, NOW(), NOW()),
(NULL, 3, 'Tech Enterprise', 'Soporte 24/7, SLA garantizado', 399.99, 500, NOW(), NOW());

-- 3. Insertar Empresa Cliente de Prueba
INSERT clientes VALUES
(NULL, 'JURIDICA', '20555666777', 'Innovación Global Tech', 'Av. Principal 123', '987654321', 'admin@innovaciontech.com', 'Tecnología', 3, '2027-01-01', NOW(), 1, NOW(), NOW());

-- 4. Insertar Sucursal de Prueba
INSERT sucursales VALUES
(NULL, 'Sede Central', 'Carlos Mendoza', '01-444-5555', 'Av. Principal 123', 'sede.central@innovaciontech.com', 1, 1, NOW(), NOW());

-- 5. Insertar Administrador por Defecto (Tu cuenta de Zaint)
-- La contraseña encriptada es: 123456
INSERT usuarios VALUES
(NULL, 'Daniel', 'Singer', 'admin@zaint.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '987654321', 1, 1, NULL, NULL, NOW(), NOW());

-- 6. Insertar Equipos de Prueba
INSERT equipos VALUES
(NULL, 'Desktop', 'Dell', 'DL-889900', 'Juan Perez', 'Contabilidad', '2026-01-15', '2026-07-15', 1, 1, 1, NOW(), NOW()),
(NULL, 'Laptop', 'Lenovo', 'LN-112233', 'Maria Gomez', 'Gerencia', '2026-02-10', '2026-08-10', 1, 1, 1, NOW(), NOW());

-- 7. Insertar Catálogo de Software
INSERT software VALUES
(NULL, 'Microsoft Office 365', 'Volumen', 'admin@zaint.com', 'O365-pass', '2026-01-01', '2027-01-01', 'Microsoft', 1, NOW(), NOW()),
(NULL, 'Adobe Photoshop', 'Individual', 'diseno@innovaciontech.com', 'Ps-pass123', '2026-02-01', '2027-02-01', 'Adobe', 1, NOW(), NOW());

-- 8. Insertar Catálogo de Hardware (Stock)
INSERT hardware VALUES
(NULL, 'Disco Duro SSD', 'WD-500GB-998', '2025-12-01', 'Western Digital', 'PC Factory', 'SSD de 500GB NVMe', NULL, NULL, 1, NOW(), NOW()),
(NULL, 'Memoria RAM', 'CR-16GB-445', '2025-12-01', 'Corsair', 'PC Factory', 'RAM 16GB DDR4', NULL, NULL, 1, NOW(), NOW());

-- 9. Asignar Software a Equipos (Tabla Intermedia)
INSERT software_equipos VALUES
(NULL, 1, 1, NOW(), 'O365-KEY-1111', 1, 'Instalado para el área de contabilidad', NOW(), NOW()),
(NULL, 1, 2, NOW(), 'O365-KEY-2222', 1, 'Instalado para gerencia', NOW(), NOW()),
(NULL, 2, 2, NOW(), 'PS-KEY-9999', 1, 'Licencia individual de diseño', NOW(), NOW());

-- 10. Registrar Historial de Hardware (Tabla Intermedia)
INSERT registro_hardware VALUES
(NULL, NOW(), 'Ampliación de almacenamiento por falta de espacio', 'WD-500GB-998', 'PC Factory', 1, 1, NOW(), NOW()),
(NULL, NOW(), 'Aumento de RAM para mejorar rendimiento en edición', 'CR-16GB-445', 'PC Factory', 2, 2, NOW(), NOW());