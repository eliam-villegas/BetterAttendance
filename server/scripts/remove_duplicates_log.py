def eliminar_duplicados_log(log_filepath):
    """
    Elimina tuplas duplicadas en un archivo de log basándose en RUT, tipo de evento y fecha.
    Devuelve una lista de diccionarios con las líneas únicas.

    Parámetros:
    - log_filepath (str): Ruta completa al archivo de log de entrada.

    Retorna:
    - Una lista de diccionarios con cada línea única.
    """
    tuplas_vistas = set()  # Almacena las tuplas únicas filtradas
    lineas_unicas = []     # Almacena las líneas únicas sin duplicados

    try:
        with open(log_filepath, 'r') as log_file:
            for linea in log_file:
                columnas = linea.strip().split(",")
                if len(columnas) < 10:
                    continue  # Saltar líneas incompletas

                # Extraer y convertir el tipo de evento
                tipo_evento = "Entrada" if columnas[2] == "01" else "Salida" if columnas[2] == "03" else "Desconocido"
                rut_encriptado = columnas[3]
                fecha = f"{columnas[8]}/{columnas[7]}/{columnas[9]}"
                clave_unica = (rut_encriptado, tipo_evento, fecha)

                # Si la clave única no ha sido vista, agregarla
                if clave_unica not in tuplas_vistas:
                    tuplas_vistas.add(clave_unica)
                    lineas_unicas.append({
                        "tipo_evento": tipo_evento,
                        "rut_encriptado": rut_encriptado,
                        "hora": f"{columnas[5]}:{columnas[6]}",
                        "fecha": fecha
                    })

        return lineas_unicas

    except FileNotFoundError:
        print(f"Archivo '{log_filepath}' no encontrado.")
        return []
