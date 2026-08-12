use helpdesk_db;

-- 2. Insertar Planes
INSERT planes VALUES 
(NULL, 10, 'Plan de soporte Básico', 
 '["Mantenimiento mensual de equipos", "Asistencia técnica remota", "Informe técnico de equipos"]', 
 49.99, 20, TRUE, NOW(), NOW()),

(NULL, 20, 'Plan Premium', 
 '["Mantenimiento quincenal", "Asistencia técnica remota y presencial", "Informe técnico detallado", "Antivirus corporativo"]', 
 149.99, 100, TRUE, NOW(), NOW()),

(NULL, 30, 'Tech Enterprise', 
 '["Mantenimiento semanal", "Soporte 24/7", "Asignación de técnico exclusivo", "Monitoreo de red en tiempo real"]', 
 399.99, 500, TRUE, NOW(), NOW());

-- 3. Insertar Empresa Cliente de Prueba
INSERT clientes VALUES
(NULL, 'JURIDICA', '20555666777', 'Innovación Global Tech', 'Av. Principal 123', '987654321', 'admin@innovaciontech.com', 'Tecnología', 3, '2026-01-01', '2027-01-01', 399.99, 500, NOW(), 1, NOW(), NOW());

-- 4. Insertar Sucursal de Prueba
INSERT sucursales VALUES
(NULL, 'Sede Central', 'Carlos Mendoza', '01-444-5555', 'Av. Principal 123', 'sede.central@innovaciontech.com', 1, 1, NOW(), NOW()),
(NULL, 'Sucursal Norte', 'María Vargas', '01-555-6666', 'Av. Norte 456', 'norte@innovaciontech.com', 1, 1, NOW(), NOW());

-- 5. Insertar Administrador por Defecto 
-- La contraseña encriptada es: 123456
INSERT usuarios VALUES
(NULL, 'Daniel', 'Singer', 'admin@zaint.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '987654321', 1, 1, NULL, NULL, NOW(), NOW()), -- ADMINISTRADOR
(NULL, 'Ana', 'López', 'ana.soporte@zaint.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '999888771', 1, 2, NULL, NULL, NOW(), NOW()), -- SOPORTE_TECNICO
(NULL, 'Luis', 'Torres', 'luis.insitu@zaint.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '999888772', 1, 3, NULL, NULL, NOW(), NOW()), -- SOPORTE_INSITU
(NULL, 'Carlos', 'Mendoza', 'example@gmail.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '123456789', 1, 4, 1, 1, NOW(), NOW()), -- CLIENTE_EMPRESA
(NULL, 'María', 'Vargas', 'maria.sucursal2@empresa1.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '988333441', 1, 5, 1, 2, NOW(), NOW()), -- CLIENTE_SUCURSAL
(NULL, 'Jorge', 'Pérez', 'jorge.sede1@empresa1.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '988555661', 1, 6, 1, 1, NOW(), NOW()); -- CLIENTE_TRABAJADOR

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