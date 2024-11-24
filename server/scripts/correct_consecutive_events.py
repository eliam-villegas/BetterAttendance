def corregir_eventos_consecutivos(data):
    """
    Corrige eventos consecutivos para un mismo RUT el mismo día.
    Si hay entradas consecutivas, convierte la última en salida.
    Si hay salidas consecutivas, convierte la última en entrada.
    Además, asegura que las entradas aparezcan antes que las salidas y estén ordenadas por hora.
    """
    eventos_por_rut = {}  # Agrupa eventos por RUT y fecha
    lineas_procesadas = []

    # Agrupar eventos por RUT y fecha
    for item in data:
        tipo_evento = item.get('tipo_evento', 'Desconocido')
        rut_encriptado = item.get('rut_encriptado', '')
        fecha = item.get('fecha', '')

        clave_unica = (rut_encriptado, fecha)
        if clave_unica not in eventos_por_rut:
            eventos_por_rut[clave_unica] = []

        eventos_por_rut[clave_unica].append(item)

    # Corregir eventos consecutivos y asegurar el orden
    for clave, eventos in eventos_por_rut.items():
        # Ordenar por hora y por tipo de evento (Entradas antes que Salidas)
        eventos.sort(key=lambda x: (
            x.get('hora', ''),  # Ordenar por hora primero
            0 if x.get('tipo_evento') == 'Entrada' else 1  # Entradas primero
        ))

        for i in range(1, len(eventos)):
            evento_anterior = eventos[i - 1]
            evento_actual = eventos[i]

            # Si hay dos entradas consecutivas, corregir la última a salida
            if evento_anterior['tipo_evento'] == 'Entrada' and evento_actual['tipo_evento'] == 'Entrada':
                evento_actual['tipo_evento'] = 'Salida'

            # Si hay dos salidas consecutivas, corregir la última a entrada
            if evento_anterior['tipo_evento'] == 'Salida' and evento_actual['tipo_evento'] == 'Salida':
                evento_actual['tipo_evento'] = 'Entrada'

        lineas_procesadas.extend(eventos)

    # Ordenar globalmente para asegurar el orden final
    lineas_procesadas.sort(key=lambda x: (
        x.get('fecha', ''),  # Ordenar por fecha
        x.get('hora', ''),  # Luego por hora
        0 if x.get('tipo_evento') == 'Entrada' else 1  # Entradas antes que salidas
    ))

    return lineas_procesadas
