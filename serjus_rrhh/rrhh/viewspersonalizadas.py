# views.py
from django.contrib.auth.hashers import check_password
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Usuario
from .serializers import UsuarioSerializer

@api_view(['POST'])
def login_usuario(request):
    username = request.data.get('nombreusuario')
    password = request.data.get('contrasena')

    try:
        usuario = Usuario.objects.get(nombreusuario=username)
    except Usuario.DoesNotExist:
        return Response({"success": False, "message": "Usuario no existe"})

    if not usuario.estado:
        return Response({"success": False, "message": "Usuario inactivo"})

    if not check_password(password, usuario.contrasena):
        return Response({"success": False, "message": "Contraseña incorrecta"})

    serializer = UsuarioSerializer(usuario)
    return Response({"success": True, "usuario": serializer.data})
