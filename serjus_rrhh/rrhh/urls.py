from rest_framework import routers
from .views import EmpleadoViewSet, AmonestacionViewSet, AspiranteViewSet
from .views import EmpleadocapacitacionViewSet, EvaluacionViewSet, EvaluacioncriterioViewSet

router = routers.DefaultRouter()
router.register(r'empleados', EmpleadoViewSet)
router.register(r'amonestaciones', AmonestacionViewSet)
router.register(r'aspirantes', AspiranteViewSet)
router.register(r'empleadocapacitacion', EmpleadocapacitacionViewSet)
router.register(r'evaluacion', EvaluacionViewSet)
router.register(r'evaluacioncriterio', EvaluacioncriterioViewSet)

urlpatterns = router.urls
