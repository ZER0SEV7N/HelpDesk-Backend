-- Crear la base de datos
DROP DATABASE IF EXISTS helpdesk_db;
CREATE DATABASE IF NOT EXISTS helpdesk_db ;

-- Usar la base de datos
USE helpdesk_db;

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
    contrasenia varchar(255) NOT NULL,
    fecha_instalancion DATE NOT NULL,
    fecha_caducidad DATE NOT NULL CHECK (fecha_caducidad >= fecha_instalancion + INTERVAL 1 YEAR),
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

-- Relación: Un equipo puede tener varios softwares y un software puede estar en varios equipos
CREATE TABLE software_equipos (
    id_software_equipos INT AUTO_INCREMENT PRIMARY KEY,
    id_software INT NOT NULL,
    id_equipos INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_se_software FOREIGN KEY (id_software) REFERENCES software(id_software) ON DELETE CASCADE,
    CONSTRAINT fk_se_equipos FOREIGN KEY (id_equipos) REFERENCES equipos(id_equipo) ON DELETE CASCADE
);

-- Relación: Historial de piezas/hardware instaladas (ej. un disco duro nuevo)
CREATE TABLE registro_hardware (
    id_RH INT AUTO_INCREMENT PRIMARY KEY,
    fecha_instalacion DATETIME NOT NULL,
    descripcion TEXT NOT NULL,
    serie VARCHAR(100) NOT NULL,
    proveedor VARCHAR(255) NOT NULL,
    id_hardware INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rh_hardware FOREIGN KEY (id_hardware) REFERENCES hardware(id_hardware) ON DELETE CASCADE
);

-- Crear la tabla de tickets
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
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tickets_equipo FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo),
    CONSTRAINT fk_tickets_clientes FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    CONSTRAINT fk_tickets_soporte FOREIGN KEY (id_soporte) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_tickets_software FOREIGN KEY (id_software) REFERENCES software(id_software) ON DELETE SET NULL
);

-- Insertar los Roles
INSERT rol VALUES
(null, 'ADMINISTRADOR', NOW()),
(null, 'SOPORTE_TECNICO', NOW()),
(null, 'SOPORTE_INSITU', NOW()),
(null, 'CLIENTE_EMPRESA', NOW()),
(null, 'CLIENTE_SUCURSAL', NOW()),
(null, 'CLIENTE_TRABAJADOR', NOW());