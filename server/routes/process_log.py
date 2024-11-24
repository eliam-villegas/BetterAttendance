from flask import Blueprint, request, jsonify
import os
from time import time
from scripts.find_duplicates_log import buscar_duplicados_en_lista
from scripts.remove_duplicates_log import eliminar_duplicados_en_lista
from scripts.find_entries_without_exit import buscar_entradas_sin_salidas
from scripts.correct_consecutive_events import corregir_eventos_consecutivos

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

@process_log_bp.route('/check-entries-without-exits', methods=['POST'])
def check_entries_without_exits():
    data = request.json.get('data', [])
    if not data:
        return jsonify({'message': 'No se recibió ningún dato.'}), 400

    resultados = buscar_entradas_sin_salidas(data)
    return jsonify({'message': 'Entradas sin salidas procesadas.', 'resultados': resultados})

@process_log_bp.route('/correct-consecutive-events', methods=['POST'])
def correct_consecutive_events():
    data = request.json.get('data', [])
    if not data:
        return jsonify({'message': 'No se recibió ningún dato.'}), 400

    resultados = corregir_eventos_consecutivos(data)
    return jsonify({'message': 'Eventos consecutivos corregidos.', 'resultados': resultados})
