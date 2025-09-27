from rest_framework import viewsets
from drf_spectacular.utils import extend_schema, extend_schema_view

from .models import (
    Empleado, Amonestacion, Aspirante,
    Empleadocapacitacion, Evaluacion, Evaluacioncriterio,
    Ausencia, Contrato, Convocatoria, Documento,
    Equipo, Historialpuesto, Idioma,
    Induccion, Inducciondocumento, Puesto, Rol,
    Terminacionlaboral, Tipodocumento, Usuario, Estado, Pueblocultura, Criterioevaluacion
)

from .serializers import (
    EmpleadoSerializer, AmonestacionSerializer, AspiranteSerializer,
    EmpleadocapacitacionSerializer, EvaluacionSerializer, EvaluacioncriterioSerializer,
    AusenciaSerializer, ContratoSerializer, ConvocatoriaSerializer, DocumentoSerializer,
    EquipoSerializer, HistorialpuestoSerializer, IdiomaSerializer,
    InduccionSerializer, InducciondocumentoSerializer, PuestoSerializer, RolSerializer,
    TerminacionlaboralSerializer, TipodocumentoSerializer, UsuarioSerializer, EstadoSerializer, PuebloSerializer, CriterioevaluacionSerializer
)

@extend_schema_view(
    list=extend_schema(tags=["CriterioEvaluacion"]),
    retrieve=extend_schema(tags=["CriterioEvaluacion"]),
    update=extend_schema(tags=["CriterioEvaluacion"]),
    create=extend_schema(tags=["CriterioEvaluacion"]),
)
class CriterioevaluacionViewSet(viewsets.ModelViewSet):
    queryset = Criterioevaluacion.objects.all()
    serializer_class = CriterioevaluacionSerializer
    http_method_names = ['get', 'put', 'post']

@extend_schema_view(
    list=extend_schema(tags=["Pueblo y cultura"]),
    retrieve=extend_schema(tags=["Pueblo y cultura"]),
    update=extend_schema(tags=["Pueblo y cultura"]),
    create=extend_schema(tags=["Pueblo y cultura"]),
)
class PuebloViewSet(viewsets.ModelViewSet):
    queryset = Pueblocultura.objects.all()
    serializer_class = PuebloSerializer
    http_method_names = ['get', 'put', 'post']



# ----------------- Recursos Humanos -----------------
@extend_schema_view(
    list=extend_schema(tags=["Empleado"]),
    retrieve=extend_schema(tags=["Empleado"]),
    update=extend_schema(tags=["Empleado"]),
    create=extend_schema(tags=["Empleado"]),
)
class EmpleadoViewSet(viewsets.ModelViewSet):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer
    http_method_names = ['get', 'put', 'post']


@extend_schema_view(
    list=extend_schema(tags=["Amonestacion"]),
    retrieve=extend_schema(tags=["Amonestacion"]),
    update=extend_schema(tags=["Amonestacion"]),
    create=extend_schema(tags=["Amonestacion"]),
)
class AmonestacionViewSet(viewsets.ModelViewSet):
    queryset = Amonestacion.objects.all()
    serializer_class = AmonestacionSerializer
    http_method_names = ['get', 'put', 'post']


@extend_schema_view(
    list=extend_schema(tags=["Aspirante"]),
    retrieve=extend_schema(tags=["Aspirante"]),
    update=extend_schema(tags=["Aspirante"]),
    create=extend_schema(tags=["Aspirante"]),
)
class AspiranteViewSet(viewsets.ModelViewSet):
    queryset = Aspirante.objects.all()
    serializer_class = AspiranteSerializer
    http_method_names = ['get', 'put', 'post']


@extend_schema_view(
    list=extend_schema(tags=["Contrato"]),
    retrieve=extend_schema(tags=["Contrato"]),
    update=extend_schema(tags=["Contrato"]),
    create=extend_schema(tags=["Contrato"]),
)
class ContratoViewSet(viewsets.ModelViewSet):
    queryset = Contrato.objects.all()
    serializer_class = ContratoSerializer
    http_method_names = ['get', 'put', 'post']


@extend_schema_view(
    list=extend_schema(tags=["Terminacionlaboral"]),
    retrieve=extend_schema(tags=["Terminacionlaboral"]),
    update=extend_schema(tags=["Terminacionlaboral"]),
    create=extend_schema(tags=["Terminacionlaboral"]),
)
class TerminacionlaboralViewSet(viewsets.ModelViewSet):
    queryset = Terminacionlaboral.objects.all()
    serializer_class = TerminacionlaboralSerializer
    http_method_names = ['get', 'put', 'post']


# ----------------- Capacitación y Evaluación -----------------
@extend_schema_view(
    list=extend_schema(tags=["Empleadocapacitacion"]),
    retrieve=extend_schema(tags=["Empleadocapacitacion"]),
    update=extend_schema(tags=["Empleadocapacitacion"]),
    create=extend_schema(tags=["Empleadocapacitacion"]),
)
class EmpleadocapacitacionViewSet(viewsets.ModelViewSet):
    queryset = Empleadocapacitacion.objects.all()
    serializer_class = EmpleadocapacitacionSerializer
    http_method_names = ['get', 'put', 'post']


@extend_schema_view(
    list=extend_schema(tags=["Evaluacion"]),
    retrieve=extend_schema(tags=["Evaluacion"]),
    update=extend_schema(tags=["Evaluacion"]),
    create=extend_schema(tags=["Evaluacion"]),
)
class EvaluacionViewSet(viewsets.ModelViewSet):
    queryset = Evaluacion.objects.all()
    serializer_class = EvaluacionSerializer
    http_method_names = ['get', 'put', 'post']


@extend_schema_view(
    list=extend_schema(tags=["Evaluacioncriterio"]),
    retrieve=extend_schema(tags=["Evaluacioncriterio"]),
    update=extend_schema(tags=["Evaluacioncriterio"]),
    create=extend_schema(tags=["Evaluacioncriterio"]),
)
class EvaluacioncriterioViewSet(viewsets.ModelViewSet):
    queryset = Evaluacioncriterio.objects.all()
    serializer_class = EvaluacioncriterioSerializer
    http_method_names = ['get', 'put', 'post']


@extend_schema_view(
    list=extend_schema(tags=["Induccion"]),
    retrieve=extend_schema(tags=["Induccion"]),
    update=extend_schema(tags=["Induccion"]),
    create=extend_schema(tags=["Induccion"]),
)
class InduccionViewSet(viewsets.ModelViewSet):
    queryset = Induccion.objects.all()
    serializer_class = InduccionSerializer
    http_method_names = ['get', 'put', 'post']


@extend_schema_view(
    list=extend_schema(tags=["Inducciondocumento"]),
    retrieve=extend_schema(tags=["Inducciondocumento"]),
    update=extend_schema(tags=["Inducciondocumento"]),
    create=extend_schema(tags=["Inducciondocumento"]),
)
class InducciondocumentoViewSet(viewsets.ModelViewSet):
    queryset = Inducciondocumento.objects.all()
    serializer_class = InducciondocumentoSerializer
    http_method_names = ['get', 'put', 'post']


# ----------------- Administración -----------------
@extend_schema_view(
    list=extend_schema(tags=["Puesto"]),
    retrieve=extend_schema(tags=["Puesto"]),
    update=extend_schema(tags=["Puesto"]),
    create=extend_schema(tags=["Puesto"]),
)
class PuestoViewSet(viewsets.ModelViewSet):
    queryset = Puesto.objects.all()
    serializer_class = PuestoSerializer
    http_method_names = ['get', 'put', 'post']


@extend_schema_view(
    list=extend_schema(tags=["Rol"]),
    retrieve=extend_schema(tags=["Rol"]),
    update=extend_schema(tags=["Rol"]),
    create=extend_schema(tags=["Rol"]),
)
class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    http_method_names = ['get', 'put', 'post']


@extend_schema_view(
    list=extend_schema(tags=["Usuario"]),
    retrieve=extend_schema(tags=["Usuario"]),
    update=extend_schema(tags=["Usuario"]),
    create=extend_schema(tags=["Usuario"]),
)
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    http_method_names = ['get', 'put', 'post']


@extend_schema_view(
    list=extend_schema(tags=["Estado"]),
    retrieve=extend_schema(tags=["Estado"]),
    update=extend_schema(tags=["Estado"]),
    create=extend_schema(tags=["Estado"]),
)
class EstadoViewSet(viewsets.ModelViewSet):
    queryset = Estado.objects.all()
    serializer_class = EstadoSerializer
    http_method_names = ['get', 'put', 'post']


# ----------------- Documentos -----------------
@extend_schema_view(
    list=extend_schema(tags=["Documento"]),
    retrieve=extend_schema(tags=["Documento"]),
    update=extend_schema(tags=["Documento"]),
    create=extend_schema(tags=["Documento"]),
)
class DocumentoViewSet(viewsets.ModelViewSet):
    queryset = Documento.objects.all()
    serializer_class = DocumentoSerializer
    http_method_names = ['get', 'put', 'post']


@extend_schema_view(
    list=extend_schema(tags=["Tipodocumento"]),
    retrieve=extend_schema(tags=["Tipodocumento"]),
    update=extend_schema(tags=["Tipodocumento"]),
    create=extend_schema(tags=["Tipodocumento"]),
)
class TipodocumentoViewSet(viewsets.ModelViewSet):
    queryset = Tipodocumento.objects.all()
    serializer_class = TipodocumentoSerializer
    http_method_names = ['get', 'put', 'post']


# ----------------- Otros -----------------
@extend_schema_view(
    list=extend_schema(tags=["Ausencia"]),
    retrieve=extend_schema(tags=["Ausencia"]),
    update=extend_schema(tags=["Ausencia"]),
    create=extend_schema(tags=["Ausencia"]),
)
class AusenciaViewSet(viewsets.ModelViewSet):
    queryset = Ausencia.objects.all()
    serializer_class = AusenciaSerializer
    http_method_names = ['get', 'put', 'post']


@extend_schema_view(
    list=extend_schema(tags=["Convocatoria"]),
    retrieve=extend_schema(tags=["Convocatoria"]),
    update=extend_schema(tags=["Convocatoria"]),
    create=extend_schema(tags=["Convocatoria"]),
)
class ConvocatoriaViewSet(viewsets.ModelViewSet):
    queryset = Convocatoria.objects.all()
    serializer_class = ConvocatoriaSerializer
    http_method_names = ['get', 'put', 'post']


@extend_schema_view(
    list=extend_schema(tags=["Equipo"]),
    retrieve=extend_schema(tags=["Equipo"]),
    update=extend_schema(tags=["Equipo"]),
    create=extend_schema(tags=["Equipo"]),
)
class EquipoViewSet(viewsets.ModelViewSet):
    queryset = Equipo.objects.all()
    serializer_class = EquipoSerializer
    http_method_names = ['get', 'put', 'post']


@extend_schema_view(
    list=extend_schema(tags=["Historialpuesto"]),
    retrieve=extend_schema(tags=["Historialpuesto"]),
    update=extend_schema(tags=["Historialpuesto"]),
    create=extend_schema(tags=["Historialpuesto"]),
)
class HistorialpuestoViewSet(viewsets.ModelViewSet):
    queryset = Historialpuesto.objects.all()
    serializer_class = HistorialpuestoSerializer
    http_method_names = ['get', 'put', 'post']


@extend_schema_view(
    list=extend_schema(tags=["Idioma"]),
    retrieve=extend_schema(tags=["Idioma"]),
    update=extend_schema(tags=["Idioma"]),
    create=extend_schema(tags=["Idioma"]),
)
class IdiomaViewSet(viewsets.ModelViewSet):
    queryset = Idioma.objects.all()
    serializer_class = IdiomaSerializer
    http_method_names = ['get', 'put', 'post']
    

