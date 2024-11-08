def buscar_duplicados_en_log(log_filepath):
    """
    Busca tuplas duplicadas en un archivo de log basándose en RUT, tipo de evento y fecha.
    Devuelve una lista de diccionarios con los resultados, indicando si son duplicados o únicos.

    Parámetros:
    - log_filepath (str): Ruta completa al archivo de log de entrada.

    Retorna:
    - Una lista de diccionarios con cada línea del archivo y su estado ("DUPLICADO" o "UNICO").
    """
    tuplas_vistas = set()  # Almacena las tuplas únicas filtradas
    lineas_procesadas = []  # Almacena todas las líneas con el estado (Duplicado o Único)

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

                # Verificar si la clave única ya ha sido vista
                estado = "DUPLICADO" if clave_unica in tuplas_vistas else "UNICO"
                if estado == "UNICO":
                    tuplas_vistas.add(clave_unica)

                # Agregar la línea procesada con el estado
                lineas_procesadas.append({
                    "tipo_evento": tipo_evento,
                    "rut_encriptado": rut_encriptado,
                    "hora": f"{columnas[5]}:{columnas[6]}",
                    "fecha": fecha,
                    "estado": estado
                })

        return lineas_procesadas

    except FileNotFoundError:
        print(f"Archivo '{log_filepath}' no encontrado.")
        return []
