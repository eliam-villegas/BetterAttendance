def buscar_duplicados_en_log(log_filepath):
    """
    Busca tuplas duplicadas en un archivo de log, ignorando columnas específicas en la comparación,
    pero mostrando la tupla completa en los resultados.

    Parámetros:
    - log_filepath (str): Ruta completa al archivo de log.

    Retorna:
    - Una lista de tuplas completas duplicadas encontradas en el archivo.
    """
    tuplas_vistas = set()  # Almacena las tuplas únicas filtradas
    tuplas_vistas_completas = {}  # Mapea la tupla filtrada a la tupla completa
    duplicados_completos = set()  # Almacena las tuplas completas duplicadas

    try:
        with open(log_filepath, 'r') as log_file:
            for linea in log_file:
                columnas = linea.strip().split(",")  # Divide la línea en columnas
                
                # Ignora las columnas 6, 7, 8 y 10 (índices 5, 6, 7 y 9)
                tupla_filtrada = tuple(
                    columnas[i] for i in range(len(columnas)) if i not in {5, 6, 7, 9}
                )
                
                # Si la tupla filtrada ya existe en tuplas_vistas, es un duplicado
                if tupla_filtrada in tuplas_vistas:
                    duplicados_completos.add(tuple(columnas))  # Agregar la tupla completa a duplicados
                else:
                    tuplas_vistas.add(tupla_filtrada)
                    tuplas_vistas_completas[tupla_filtrada] = tuple(columnas)  # Guarda la tupla completa

        return list(duplicados_completos)  # Retornar como lista de tuplas completas

    except FileNotFoundError:
        print(f"Archivo '{log_filepath}' no encontrado.")
        return []
