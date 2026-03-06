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