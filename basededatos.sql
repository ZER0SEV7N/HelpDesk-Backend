-- Crear la base de datos
DROP DATABASE IF EXISTS helpdesk_db;
CREATE DATABASE helpdesk_db IF NOT EXISTS;

-- Usar la base de datos
USE helpdesk_db;

--Definir la tabla roles
CREATE TABLE rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

-- Definir la tabla Planes
CREATE TABLE planes (
    id_plan INT AUTO_INCREMENT PRIMARY KEY,
    numero_plan INT NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(10, 2) NOT NULL
);

-- Crear la tabla clientes UNIFICADOS para Empresas y personas Naturales
create table clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    tipo_cliente ENUM('EMPRESA', 'NATURAL') DEFAULT 'EMPRESA',
    numero_documento VARCHAR(20) NOT NULL UNIQUE,
    nombre_principal VARCHAR(150) NOT NULL,
    direccion VARCHAR(200),
    telefono VARCHAR(20),
    correo VARCHAR(100),
    rubro VARCHAR(100),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Crear la tabla sucursales
CREATE TABLE sucursales (
    id_sucursal INT AUTO_INCREMENT PRIMARY KEY,
    nombre_sucursal VARCHAR(255) NOT NULL,
    encargado VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    id_cliente INT NOT NULL,
    CONSTRAINT fk_sucursal_cliente FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente) ON DELETE CASCADE
);

-- Crear la tabla Area
CREATE TABLE area (
    id_area INT AUTO_INCREMENT PRIMARY KEY,
    nombre_area VARCHAR(100) NOT NULL,
    contacto VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    id_sucursal INT,
    CONSTRAINT fk_area_sucursal FOREIGN KEY (id_sucursal) REFERENCES sucursales(id_sucursal) ON DELETE CASCADE
)

CREATE TABLE usuario (
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
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES rol(id_rol),
    CONSTRAINT fk_usuario_cliente FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_sucursal FOREIGN KEY (id_sucursal) REFERENCES sucursales(id_sucursal) ON DELETE SET NULL
);

-- 4. Tablas de Tercer Nivel (Inventario)
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
    id_plan INT,
    CONSTRAINT fk_equipos_cliente FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente) ON DELETE CASCADE,
    CONSTRAINT fk_equipos_sucursal FOREIGN KEY (id_sucursal) REFERENCES sucursales(id_sucursal) ON DELETE SET NULL,
    CONSTRAINT fk_equipos_plan FOREIGN KEY (id_plan) REFERENCES planes(id_plan)
);

-- 5. Tablas de Cuarto Nivel (Tickets)
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
    CONSTRAINT fk_tickets_cliente FOREIGN KEY (id_cliente) REFERENCES usuario(id_usuario),
    CONSTRAINT fk_tickets_soporte FOREIGN KEY (id_soporte) REFERENCES usuario(id_usuario)
);