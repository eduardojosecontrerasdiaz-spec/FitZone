-- Esquema original de FitZone (solo estructura; sin datos personales ni registros de ejemplo).
-- Seguro para crear las cuatro tablas originales en una base vacía.
-- No contiene DROP ni INSERT y no modifica tablas existentes por medio de ALTER.

CREATE TABLE IF NOT EXISTS `planes` (
  `id_plan` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `duracion_dias` smallint(5) unsigned NOT NULL DEFAULT 30,
  `descripcion` text DEFAULT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_plan`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `entrenadores` (
  `id_entrenador` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `especialidad` varchar(120) NOT NULL,
  `experiencia` varchar(60) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_entrenador`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `clases` (
  `id_clase` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `nivel` varchar(50) DEFAULT NULL,
  `duracion_minutos` smallint(5) unsigned NOT NULL,
  `horario` varchar(120) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `id_entrenador` int(10) unsigned DEFAULT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_clase`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `fk_clases_entrenador` (`id_entrenador`),
  CONSTRAINT `fk_clases_entrenador` FOREIGN KEY (`id_entrenador`)
    REFERENCES `entrenadores` (`id_entrenador`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `telefono` varchar(25) DEFAULT NULL,
  `documento` varchar(30) DEFAULT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `id_plan` int(10) unsigned NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`),
  UNIQUE KEY `documento` (`documento`),
  KEY `fk_usuarios_plan` (`id_plan`),
  CONSTRAINT `fk_usuarios_plan` FOREIGN KEY (`id_plan`)
    REFERENCES `planes` (`id_plan`)
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
