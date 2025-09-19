from rest_framework import serializers
from .models import Empleado, Amonestacion, Aspirante
from .models import Capacitacion, Empleadocapacitacion, Evaluacion, Evaluacioncriterio, Criterioevaluacion, Postulacion

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

class EmpleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
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