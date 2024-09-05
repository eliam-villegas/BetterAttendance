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
