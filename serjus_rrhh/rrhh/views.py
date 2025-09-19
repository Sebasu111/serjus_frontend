from rest_framework import viewsets
from .models import Empleado, Amonestacion, Aspirante
from .serializers import EmpleadoSerializer, AmonestacionSerializer, AspiranteSerializer
from .models import Empleadocapacitacion, Evaluacion, Evaluacioncriterio
from .serializers import EmpleadocapacitacionSerializer, EvaluacionSerializer, EvaluacioncriterioSerializer
from .models import (
    Ausencia, Contrato, Convocatoria, Documento,
    Equipo, Historialpuesto, Idioma,
    Induccion, Inducciondocumento
)
from .serializers import (
    AusenciaSerializer, ContratoSerializer, ConvocatoriaSerializer, DocumentoSerializer,
    EquipoSerializer, HistorialpuestoSerializer, IdiomaSerializer,
    InduccionSerializer, InducciondocumentoSerializer
)

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
    
class AusenciaViewSet(viewsets.ModelViewSet):
    queryset = Ausencia.objects.all()
    serializer_class = AusenciaSerializer

class ContratoViewSet(viewsets.ModelViewSet):
    queryset = Contrato.objects.all()
    serializer_class = ContratoSerializer

class ConvocatoriaViewSet(viewsets.ModelViewSet):
    queryset = Convocatoria.objects.all()
    serializer_class = ConvocatoriaSerializer

class DocumentoViewSet(viewsets.ModelViewSet):
    queryset = Documento.objects.all()
    serializer_class = DocumentoSerializer

class EquipoViewSet(viewsets.ModelViewSet):
    queryset = Equipo.objects.all()
    serializer_class = EquipoSerializer

class HistorialpuestoViewSet(viewsets.ModelViewSet):
    queryset = Historialpuesto.objects.all()
    serializer_class = HistorialpuestoSerializer

class IdiomaViewSet(viewsets.ModelViewSet):
    queryset = Idioma.objects.all()
    serializer_class = IdiomaSerializer

class InduccionViewSet(viewsets.ModelViewSet):
    queryset = Induccion.objects.all()
    serializer_class = InduccionSerializer

class InducciondocumentoViewSet(viewsets.ModelViewSet):
    queryset = Inducciondocumento.objects.all()
    serializer_class = InducciondocumentoSerializer
