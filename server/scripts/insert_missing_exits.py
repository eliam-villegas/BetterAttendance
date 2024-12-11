from scripts.find_entries_without_exit import buscar_entradas_sin_salidas

def insertar_salidas_faltantes(data):
    # Filtrar entradas sin salida
    datos_procesados = buscar_entradas_sin_salidas(data)
    sin_salida = [item for item in datos_procesados if item.get('estado') == 'SIN_SALIDA']

    print("Entradas sin salida:", sin_salida)

    if not sin_salida:
        return data, []  # No hay salidas nuevas para insertar

    nuevas_salidas = []
    for entrada in sin_salida:
        fecha_entrada = entrada['fecha']
        rut = entrada['rut_encriptado']
        hora_entrada = entrada['hora']

        print(f"Procesando entrada: {entrada}")

        salida_sugerida = None

        # Filtrar eventos del mismo RUT
        eventos_del_rut = [evento for evento in data if evento['rut_encriptado'] == rut]

        # Buscar salida del día siguiente
        for evento in eventos_del_rut:
            if evento['tipo_evento'] == 'Salida' and evento['fecha'] > fecha_entrada:
                salida_sugerida = evento
                break

        # Si no se encuentra salida del día siguiente, buscar del día anterior
        if not salida_sugerida:
            for evento in eventos_del_rut:
                if evento['tipo_evento'] == 'Salida' and evento['fecha'] < fecha_entrada:
                    salida_sugerida = evento

        # Si no se encuentra ninguna salida, generar una salida predeterminada
        if not salida_sugerida:
            print(f"No se encontró salida para la entrada {entrada}, generando salida predeterminada.")
            nueva_salida = {
                'tipo_evento': 'Salida',
                'rut_encriptado': rut,
                'hora': '18:00',  # Hora predeterminada
                'fecha': fecha_entrada,  # Mantener la misma fecha que la entrada
            }
        else:
            print(f"Salida sugerida para la entrada {entrada}: {salida_sugerida}")
            nueva_salida = {
                'tipo_evento': 'Salida',
                'rut_encriptado': rut,
                'hora': salida_sugerida['hora'],
                'fecha': fecha_entrada,  # Mantener la misma fecha que la entrada
            }

        nuevas_salidas.append(nueva_salida)

    print("Nuevas salidas generadas:", nuevas_salidas)

    # Agregar las nuevas salidas al conjunto de datos
    data.extend(nuevas_salidas)

    # Marcar las entradas que ahora tienen salidas como "CON_SALIDA"
    for entrada in sin_salida:
        entrada['estado'] = 'CON_SALIDA'

    return data, nuevas_salidas