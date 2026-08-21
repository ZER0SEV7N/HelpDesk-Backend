USE helpdesk_db;

-- 1. Insertar Planes
INSERT INTO planes VALUES 
(NULL, 10, 'Plan de soporte Básico', 
 '["Mantenimiento mensual de equipos", "Asistencia técnica remota", "Informe técnico de equipos"]', 
 49.99, 20, TRUE, NOW(), NOW()),

(NULL, 20, 'Plan Premium', 
 '["Mantenimiento quincenal", "Asistencia técnica remota y presencial", "Informe técnico detallado", "Antivirus corporativo"]', 
 149.99, 100, TRUE, NOW(), NOW()),

(NULL, 30, 'Tech Enterprise', 
 '["Mantenimiento semanal", "Soporte 24/7", "Asignación de técnico exclusivo", "Monitoreo de red en tiempo real"]', 
 399.99, 500, TRUE, NOW(), NOW());

-- 2. Insertar Empresa Cliente
INSERT INTO clientes VALUES
(NULL, 'JURIDICA', '20555666777', 'Innovación Global Tech', 'Av. Principal 123', '987654321', 'admin@innovaciontech.com', 'Tecnología', 3, '2026-01-01', '2027-01-01', 399.99, 500, NOW(), 1, NOW(), NOW());

-- 3. Insertar Sucursales
INSERT INTO sucursales VALUES
(NULL, 'Sede Central', 'Carlos Mendoza', '01-444-5555', 'Av. Principal 123', 'sede.central@innovaciontech.com', 1, 1, NOW(), NOW()),
(NULL, 'Sucursal Norte', 'María Vargas', '01-555-6666', 'Av. Norte 456', 'norte@innovaciontech.com', 1, 1, NOW(), NOW());

-- 4. Insertar Áreas (NUEVO)
-- Necesarias para poder asignar la relación FK id_area
INSERT INTO area VALUES
(NULL, 'Contabilidad', 'Juan Pérez', '01-444-5551', 'contabilidad@innovaciontech.com', 1, 1, NOW(), NOW()), -- id_area: 1 (Sede Central)
(NULL, 'Sistemas', 'Soporte Interno', '01-444-5552', 'sistemas@innovaciontech.com', 1, 1, NOW(), NOW()),   -- id_area: 2 (Sede Central)
(NULL, 'Ventas', 'Ana Gómez', '01-555-6661', 'ventas@innovaciontech.com', 2, 1, NOW(), NOW());            -- id_area: 3 (Sucursal Norte)

-- 5. Insertar Usuarios
-- Se asignó id_area en los datos correspondientes (columna 10)
INSERT INTO usuarios VALUES
(NULL, 'Daniel', 'Singer', 'admin@zaint.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '987654321', 1, 1, NULL, NULL, NULL, NOW(), NOW()), -- ADMIN
(NULL, 'Ana', 'López', 'ana.soporte@zaint.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '999888771', 1, 2, NULL, NULL, NULL, NOW(), NOW()), -- SOPORTE_TECNICO
(NULL, 'Luis', 'Torres', 'luis.insitu@zaint.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '999888772', 1, 3, NULL, NULL, NULL, NOW(), NOW()), -- SOPORTE_INSITU
(NULL, 'Carlos', 'Mendoza', 'example@gmail.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '123456789', 1, 4, 1, 1, NULL, NOW(), NOW()),       -- CLIENTE_EMPRESA
(NULL, 'María', 'Vargas', 'maria.sucursal2@empresa1.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '988333441', 1, 5, 1, 2, 3, NOW(), NOW()), -- CLIENTE_SUCURSAL (Asignada a Ventas)
(NULL, 'Jorge', 'Pérez', 'jorge.sede1@empresa1.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '988555661', 1, 6, 1, 1, 1, NOW(), NOW());      -- CLIENTE_TRABAJADOR (Asignado a Contabilidad)

-- 6. Insertar Equipos
-- Se asignó id_area al final (id_trabajador, id_cliente, id_sucursal, id_area)
INSERT INTO equipos VALUES
(NULL, 'Desktop', 'Dell', 'DL-889900', 'Jorge Pérez', 'Contabilidad', '2026-01-15', '2026-07-15', 6, 1, 1, 1, 1, NOW(), NOW()), -- Equipo en Contabilidad (id_area: 1)
(NULL, 'Laptop', 'Lenovo', 'LN-112233', 'María Vargas', 'Ventas', '2026-02-10', '2026-08-10', 5, 1, 2, 3, 1, NOW(), NOW());     -- Equipo en Ventas (id_area: 3)

-- 7. Insertar Catálogo de Software
INSERT INTO software VALUES
(NULL, 'Microsoft Office 365', 'Volumen', 'admin@zaint.com', 'O365-pass', '2026-01-01', '2027-01-01', 'Microsoft', 1, NOW(), NOW()),
(NULL, 'Adobe Photoshop', 'Individual', 'diseno@innovaciontech.com', 'Ps-pass123', '2026-02-01', '2027-02-01', 'Adobe', 1, NOW(), NOW());

-- 8. Insertar Catálogo de Hardware (Stock)
INSERT INTO hardware VALUES
(NULL, 'Disco Duro SSD', 'WD-500GB-998', '2025-12-01', 'Western Digital', 'PC Factory', 'SSD de 500GB NVMe', NULL, NULL, 1, NOW(), NOW()),
(NULL, 'Memoria RAM', 'CR-16GB-445', '2025-12-01', 'Corsair', 'PC Factory', 'RAM 16GB DDR4', NULL, NULL, 1, NOW(), NOW());

-- 9. Asignar Software a Equipos
INSERT INTO software_equipos VALUES
(NULL, 1, 1, NOW(), 'O365-KEY-1111', 1, 'Instalado para el área de contabilidad', NOW(), NOW()),
(NULL, 1, 2, NOW(), 'O365-KEY-2222', 1, 'Instalado para el área de ventas', NOW(), NOW()),
(NULL, 2, 2, NOW(), 'PS-KEY-9999', 1, 'Licencia individual de diseño', NOW(), NOW());

-- 10. Registrar Historial de Hardware
INSERT INTO registro_hardware VALUES
(NULL, NOW(), 'Ampliación de almacenamiento por falta de espacio', 'WD-500GB-998', 'PC Factory', 1, 1, NOW(), NOW()),
(NULL, NOW(), 'Aumento de RAM para mejorar rendimiento en edición', 'CR-16GB-445', 'PC Factory', 2, 2, NOW(), NOW());