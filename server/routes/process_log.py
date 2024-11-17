from flask import Blueprint, request, jsonify
import os
from time import time
from scripts.find_duplicates_log import buscar_duplicados_en_lista
from scripts.remove_duplicates_log import eliminar_duplicados_en_lista

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
    data = request.json.get('data', [])
    if not data:
        return jsonify({'message': 'No se recibió ningún dato.'}), 400

    resultados = buscar_duplicados_en_lista(data)
    return jsonify({'message': 'Duplicados procesados.', 'resultados': resultados})

@process_log_bp.route('/remove-duplicates', methods=['POST'])
def remove_duplicates():
    data = request.json.get('data', [])
    if not data:
        return jsonify({'message': 'No se recibió ningún dato.'}), 400

    resultados = eliminar_duplicados_en_lista(data)
    return jsonify({'message': 'Duplicados eliminados.', 'resultados': resultados})