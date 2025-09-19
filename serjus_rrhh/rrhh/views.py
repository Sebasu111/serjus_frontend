from rest_framework import viewsets
from .models import Empleado, Amonestacion, Aspirante
from .serializers import EmpleadoSerializer, AmonestacionSerializer, AspiranteSerializer
from .models import Empleadocapacitacion, Evaluacion, Evaluacioncriterio
from .serializers import EmpleadocapacitacionSerializer, EvaluacionSerializer, EvaluacioncriterioSerializer

class EmpleadoViewSet(viewsets.ModelViewSet):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer

class AmonestacionViewSet(viewsets.ModelViewSet):
    queryset = Amonestacion.objects.all()
    serializer_class = AmonestacionSerializer

class AspiranteViewSet(viewsets.ModelViewSet):
    queryset = Aspirante.objects.all()
    serializer_class = AspiranteSerializer

class EmpleadocapacitacionViewSet(viewsets.ModelViewSet):
    queryset = Empleadocapacitacion.objects.all()
    serializer_class = EmpleadocapacitacionSerializer

class EvaluacionViewSet(viewsets.ModelViewSet):
    queryset = Evaluacion.objects.all()
    serializer_class = EvaluacionSerializer

class EvaluacioncriterioViewSet(viewsets.ModelViewSet):
    queryset = Evaluacioncriterio.objects.all()
    serializer_class = EvaluacioncriterioSerializer
