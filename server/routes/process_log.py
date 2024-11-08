from flask import Blueprint, request, jsonify
import os
from time import time
from scripts.find_duplicates_log import buscar_duplicados_en_log
from scripts.remove_duplicates_log import eliminar_duplicados_log

# Crea el Blueprint
process_log_bp = Blueprint('process_log', __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads')
EXPIRATION_TIME = 60 * 60 * 24  # 1 día en segundos

# Función para limpiar archivos antiguos
def clean_upload_folder():
    """Elimina archivos antiguos en la carpeta uploads."""
    now = time()
    for filename in os.listdir(UPLOAD_FOLDER):
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.isfile(file_path):
            # Si el archivo es más antiguo que el tiempo de expiración, se elimina
            if now - os.path.getmtime(file_path) > EXPIRATION_TIME:
                os.remove(file_path)
                print(f"Archivo eliminado: {file_path}")

@process_log_bp.route('/find-duplicates', methods=['POST'])
def find_duplicates():
    clean_upload_folder()  # Limpia archivos antes de procesar la solicitud

    if 'log_file' not in request.files:
        return jsonify({'message': 'No se subió ningún archivo.'}), 400

    log_file = request.files['log_file']
    if log_file.filename == '':
        return jsonify({'message': 'Nombre de archivo vacío.'}), 400

    log_filepath = os.path.join(UPLOAD_FOLDER, log_file.filename)
    log_file.save(log_filepath)

    resultados = buscar_duplicados_en_log(log_filepath)
    
    return jsonify({'message': 'Duplicados procesados.', 'resultados': resultados})

@process_log_bp.route('/remove-duplicates', methods=['POST'])
def remove_duplicates():
    clean_upload_folder()  # Limpia archivos antes de procesar la solicitud

    if 'log_file' not in request.files:
        return jsonify({'message': 'No se subió ningún archivo.'}), 400

    log_file = request.files['log_file']
    if log_file.filename == '':
        return jsonify({'message': 'Nombre de archivo vacío.'}), 400

    log_filepath = os.path.join(UPLOAD_FOLDER, log_file.filename)
    log_file.save(log_filepath)

    # Ejecutar el script para eliminar duplicados y obtener solo las filas únicas
    resultados = eliminar_duplicados_log(log_filepath)
    
    return jsonify({'message': 'Duplicados eliminados.', 'resultados': resultados})
