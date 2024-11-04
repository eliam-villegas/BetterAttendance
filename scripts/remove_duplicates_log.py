def eliminar_duplicados_en_log(log_filepath, output_filepath):
    """
    Elimina tuplas duplicadas de un archivo de log, ignorando columnas específicas en la comparación,
    y guarda el resultado en un nuevo archivo.

    Parámetros:
    - log_filepath (str): Ruta completa al archivo de log original.
    - output_filepath (str): Ruta completa para guardar el archivo de log sin duplicados.
    """
    tuplas_vistas = set()  # Almacena las tuplas únicas filtradas

    try:
        with open(log_filepath, 'r') as log_file, open(output_filepath, 'w') as output_file:
            for linea in log_file:
                columnas = linea.strip().split(",")  # Divide la línea en columnas
                
                # Ignora las columnas 6, 7, 8 y 10 (índices 5, 6, 7 y 9)
                tupla_filtrada = tuple(
                    columnas[i] for i in range(len(columnas)) if i not in {5, 6, 7, 9}
                )
                
                # Escribir en el archivo de salida solo si la tupla no ha sido vista
                if tupla_filtrada not in tuplas_vistas:
                    tuplas_vistas.add(tupla_filtrada)
                    output_file.write(linea)  # Escribe la línea completa sin cambios

        print(f"Log sin duplicados guardado en '{output_filepath}'")

    except FileNotFoundError:
        print(f"Archivo '{log_filepath}' no encontrado.")
