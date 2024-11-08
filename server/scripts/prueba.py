def borrar_contenido_archivo(ruta_archivo):
    try:
        with open(ruta_archivo, 'w') as archivo:
            # Abrir en modo 'w' borra todo el contenido automáticamente
            pass
        print(f"El contenido de '{ruta_archivo}' ha sido borrado.")
    except Exception as e:
        print(f"Error al intentar borrar el contenido del archivo: {e}")
