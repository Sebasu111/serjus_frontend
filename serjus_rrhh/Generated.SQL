/*
Created: 6/09/2025
Modified: 23/09/2025
Model: MySQL 8.0
Database: MySQL 8.0
*/

-- Create tables section -------------------------------------------------

-- Table Empleado

CREATE TABLE `Empleado`
(
  `idEmpleado` Int NOT NULL AUTO_INCREMENT,
  `idAspirante` Int,
  `dpi` Varchar(13) NOT NULL,
  `nit` Varchar(9) NOT NULL,
  `nombre` Varchar(20) NOT NULL,
  `apellido` Varchar(20) NOT NULL,
  `genero` Varchar(10) NOT NULL,
  `lugarNacimiento` Varchar(100) NOT NULL,
  `fechaNacimiento` Date NOT NULL,
  `telefono` Varchar(10) NOT NULL,
  `email` Varchar(150) NOT NULL,
  `direccion` Varchar(150) NOT NULL,
  `estadoCivil` Varchar(15) NOT NULL,
  `idIdioma` Int,
  `idPuebloCultura` Int,
  `numeroHijos` Int NOT NULL,
  `numeroIggs` Varchar(50),
  `idEquipo` Int,
  `idEstado` Int NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  PRIMARY KEY (`idEmpleado`)
)
;

CREATE INDEX `IX_Relationship7` ON `Empleado` (`idAspirante`)
;

CREATE INDEX `IX_Relationship37` ON `Empleado` (`idEquipo`)
;

CREATE INDEX `IX_Relationship38` ON `Empleado` (`idIdioma`)
;

CREATE INDEX `IX_Relationship39` ON `Empleado` (`idPuebloCultura`)
;

ALTER TABLE `Empleado` ADD UNIQUE `email` (`email`)
;

-- Table Puesto

CREATE TABLE `Puesto`
(
  `idPuesto` Int NOT NULL AUTO_INCREMENT,
  `nombrePuesto` Varchar(100) NOT NULL,
  `descripcion` Varchar(150) NOT NULL,
  `salarioBase` Decimal(10,2) NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  PRIMARY KEY (`idPuesto`)
)
;

-- Table HistorialPuesto

CREATE TABLE `HistorialPuesto`
(
  `idHistorialPuesto` Int NOT NULL AUTO_INCREMENT,
  `idEmpleado` Int NOT NULL,
  `idPuesto` Int NOT NULL,
  `fechaInicio` Date NOT NULL,
  `fechaFin` Date,
  `salario` Decimal(10,2) NOT NULL,
  `observacion` Varchar(150) NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  PRIMARY KEY (`idHistorialPuesto`)
)
;

CREATE INDEX `IX_Relationship1` ON `HistorialPuesto` (`idEmpleado`)
;

CREATE INDEX `IX_Relationship2` ON `HistorialPuesto` (`idPuesto`)
;

-- Table Rol

CREATE TABLE `Rol`
(
  `idRol` Int NOT NULL AUTO_INCREMENT,
  `nombreRol` Varchar(100) NOT NULL,
  `descripcion` Varchar(150) NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idEstado` Int NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  PRIMARY KEY (`idRol`)
)
;

-- Table Usuario

CREATE TABLE `Usuario`
(
  `idUsuario` Int NOT NULL AUTO_INCREMENT,
  `nombreUsuario` Varchar(100) NOT NULL,
  `contrasena` Varchar(150) NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idEstado` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  `idRol` Int,
  `idEmpleado` Int,
  PRIMARY KEY (`idUsuario`)
)
;

CREATE INDEX `IX_Relationship3` ON `Usuario` (`idRol`)
;

CREATE INDEX `IX_Relationship4` ON `Usuario` (`idEmpleado`)
;

-- Table Ausencia

CREATE TABLE `Ausencia`
(
  `idAusencia` Int NOT NULL AUTO_INCREMENT,
  `idEmpleado` Int,
  `tipo` Varchar(50) NOT NULL,
  `motivo` Varchar(100) NOT NULL,
  `fechaInicio` Date NOT NULL,
  `fechaFin` Date,
  `idDocumento` Int NOT NULL,
  `idEstado` Int NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  PRIMARY KEY (`idAusencia`)
)
;

CREATE INDEX `IX_Relationship5` ON `Ausencia` (`idEmpleado`)
;

-- Table Aspirante

CREATE TABLE `Aspirante`
(
  `idAspirante` Int NOT NULL AUTO_INCREMENT,
  `nombreAspirante` Varchar(100) NOT NULL,
  `apellidoAspirante` Varchar(100) NOT NULL,
  `nit` Varchar(9) NOT NULL,
  `dpi` Varchar(13) NOT NULL,
  `genero` Varchar(10) NOT NULL,
  `email` Varchar(150) NOT NULL,
  `fechaNacimiento` Date NOT NULL,
  `telefono` Varchar(20) NOT NULL,
  `direccion` Varchar(150) NOT NULL,
  `idIdioma` Int,
  `idPuebloCultura` Int,
  `idEstado` Int NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  PRIMARY KEY (`idAspirante`)
)
;

CREATE INDEX `IX_Relationship47` ON `Aspirante` (`idIdioma`)
;

CREATE INDEX `IX_Relationship48` ON `Aspirante` (`idPuebloCultura`)
;

-- Table Convocatoria

CREATE TABLE `Convocatoria`
(
  `idConvocatoria` Int NOT NULL AUTO_INCREMENT,
  `idPuesto` Int,
  `nombreConvocatoria` Varchar(150) NOT NULL,
  `descripcion` Varchar(150) NOT NULL,
  `fechaInicio` Date NOT NULL,
  `fechaFin` Date NOT NULL,
  `idEstado` Int NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  PRIMARY KEY (`idConvocatoria`)
)
;

CREATE INDEX `IX_Relationship13` ON `Convocatoria` (`idPuesto`)
;

-- Table Postulacion

CREATE TABLE `Postulacion`
(
  `idPostulacion` Int NOT NULL AUTO_INCREMENT,
  `idAspirante` Int NOT NULL,
  `idConvocatoria` Int NOT NULL,
  `fechaPostulacion` Date NOT NULL,
  `idEstado` Int NOT NULL,
  `estado` Bit(1) NOT NULL,
  `observacion` Varchar(150) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  PRIMARY KEY (`idPostulacion`)
)
;

CREATE INDEX `IX_Relationship10` ON `Postulacion` (`idAspirante`)
;

CREATE INDEX `IX_Relationship11` ON `Postulacion` (`idConvocatoria`)
;

-- Table CriterioEvaluacion

CREATE TABLE `CriterioEvaluacion`
(
  `idCriterioEvaluacion` Int NOT NULL AUTO_INCREMENT,
  `nombreCriterio` Varchar(100) NOT NULL,
  `descripcionCriterio` Varchar(150) NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  PRIMARY KEY (`idCriterioEvaluacion`)
)
;

-- Table Evaluacion

CREATE TABLE `Evaluacion`
(
  `idEvaluacion` Int NOT NULL AUTO_INCREMENT,
  `idEmpleado` Int,
  `tipoEvaluacion` Varchar(100) NOT NULL,
  `fechaEvaluacion` Datetime NOT NULL,
  `puntajeTotal` Decimal(10,2) NOT NULL,
  `observacion` Varchar(150) NOT NULL,
  `idEstado` Int NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  `idPostulacion` Int,
  PRIMARY KEY (`idEvaluacion`)
)
;

CREATE INDEX `IX_Relationship19` ON `Evaluacion` (`idEmpleado`)
;

CREATE INDEX `IX_Relationship44` ON `Evaluacion` (`idPostulacion`)
;

-- Table EvaluacionCriterio

CREATE TABLE `EvaluacionCriterio`
(
  `idEvaluacionCriterio` Int NOT NULL AUTO_INCREMENT,
  `idEvaluacion` Int NOT NULL,
  `idCriterioEvaluacion` Int NOT NULL,
  `puntajeCriterio` Decimal(10,2) NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  PRIMARY KEY (`idEvaluacionCriterio`)
)
;

CREATE INDEX `IX_Relationship16` ON `EvaluacionCriterio` (`idCriterioEvaluacion`)
;

CREATE INDEX `IX_Relationship17` ON `EvaluacionCriterio` (`idEvaluacion`)
;

-- Table Induccion

CREATE TABLE `Induccion`
(
  `idInduccion` Int NOT NULL AUTO_INCREMENT,
  `fechaInicio` Date NOT NULL,
  `fechaFin` Date NOT NULL,
  `idEstado` Int NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  PRIMARY KEY (`idInduccion`)
)
;

-- Table Documento

CREATE TABLE `Documento`
(
  `idDocumento` Int NOT NULL AUTO_INCREMENT,
  `idTipoDocumento` Int,
  `archivo` Longblob NOT NULL,
  `nombreArchivo` Varchar(150) NOT NULL,
  `mimeArchivo` Varchar(10) NOT NULL,
  `fechaSubida` Date NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  `idEmpleado` Int,
  PRIMARY KEY (`idDocumento`)
)
;

CREATE INDEX `IX_Relationship21` ON `Documento` (`idTipoDocumento`)
;

CREATE INDEX `IX_Relationship45` ON `Documento` (`idEmpleado`)
;

-- Table TipoDocumento

CREATE TABLE `TipoDocumento`
(
  `idTipoDocumento` Int NOT NULL AUTO_INCREMENT,
  `nombreTipo` Varchar(150) NOT NULL,
  `cantidadRepetir` Int NOT NULL,
  `descripcion` Varchar(150) NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  PRIMARY KEY (`idTipoDocumento`)
)
;

-- Table InduccionDocumento

CREATE TABLE `InduccionDocumento`
(
  `idInduccionDocumento` Int NOT NULL AUTO_INCREMENT,
  `idInduccion` Int NOT NULL,
  `idDocumento` Int NOT NULL,
  `fechaAsignado` Date NOT NULL,
  `fechaCompletado` Date,
  `idEstado` Int NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  `idEmpleado` Int,
  PRIMARY KEY (`idInduccionDocumento`)
)
;

CREATE INDEX `IX_Relationship23` ON `InduccionDocumento` (`idInduccion`)
;

CREATE INDEX `IX_Relationship24` ON `InduccionDocumento` (`idDocumento`)
;

CREATE INDEX `IX_Relationship49` ON `InduccionDocumento` (`idEmpleado`)
;

-- Table Capacitacion

CREATE TABLE `Capacitacion`
(
  `idCapacitacion` Int NOT NULL AUTO_INCREMENT,
  `nombreEvento` Varchar(150) NOT NULL,
  `lugar` Varchar(150) NOT NULL,
  `fechaInicio` Date NOT NULL,
  `fechaFin` Date NOT NULL,
  `institucionFacilitadora` Varchar(150) NOT NULL,
  `montoEjecutado` Decimal(10,2) NOT NULL,
  `idEstado` Int NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  PRIMARY KEY (`idCapacitacion`)
)
;

-- Table EmpleadoCapacitacion

CREATE TABLE `EmpleadoCapacitacion`
(
  `idEmpleadoCapacitacion` Int NOT NULL AUTO_INCREMENT,
  `idEmpleado` Int NOT NULL,
  `idCapacitacion` Int NOT NULL,
  `asistencia` Bit(1) NOT NULL,
  `observacion` Varchar(150) NOT NULL,
  `idEstado` Int NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  PRIMARY KEY (`idEmpleadoCapacitacion`)
)
;

CREATE INDEX `IX_Relationship26` ON `EmpleadoCapacitacion` (`idCapacitacion`)
;

CREATE INDEX `IX_Relationship25` ON `EmpleadoCapacitacion` (`idEmpleado`)
;

-- Table TerminacionLaboral

CREATE TABLE `TerminacionLaboral`
(
  `idTerminacionLaboral` Int NOT NULL AUTO_INCREMENT,
  `tipoTerminacion` Varchar(20) NOT NULL,
  `fechaTerminacion` Date NOT NULL,
  `causa` Varchar(150) NOT NULL,
  `observacion` Varchar(150) NOT NULL,
  `idDocumento` Int NOT NULL,
  `idEstado` Int NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  `idContrato` Int,
  PRIMARY KEY (`idTerminacionLaboral`)
)
;

CREATE INDEX `IX_Relationship52` ON `TerminacionLaboral` (`idContrato`)
;

-- Table Contrato

CREATE TABLE `Contrato`
(
  `idContrato` Int NOT NULL AUTO_INCREMENT,
  `idHistorialPuesto` Int,
  `fechaInicio` Date NOT NULL,
  `fechaFin` Date,
  `fechaFirma` Date NOT NULL,
  `tipoContrato` Varchar(50) NOT NULL,
  `observacion` Varchar(150) NOT NULL,
  `idEstado` Int NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  PRIMARY KEY (`idContrato`)
)
;

CREATE INDEX `IX_Relationship40` ON `Contrato` (`idHistorialPuesto`)
;

-- Table Equipo

CREATE TABLE `Equipo`
(
  `idEquipo` Int NOT NULL AUTO_INCREMENT,
  `idCoordinador` Int NOT NULL,
  `nombreEquipo` Varchar(100) NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  PRIMARY KEY (`idEquipo`)
)
;

-- Table PuebloCultura

CREATE TABLE `PuebloCultura`
(
  `idPuebloCultura` Int NOT NULL AUTO_INCREMENT,
  `nombrePueblo` Varchar(20) NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  PRIMARY KEY (`idPuebloCultura`)
)
;

-- Table Idioma

CREATE TABLE `Idioma`
(
  `idIdioma` Int NOT NULL AUTO_INCREMENT,
  `nombreIdioma` Varchar(20) NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  PRIMARY KEY (`idIdioma`)
)
;

-- Table Amonestacion

CREATE TABLE `Amonestacion`
(
  `idAmonestacion` Int NOT NULL AUTO_INCREMENT,
  `idEmpleado` Int,
  `tipo` Varchar(20) NOT NULL,
  `fechaAmonestacion` Date NOT NULL,
  `motivo` Varchar(150) NOT NULL,
  `idDocumento` Int NOT NULL,
  `idEstado` Int NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  PRIMARY KEY (`idAmonestacion`)
)
;

CREATE INDEX `IX_Relationship43` ON `Amonestacion` (`idEmpleado`)
;

-- Table Estado

CREATE TABLE `Estado`
(
  `idEstado` Int NOT NULL AUTO_INCREMENT,
  `nombreEstado` Varchar(20) NOT NULL,
  `descripcion` Varchar(50) NOT NULL,
  `estado` Bit(1) NOT NULL,
  `idUsuario` Int NOT NULL,
  `createdAt` Timestamp NOT NULL,
  `updatedAt` Timestamp NOT NULL,
  PRIMARY KEY (`idEstado`)
)
;

-- Create foreign keys (relationships) section -------------------------------------------------

ALTER TABLE `HistorialPuesto` ADD CONSTRAINT `Relationship1` FOREIGN KEY (`idEmpleado`) REFERENCES `Empleado` (`idEmpleado`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `HistorialPuesto` ADD CONSTRAINT `Relationship2` FOREIGN KEY (`idPuesto`) REFERENCES `Puesto` (`idPuesto`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `Usuario` ADD CONSTRAINT `Relationship3` FOREIGN KEY (`idRol`) REFERENCES `Rol` (`idRol`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `Usuario` ADD CONSTRAINT `Relationship4` FOREIGN KEY (`idEmpleado`) REFERENCES `Empleado` (`idEmpleado`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `Ausencia` ADD CONSTRAINT `Relationship5` FOREIGN KEY (`idEmpleado`) REFERENCES `Empleado` (`idEmpleado`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `Empleado` ADD CONSTRAINT `Relationship7` FOREIGN KEY (`idAspirante`) REFERENCES `Aspirante` (`idAspirante`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `Postulacion` ADD CONSTRAINT `Relationship10` FOREIGN KEY (`idAspirante`) REFERENCES `Aspirante` (`idAspirante`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `Postulacion` ADD CONSTRAINT `Relationship11` FOREIGN KEY (`idConvocatoria`) REFERENCES `Convocatoria` (`idConvocatoria`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `Convocatoria` ADD CONSTRAINT `Relationship13` FOREIGN KEY (`idPuesto`) REFERENCES `Puesto` (`idPuesto`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `EvaluacionCriterio` ADD CONSTRAINT `Relationship16` FOREIGN KEY (`idCriterioEvaluacion`) REFERENCES `CriterioEvaluacion` (`idCriterioEvaluacion`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `EvaluacionCriterio` ADD CONSTRAINT `Relationship17` FOREIGN KEY (`idEvaluacion`) REFERENCES `Evaluacion` (`idEvaluacion`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `Evaluacion` ADD CONSTRAINT `Relationship19` FOREIGN KEY (`idEmpleado`) REFERENCES `Empleado` (`idEmpleado`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `Documento` ADD CONSTRAINT `Relationship21` FOREIGN KEY (`idTipoDocumento`) REFERENCES `TipoDocumento` (`idTipoDocumento`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `InduccionDocumento` ADD CONSTRAINT `Relationship23` FOREIGN KEY (`idInduccion`) REFERENCES `Induccion` (`idInduccion`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `InduccionDocumento` ADD CONSTRAINT `Relationship24` FOREIGN KEY (`idDocumento`) REFERENCES `Documento` (`idDocumento`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `EmpleadoCapacitacion` ADD CONSTRAINT `Relationship25` FOREIGN KEY (`idEmpleado`) REFERENCES `Empleado` (`idEmpleado`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `EmpleadoCapacitacion` ADD CONSTRAINT `Relationship26` FOREIGN KEY (`idCapacitacion`) REFERENCES `Capacitacion` (`idCapacitacion`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `Empleado` ADD CONSTRAINT `Relationship37` FOREIGN KEY (`idEquipo`) REFERENCES `Equipo` (`idEquipo`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `Empleado` ADD CONSTRAINT `Relationship38` FOREIGN KEY (`idIdioma`) REFERENCES `Idioma` (`idIdioma`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `Empleado` ADD CONSTRAINT `Relationship39` FOREIGN KEY (`idPuebloCultura`) REFERENCES `PuebloCultura` (`idPuebloCultura`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `Contrato` ADD CONSTRAINT `Relationship40` FOREIGN KEY (`idHistorialPuesto`) REFERENCES `HistorialPuesto` (`idHistorialPuesto`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `Amonestacion` ADD CONSTRAINT `Relationship43` FOREIGN KEY (`idEmpleado`) REFERENCES `Empleado` (`idEmpleado`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `Evaluacion` ADD CONSTRAINT `Relationship44` FOREIGN KEY (`idPostulacion`) REFERENCES `Postulacion` (`idPostulacion`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `Documento` ADD CONSTRAINT `Relationship45` FOREIGN KEY (`idEmpleado`) REFERENCES `Empleado` (`idEmpleado`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `Aspirante` ADD CONSTRAINT `Relationship47` FOREIGN KEY (`idIdioma`) REFERENCES `Idioma` (`idIdioma`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `Aspirante` ADD CONSTRAINT `Relationship48` FOREIGN KEY (`idPuebloCultura`) REFERENCES `PuebloCultura` (`idPuebloCultura`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `InduccionDocumento` ADD CONSTRAINT `Relationship49` FOREIGN KEY (`idEmpleado`) REFERENCES `Empleado` (`idEmpleado`) ON DELETE RESTRICT ON UPDATE RESTRICT
;

ALTER TABLE `TerminacionLaboral` ADD CONSTRAINT `Relationship52` FOREIGN KEY (`idContrato`) REFERENCES `Contrato` (`idContrato`) ON DELETE RESTRICT ON UPDATE RESTRICT
;
