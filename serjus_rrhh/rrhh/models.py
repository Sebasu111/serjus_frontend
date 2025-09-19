# This is an auto-generated Django model module.

# You'll have to do the following manually to clean this up:

#   * Rearrange models' order

#   * Make sure each model has one field with primary_key=True

#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior

#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table

# Feel free to rename the models, but don't rename db_table values or field names.

from django.db import models

class Amonestacion(models.Model):

    idamonestacion = models.AutoField(db_column='idAmonestacion', primary_key=True)  # Field name made lowercase.

    idempleado = models.ForeignKey('Empleado', models.DO_NOTHING, db_column='idEmpleado', blank=True, null=True)  # Field name made lowercase.

    tipo = models.CharField(max_length=20)

    fechaamonestacion = models.DateField(db_column='fechaAmonestacion')  # Field name made lowercase.

    motivo = models.CharField(max_length=150)

    iddocumento = models.TextField(db_column='idDocumento')  # Field name made lowercase.

    estado = models.TextField()  # This field type is a guess.

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'amonestacion'

class Aspirante(models.Model):

    idaspirante = models.AutoField(db_column='idAspirante', primary_key=True)  # Field name made lowercase.

    nombreaspirante = models.CharField(db_column='nombreAspirante', max_length=100)  # Field name made lowercase.

    apellidoaspirante = models.CharField(db_column='apellidoAspirante', max_length=100)  # Field name made lowercase.

    nit = models.CharField(max_length=9)

    dpi = models.CharField(max_length=13)

    genero = models.CharField(max_length=10)

    email = models.CharField(max_length=150)

    fechanacimiento = models.DateField(db_column='fechaNacimiento')  # Field name made lowercase.

    telefono = models.CharField(max_length=20)

    direccion = models.CharField(max_length=150)

    ididioma = models.ForeignKey('Idioma', models.DO_NOTHING, db_column='idIdioma', blank=True, null=True)  # Field name made lowercase.

    idpueblocultura = models.ForeignKey('Pueblocultura', models.DO_NOTHING, db_column='idPuebloCultura', blank=True, null=True)  # Field name made lowercase.

    estado = models.TextField()  # This field type is a guess.

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'aspirante'

class Ausencia(models.Model):

    idausencia = models.AutoField(db_column='idAusencia', primary_key=True)  # Field name made lowercase.

    idempleado = models.ForeignKey('Empleado', models.DO_NOTHING, db_column='idEmpleado', blank=True, null=True)  # Field name made lowercase.

    tipo = models.CharField(max_length=50)

    motivo = models.CharField(max_length=100)

    fechainicio = models.DateField(db_column='fechaInicio')  # Field name made lowercase.

    fechafin = models.DateField(db_column='fechaFin', blank=True, null=True)  # Field name made lowercase.

    iddocumento = models.IntegerField(db_column='idDocumento')  # Field name made lowercase.

    estado = models.TextField()  # This field type is a guess.

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'ausencia'

class Capacitacion(models.Model):

    idcapacitacion = models.AutoField(db_column='idCapacitacion', primary_key=True)  # Field name made lowercase.

    nombreevento = models.CharField(db_column='nombreEvento', max_length=150)  # Field name made lowercase.

    lugar = models.CharField(max_length=150)

    fechainicio = models.DateField(db_column='fechaInicio')  # Field name made lowercase.

    fechafin = models.DateField(db_column='fechaFin')  # Field name made lowercase.

    institucionfacilitadora = models.CharField(db_column='institucionFacilitadora', max_length=150)  # Field name made lowercase.

    montoejecutado = models.DecimalField(db_column='montoEjecutado', max_digits=10, decimal_places=2)  # Field name made lowercase.

    estado = models.TextField()  # This field type is a guess.

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'capacitacion'

class Contrato(models.Model):

    idcontrato = models.AutoField(db_column='idContrato', primary_key=True)  # Field name made lowercase.

    idhistorialpuesto = models.ForeignKey('Historialpuesto', models.DO_NOTHING, db_column='idHistorialPuesto', blank=True, null=True)  # Field name made lowercase.

    fechainicio = models.DateField(db_column='fechaInicio')  # Field name made lowercase.

    fechafin = models.DateField(db_column='fechaFin')  # Field name made lowercase.

    tipocontrato = models.CharField(db_column='tipoContrato', max_length=50)  # Field name made lowercase.

    estado = models.TextField()  # This field type is a guess.

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'contrato'

class Convocatoria(models.Model):

    idconvocatoria = models.AutoField(db_column='idConvocatoria', primary_key=True)  # Field name made lowercase.

    idpuesto = models.ForeignKey('Puesto', models.DO_NOTHING, db_column='idPuesto', blank=True, null=True)  # Field name made lowercase.

    nombreconvocatoria = models.CharField(db_column='nombreConvocatoria', max_length=150)  # Field name made lowercase.

    descripcion = models.CharField(max_length=150)

    fechainicio = models.DateField(db_column='fechaInicio')  # Field name made lowercase.

    fechafin = models.DateField(db_column='fechaFin')  # Field name made lowercase.

    estado = models.CharField(max_length=50)

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'convocatoria'

class Criterioevaluacion(models.Model):

    idcriterioevaluacion = models.AutoField(db_column='idCriterioEvaluacion', primary_key=True)  # Field name made lowercase.

    nombrecriterio = models.CharField(db_column='nombreCriterio', max_length=100)  # Field name made lowercase.

    descripcioncriterio = models.CharField(db_column='descripcionCriterio', max_length=150)  # Field name made lowercase.

    estado = models.TextField()  # This field type is a guess.

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'criterioevaluacion'

class Documento(models.Model):

    iddocumento = models.AutoField(db_column='idDocumento', primary_key=True)  # Field name made lowercase.

    idtipodocumento = models.ForeignKey('Tipodocumento', models.DO_NOTHING, db_column='idTipoDocumento', blank=True, null=True)  # Field name made lowercase.

    archivo = models.TextField()

    nombrearchivo = models.CharField(db_column='nombreArchivo', max_length=150)  # Field name made lowercase.

    mimearchivo = models.CharField(db_column='mimeArchivo', max_length=10)  # Field name made lowercase.

    fechasubida = models.DateField(db_column='fechaSubida')  # Field name made lowercase.

    estado = models.TextField()  # This field type is a guess.

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    idempleado = models.ForeignKey('Empleado', models.DO_NOTHING, db_column='idEmpleado', blank=True, null=True)  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'documento'

class Empleado(models.Model):

    idempleado = models.AutoField(db_column='idEmpleado', primary_key=True)  # Field name made lowercase.

    idaspirante = models.ForeignKey(Aspirante, models.DO_NOTHING, db_column='idAspirante', blank=True, null=True)  # Field name made lowercase.

    dpi = models.CharField(max_length=13)

    nit = models.CharField(max_length=9)

    nombre = models.CharField(max_length=20)

    apellido = models.CharField(max_length=20)

    genero = models.CharField(max_length=10)

    lugarnacimiento = models.CharField(db_column='lugarNacimiento', max_length=100)  # Field name made lowercase.

    fechanacimiento = models.DateField(db_column='fechaNacimiento')  # Field name made lowercase.

    telefono = models.CharField(max_length=10)

    email = models.CharField(unique=True, max_length=150)

    direccion = models.CharField(max_length=150)

    estadocivil = models.CharField(db_column='estadoCivil', max_length=15)  # Field name made lowercase.

    ididioma = models.ForeignKey('Idioma', models.DO_NOTHING, db_column='idIdioma', blank=True, null=True)  # Field name made lowercase.

    idpueblocultura = models.ForeignKey('Pueblocultura', models.DO_NOTHING, db_column='idPuebloCultura', blank=True, null=True)  # Field name made lowercase.

    numerohijos = models.IntegerField(db_column='numeroHijos')  # Field name made lowercase.

    numeroiggs = models.CharField(db_column='numeroIggs', max_length=50, blank=True, null=True)  # Field name made lowercase.

    idequipo = models.ForeignKey('Equipo', models.DO_NOTHING, db_column='idEquipo', blank=True, null=True)  # Field name made lowercase.

    estado = models.CharField(max_length=50)

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'empleado'

class Empleadocapacitacion(models.Model):

    idempleadocapacitacion = models.AutoField(db_column='idEmpleadoCapacitacion', primary_key=True)  # Field name made lowercase.

    idempleado = models.ForeignKey(Empleado, models.DO_NOTHING, db_column='idEmpleado')  # Field name made lowercase.

    idcapacitacion = models.ForeignKey(Capacitacion, models.DO_NOTHING, db_column='idCapacitacion')  # Field name made lowercase.

    observacion = models.CharField(max_length=150)

    fechaenvio = models.DateField(db_column='fechaEnvio')  # Field name made lowercase.

    estado = models.CharField(max_length=50)

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'empleadocapacitacion'

class Equipo(models.Model):

    idequipo = models.AutoField(db_column='idEquipo', primary_key=True)  # Field name made lowercase.

    idcoordinador = models.IntegerField(db_column='idCoordinador')  # Field name made lowercase.

    nombreequipo = models.CharField(db_column='nombreEquipo', max_length=100)  # Field name made lowercase.

    estado = models.TextField()  # This field type is a guess.

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'equipo'

class Evaluacion(models.Model):

    idevaluacion = models.AutoField(db_column='idEvaluacion', primary_key=True)  # Field name made lowercase.

    idempleado = models.ForeignKey(Empleado, models.DO_NOTHING, db_column='idEmpleado', blank=True, null=True)  # Field name made lowercase.

    tipoevaluacion = models.CharField(db_column='tipoEvaluacion', max_length=100)  # Field name made lowercase.

    fechaevaluacion = models.DateTimeField(db_column='fechaEvaluacion')  # Field name made lowercase.

    puntajetotal = models.DecimalField(db_column='puntajeTotal', max_digits=10, decimal_places=2)  # Field name made lowercase.

    observacion = models.CharField(max_length=150)

    estado = models.TextField()  # This field type is a guess.

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    idpostulacion = models.ForeignKey('Postulacion', models.DO_NOTHING, db_column='idPostulacion', blank=True, null=True)  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'evaluacion'

class Evaluacioncriterio(models.Model):

    idevaluacioncriterio = models.AutoField(db_column='idEvaluacionCriterio', primary_key=True)  # Field name made lowercase.

    idevaluacion = models.ForeignKey(Evaluacion, models.DO_NOTHING, db_column='idEvaluacion')  # Field name made lowercase.

    idcriterioevaluacion = models.ForeignKey(Criterioevaluacion, models.DO_NOTHING, db_column='idCriterioEvaluacion')  # Field name made lowercase.

    puntajecriterio = models.DecimalField(db_column='puntajeCriterio', max_digits=10, decimal_places=2)  # Field name made lowercase.

    estado = models.TextField()  # This field type is a guess.

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'evaluacioncriterio'

class Historialpuesto(models.Model):

    idhistorialpuesto = models.CharField(db_column='idHistorialPuesto', primary_key=True, max_length=20)  # Field name made lowercase.

    idempleado = models.ForeignKey(Empleado, models.DO_NOTHING, db_column='idEmpleado')  # Field name made lowercase.

    idpuesto = models.ForeignKey('Puesto', models.DO_NOTHING, db_column='idPuesto')  # Field name made lowercase.

    fechainicio = models.DateField(db_column='fechaInicio')  # Field name made lowercase.

    fechafin = models.DateField(db_column='fechaFin', blank=True, null=True)  # Field name made lowercase.

    salario = models.DecimalField(max_digits=10, decimal_places=2)

    observacion = models.CharField(max_length=150)

    estado = models.TextField()  # This field type is a guess.

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'historialpuesto'

class Idioma(models.Model):

    ididioma = models.AutoField(db_column='idIdioma', primary_key=True)  # Field name made lowercase.

    nombreidioma = models.CharField(db_column='nombreIdioma', max_length=20)  # Field name made lowercase.

    estado = models.TextField()  # This field type is a guess.

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'idioma'

class Induccion(models.Model):

    idinduccion = models.AutoField(db_column='idInduccion', primary_key=True)  # Field name made lowercase.

    idempleado = models.ForeignKey(Empleado, models.DO_NOTHING, db_column='idEmpleado', blank=True, null=True)  # Field name made lowercase.

    fechainicio = models.DateField(db_column='fechaInicio')  # Field name made lowercase.

    fechafin = models.DateField(db_column='fechaFin')  # Field name made lowercase.

    estado = models.CharField(max_length=20)

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'induccion'

class Inducciondocumento(models.Model):

    idinducciondocumento = models.AutoField(db_column='idInduccionDocumento', primary_key=True)  # Field name made lowercase.

    idinduccion = models.ForeignKey(Induccion, models.DO_NOTHING, db_column='idInduccion')  # Field name made lowercase.

    iddocumento = models.ForeignKey(Documento, models.DO_NOTHING, db_column='idDocumento')  # Field name made lowercase.

    fechaasignado = models.DateField(db_column='fechaAsignado')  # Field name made lowercase.

    fechacompletado = models.DateField(db_column='fechaCompletado', blank=True, null=True)  # Field name made lowercase.

    idinforme = models.IntegerField(db_column='idInforme')  # Field name made lowercase.

    estado = models.CharField(max_length=20)

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'inducciondocumento'

class Postulacion(models.Model):

    idpostulacion = models.AutoField(db_column='idPostulacion', primary_key=True)  # Field name made lowercase.

    idaspirante = models.ForeignKey(Aspirante, models.DO_NOTHING, db_column='idAspirante')  # Field name made lowercase.

    idconvocatoria = models.ForeignKey(Convocatoria, models.DO_NOTHING, db_column='idConvocatoria')  # Field name made lowercase.

    fechapostulacion = models.DateField(db_column='fechaPostulacion')  # Field name made lowercase.

    estado = models.CharField(max_length=50)

    observacion = models.CharField(max_length=150)

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'postulacion'

class Pueblocultura(models.Model):

    idpueblocultura = models.AutoField(db_column='idPuebloCultura', primary_key=True)  # Field name made lowercase.

    nombrepueblo = models.CharField(db_column='nombrePueblo', max_length=20)  # Field name made lowercase.

    estado = models.TextField()  # This field type is a guess.

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'pueblocultura'

class Puesto(models.Model):

    idpuesto = models.AutoField(db_column='idPuesto', primary_key=True)  # Field name made lowercase.

    nombrepuesto = models.CharField(db_column='nombrePuesto', max_length=100)  # Field name made lowercase.

    descripcion = models.CharField(max_length=150)

    salariobase = models.DecimalField(db_column='salarioBase', max_digits=10, decimal_places=2)  # Field name made lowercase.

    estado = models.TextField()  # This field type is a guess.

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'puesto'

class Rol(models.Model):

    idrol = models.AutoField(db_column='idRol', primary_key=True)  # Field name made lowercase.

    nombrerol = models.CharField(db_column='nombreRol', max_length=100)  # Field name made lowercase.

    descripcion = models.CharField(max_length=150)

    estado = models.TextField()  # This field type is a guess.

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'rol'

class Terminacionlaboral(models.Model):

    idterminacionlaboral = models.AutoField(db_column='idTerminacionLaboral', primary_key=True)  # Field name made lowercase.

    idempleado = models.ForeignKey(Empleado, models.DO_NOTHING, db_column='idEmpleado', blank=True, null=True)  # Field name made lowercase.

    tipoterminacion = models.CharField(db_column='tipoTerminacion', max_length=20)  # Field name made lowercase.

    fechaterminacion = models.DateField(db_column='fechaTerminacion')  # Field name made lowercase.

    observacion = models.CharField(max_length=150)

    iddocumento = models.IntegerField(db_column='idDocumento')  # Field name made lowercase.

    estado = models.TextField()  # This field type is a guess.

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'terminacionlaboral'

class Tipodocumento(models.Model):

    idtipodocumento = models.AutoField(db_column='idTipoDocumento', primary_key=True)  # Field name made lowercase.

    nombretipo = models.CharField(db_column='nombreTipo', max_length=150)  # Field name made lowercase.

    descripcion = models.CharField(max_length=150)

    estado = models.TextField()  # This field type is a guess.

    idusuario = models.IntegerField(db_column='idUsuario')  # Field name made lowercase.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'tipodocumento'

class Usuario(models.Model):

    idusuario = models.AutoField(db_column='idUsuario', primary_key=True)  # Field name made lowercase.

    nombreusuario = models.CharField(db_column='nombreUsuario', max_length=100)  # Field name made lowercase.

    contrasena = models.CharField(max_length=150)

    estado = models.TextField()  # This field type is a guess.

    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    idrol = models.ForeignKey(Rol, models.DO_NOTHING, db_column='idRol', blank=True, null=True)  # Field name made lowercase.

    idempleado = models.ForeignKey(Empleado, models.DO_NOTHING, db_column='idEmpleado', blank=True, null=True)  # Field name made lowercase.

    class Meta:

        managed = False

        db_table = 'usuario'