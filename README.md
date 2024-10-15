# BetterAttendance
Repositorio para proyecto de Ingeniería de Software 2
----------------------------
# Descripción del Problema
La organización enfrenta dificultades en la gestión del control de asistencia y ausentismo del personal, afectando principalmente áreas críticas como asistencia, contratos y horas trabajadas. 
El sistema de gestión actual es anticuado y limitado, lo que imposibilita optimizar procesos como el registro automático de datos o la integración de nuevas funcionalidades. Existen múltiples dispositivos de registro (biométricos y relojes), pero su uso redundante y la falta de unificación generan inconsistencias en la marcación de turnos, creando una confusión generalizada sobre quién cumplió o no con sus horas de trabajo.

## Certezas
  - Sistema actual: Tienen un ERP llamado SIRH que gestiona los horarios y la asistencia, con un sistema biométrico (huellero).
  - Multiplicidad de dispositivos: Utilizan múltiples relojes (8) y un huellero adicional para lugares sin red MINSAL.
  - Reglas de uso de los relojes: Cada reloj tiene una restricción de 3 minutos para evitar duplicados.
  - Horarios: Pueden crear perfiles de horarios, aunque resulta complejo buscar perfiles existentes.
  - Formatos de archivo: El ERP solo permite trabajar con archivos en formato .txt provenientes de los relojes.
  - Tipos de contrato: Existen distintos tipos de contratos (11, 22, 33, 44 horas).
### Necesidades del cliente:
  - Indicadores de asistencia que muestren días trabajados, ausencias, y horas extraordinarias.
  - Identificación de atrasos.
### Problemas identificados:
- No tienen visibilidad clara de quién ha cumplido con qué turno.
- El software no permite mejoras ni actualizaciones, lo que limita la funcionalidad.
- Existe un problema con los registros de entrada y salida debido a duplicaciones en los dispositivos de marcación.
## Interrogantes
- Tipos de contrato: ¿Son contratos fijos o flexibles?
- Horarios: ¿Cómo gestiona el ERP los horarios de trabajo y cómo se interrelacionan con los turnos?
- Pagos: ¿Cómo funciona la modalidad de pagos (¿cada tres meses?)?
- Fuentes de marcaje: ¿Cuáles son los lugares específicos y tipos de dispositivos utilizados para el marcaje?
- Huellero: ¿Por qué el huellero se menciona como algo separado de los relojes? ¿Cómo interactúa con el sistema?
- Marcación de colaciones/almuerzos: ¿Se registran los tiempos de descanso y comida en el sistema?
- Cambio de infraestructura: ¿Es posible cambiar la infraestructura actual para integrar una mejor solución?
- Identificación de externos: ¿Existe alguna forma de identificar automáticamente a los trabajadores externos?
- Archivos de asistencia: ¿Cómo se gestiona y almacena la información de asistencia?
- Plantillas del ERP: ¿Pueden compartir plantillas del ERP y de los horarios trabajados?
## Necesidades
- Datos específicos:
    - Archivo de asistencia.
    - Plantillas del ERP y los horarios.
    - PDF de referencia sobre las normativas.
- Clarificación:
    - Confirmar los tipos de contrato.
    - Detalles sobre cómo el ERP gestiona los horarios y pagos.
    - Información sobre el uso de los huelleros.
    - Procedimientos para el marcaje de descansos o colaciones.
## Aproximación Inicial a la Respuesta al Dolor del Usuario
El principal problema radica en la falta de integración y actualización del sistema actual, lo que dificulta la gestión eficiente de la asistencia, los turnos y el ausentismo del personal. 
La solución podría consistir en implementar un sistema más moderno y adaptable que permita la sincronización automática de datos entre los distintos dispositivos de marcación (relojes y huelleros). 
Este sistema debe unificar la información en tiempo real, permitiendo la correcta identificación de turnos, horas trabajadas, y ausencias. Además, debe generar reportes claros sobre horas extras y atrasos, todo ello dentro del marco de las leyes vigentes que regulan los contratos y jornadas laborales.


## compose.yml
Steps:

    Login Service (auth):
        This service runs an authentication server (for example, written in Node.js, Python, or any other backend framework).
        It listens on port 5000 (or any port you define).
        The web app can call this service for user login, sending the credentials, and on success, the user can be redirected back to the main app, or the service can return an authentication token (e.g., JWT) that the main app will use.

    Main Web App (web):
        The web app listens on port 8080.
        It sends login requests to the auth service, using the environment variable AUTH_SERVICE_URL (which points to the internal auth service within Docker Compose).
        Once login is successful, the user can be redirected to the main app (or tokens can be passed between services for authentication).

How Communication Works:

    Docker Compose creates an internal network called webapp-network, and each service can access others via their service names (web and auth in this case).
    When the web app needs to authenticate a user, it makes a request to http://auth:5000/login or a similar API endpoint to perform login operations.
    Once authentication is successful, the auth service can either:
        Redirect the user back to the main app using an HTTP redirect.
        Return a JWT or session cookie to the web app, which will handle user sessions. 
