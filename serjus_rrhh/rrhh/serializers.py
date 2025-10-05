from rest_framework import serializers
from .models import Empleado, Amonestacion, Aspirante
from django.contrib.auth.hashers import make_password
from .models import Capacitacion, Empleadocapacitacion, Evaluacion, Evaluacioncriterio, Criterioevaluacion, Postulacion
from .models import (
    Ausencia, Contrato, Convocatoria, Documento, 
    Equipo, Historialpuesto, Idioma, 
    Induccion, Inducciondocumento, Puesto, Rol, Terminacionlaboral, Tipodocumento, Usuario, Estado, Pueblocultura
)

class PuebloSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pueblocultura
        fields = '__all__'

class EmpleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = '__all__'

class AmonestacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Amonestacion
        fields = '__all__'

class AspiranteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aspirante
        fields = '__all__' 

class CapacitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Capacitacion
        fields = '__all__'

class EmpleadocapacitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleadocapacitacion
        fields = '__all__'

class PostulacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Postulacion
        fields = '__all__'

class EvaluacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluacion
        fields = '__all__'

class CriterioevaluacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Criterioevaluacion
        fields = '__all__'

class EvaluacioncriterioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluacioncriterio
        fields = '__all__'
        
class AusenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ausencia
        fields = '__all__'

class ContratoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contrato
        fields = '__all__'

class ConvocatoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Convocatoria
        fields = '__all__'

class DocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documento
        fields = '__all__'

class EquipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipo
        fields = '__all__'

class HistorialpuestoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Historialpuesto
        fields = '__all__'

class IdiomaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Idioma
        fields = '__all__'

class InduccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Induccion
        fields = '__all__'

class InducciondocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inducciondocumento
        fields = '__all__'

class PuestoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Puesto
        fields = '__all__'  

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = '__all__'

class TerminacionlaboralSerializer(serializers.ModelSerializer):
    class Meta:
        model = Terminacionlaboral
        fields = '__all__'  

class TipodocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tipodocumento
        fields = '__all__'  

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'
        extra_kwargs = {
            'contrasena': {'required': False}, 
        }

    def create(self, validated_data):
        if 'contrasena' in validated_data:
            validated_data['contrasena'] = make_password(validated_data['contrasena'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        contrasena = validated_data.pop('contrasena', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if contrasena:
            instance.contrasena = make_password(contrasena)

        instance.save()
        return instance

class EstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estado
        fields = '__all__'  