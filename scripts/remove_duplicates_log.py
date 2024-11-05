def eliminar_duplicados_log(log_filepath):
    """
    Elimina tuplas duplicadas en un archivo de log, ignorando columnas específicas en la comparación,
    y sobrescribe el archivo original con el contenido sin duplicados.

    Parámetros:
    - log_filepath (str): Ruta completa al archivo de log.
    """
    tuplas_vistas = set()  # Almacena las tuplas únicas filtradas
    lineas_unicas = []     # Almacena las líneas completas sin duplicados

    try:
        # Leer el archivo y filtrar duplicados
        with open(log_filepath, 'r') as log_file:
            for linea in log_file:
                columnas = linea.strip().split(",")  # Divide la línea en columnas
                
                # Ignora las columnas 6, 7, 8 y 10 (índices 5, 6, 7 y 9)
                tupla_filtrada = tuple(
                    columnas[i] for i in range(len(columnas)) if i not in {5, 6, 7, 9}
                )
                
                # Solo añadir a la lista de líneas únicas si la tupla no ha sido vista antes
                if tupla_filtrada not in tuplas_vistas:
                    tuplas_vistas.add(tupla_filtrada)
                    lineas_unicas.append(linea)  # Guarda la línea completa

        # Sobrescribir el archivo original con las líneas sin duplicados
        with open(log_filepath, 'w') as log_file:
            log_file.writelines(lineas_unicas)
        
        print(f"Duplicados eliminados y cambios guardados: '{log_filepath}'")

    except FileNotFoundError:
        print(f"Archivo '{log_filepath}' no encontrado.")
