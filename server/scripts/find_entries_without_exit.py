def buscar_entradas_sin_salidas(data):
    eventos_por_rut = {}  # Diccionario para agrupar eventos por RUT y fecha
    lineas_procesadas = []  # Almacena todas las líneas con el estado

    for item in data:
        tipo_evento = item.get('tipo_evento', 'Desconocido')
        rut_encriptado = item.get('rut_encriptado', '')
        fecha = item.get('fecha', '')

        clave_unica = (rut_encriptado, fecha)
        if clave_unica not in eventos_por_rut:
            eventos_por_rut[clave_unica] = {'Entrada': 0, 'Salida': 0}

        if tipo_evento in ['Entrada', 'Salida']:
            eventos_por_rut[clave_unica][tipo_evento] += 1

        lineas_procesadas.append(item)

    # Actualizar el estado de las líneas sin salida correspondiente
    for item in lineas_procesadas:
        tipo_evento = item.get('tipo_evento', 'Desconocido')
        rut_encriptado = item.get('rut_encriptado', '')
        fecha = item.get('fecha', '')

        clave_unica = (rut_encriptado, fecha)
        if tipo_evento == 'Entrada' and eventos_por_rut[clave_unica]['Salida'] == 0:
            item['estado'] = 'SIN_SALIDA'
        elif tipo_evento == 'Entrada':
            item['estado'] = 'CON_SALIDA'

    return lineas_procesadas