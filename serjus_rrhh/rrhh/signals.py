from django.db.models.signals import post_migrate
from django.dispatch import receiver
from datetime import datetime, date
from django.contrib.auth.hashers import make_password
from .models import Usuario, Rol, Empleado

@receiver(post_migrate)
def create_default_admin(sender, **kwargs):
    """
    Crea un usuario admin por defecto después de las migraciones.
    """
    if sender.name == "rrhh":  
        #Crear rol Administrador si no existe
        rol_admin, created_rol = Rol.objects.get_or_create(
            nombrerol="Administrador",
            defaults={
                'descripcion': 'Rol con todos los permisos',
                'estado': True,
                'idusuario': 1,  # Se puede asignar 1 como creador por defecto
            }
        )

        #Crear empleado default si no existe
        empleado_default, created_emp = Empleado.objects.get_or_create(
            dpi="0000000000000",
            defaults={
                'nit': "0000000",
                'nombre': "Empleado",
                'apellido': "Default",
                'genero': "Otro",
                'lugarnacimiento': "Ciudad Default",
                'fechanacimiento': date(1990, 1, 1),
                'telefono': "0000000000",
                'email': "admin@example.com",
                'direccion': "Dirección Default",
                'estadocivil': "Soltero",
                'numerohijos': 0,
                'idusuario': 1,
                'estado': True
            }
        )

        #Crear usuario admin si no existe
        if not Usuario.objects.filter(nombreusuario="admin").exists():
            Usuario.objects.create(
                nombreusuario="admin",
                contrasena=make_password("admin123"),
                estado=True,
                createdat=datetime.now(),
                updatedat=datetime.now(),
                idrol=rol_admin,
                idempleado=empleado_default
            )
            print("Usuario admin creado correctamente.")