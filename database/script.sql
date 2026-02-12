-- Crear base de datos para el CRUD de Autos
CREATE DATABASE IF NOT EXISTS autos_db;
USE autos_db;

-- Crear tabla de autos
CREATE TABLE IF NOT EXISTS autos (
    placa VARCHAR(7) PRIMARY KEY,
    modelo VARCHAR(50) NOT NULL,
    color VARCHAR(30) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_correo (correo),
    INDEX idx_modelo (modelo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos de ejemplo (opcional)
INSERT INTO autos (placa, modelo, color, correo) VALUES
('ABC123', 'Toyota Corolla', 'Rojo', 'juan@email.com'),
('XYZ456', 'Honda Civic', 'Azul', 'maria@email.com'),
('DEF789', 'Ford Focus', 'Negro', 'carlos@email.com');

-- Verificar la creación
SELECT * FROM autos;
