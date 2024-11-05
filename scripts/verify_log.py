import os
from datetime import datetime

def verificar_log(log_filename):
    """
    Verifica si el archivo log es del dia de hoy.

    Parámetros:
    - log_filename (str): nombre del archivo log.

    Retorna:
    - Si el log corresponde al dia o no.
    """
    # Definir el formato del nombre del archivo de log
    formato = "SIRH-%d-%m-%y_%d-%m-%y"

    # Comprobar si el archivo existe
    if not os.path.exists(log_filename):
        return f"El archivo de log '{log_filename}' no existe."

    # Extraer la fecha actual en el formato adecuado
    fecha_hoy = datetime.now().strftime("%d-%m-%y")

    # Intentar extraer la fecha del nombre del archivo
    try:
        # Obtener la parte de la fecha del nombre del archivo
        nombre_partes = log_filename.split("_")
        fecha_inicial = nombre_partes[0][5:15]  # DD-MM-YY
        fecha_final = nombre_partes[1]  # DD2-MM2-YY2

        # Comprobar si la fecha inicial es hoy
        if fecha_final == fecha_hoy:
            return f"El log '{log_filename}' corresponde al día de hoy."
        else:
            return f"El log '{log_filename}' no corresponde al día de hoy. Fecha inicial: {fecha_final}, hoy: {fecha_hoy}."

    except Exception as e:
        return f"Error al procesar el nombre del archivo: {str(e)}"

