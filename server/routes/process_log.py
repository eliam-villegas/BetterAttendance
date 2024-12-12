from flask import Blueprint, request, jsonify, redirect, url_for
import os
import json
from time import time
from .Gitlike import Gitlike
from scripts.find_duplicates_log import buscar_duplicados_en_lista
from scripts.remove_duplicates_log import eliminar_duplicados_en_lista
from scripts.find_entries_without_exit import buscar_entradas_sin_salidas
from scripts.correct_consecutive_events import corregir_eventos_consecutivos
from scripts.insert_missing_exits import insertar_salidas_faltantes

# Crea el Blueprint
process_log_bp = Blueprint('process_log', __name__)

UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'uploads'))
EXPIRATION_TIME = 60 * 60 * 24  # 1 día en segundos

git = Gitlike()

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

@process_log_bp.route('/upload_file', methods=['POST'])
def upload_file():
    print(f"Method: {request.method}, Files: {request.files}")
    if request.method == 'POST':
        if 'file' not in request.files:
            return jsonify({'message': 'No se recibió ningún archivo.'}), 400

        file = request.files.get('file')

        if not file or file.filename == '':
            return jsonify({'message': 'No se recibió ningún archivo.'}), 400

        try:
            file.save(os.path.join(UPLOAD_FOLDER, file.filename))
            return jsonify({'message': 'Archivo subido correctamente.'}), 200
        except Exception as e:
            print(f"Error: {str(e)}")
            return jsonify({'message': 'Error al guardar el archivo.'}), 500
        
@process_log_bp.route('/save-changes', methods=['POST'])
def save_changes():
    data = request.json.get('data', [])
    file_name = request.json.get('file_name', '')

    if not data or not file_name:
        return jsonify({'message': 'No se recibió ningún dato o el nombre del archivo no fue proporcionado.'}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file_name)

    try:
        with open(file_path, 'w') as file:
            for row in data:
                # Reconstruir cada línea en formato del archivo original
                first_value = row['first_value']
                tipo_evento = '01' if row['tipo_evento'] == 'Entrada' else '03'
                hora, minuto = row['hora'].split(':')
                dia, mes, anio = row['fecha'].split('/')

                # Reconstruir línea
                line = f"{first_value},01,{tipo_evento},{row['rut_encriptado']},0000000000,{hora},{minuto},{mes},{dia},{anio},00,00,00,00,00,0000000000,0000000000,    0.00,    0.00\n"
                file.write(line)

        return jsonify({'message': 'Cambios guardados exitosamente.'}), 200
    except Exception as e:
        print(f"Error al guardar cambios: {e}")
        return jsonify({'message': 'Error al guardar los cambios.'}), 500
        

@process_log_bp.route('/update_metadata', methods=['POST'])
def update_metadata():
    data = request.get_json()

    date = data.get('date')
    file_name = data.get('file')

    if not date or not file_name:
        return jsonify({'message': 'Faltan datos importantes: fecha y nombre de archivo.'}), 400

    metadata_file = os.path.join(UPLOAD_FOLDER, "metadata.json")

    with open(metadata_file, 'r') as fp:
        try:
            listObj = json.load(fp)  
        except json.JSONDecodeError:
            listObj = []  

    new_entry = {
        "date": date, 
        "file": file_name  
    }
    listObj.append(new_entry)
    try:
        with open(metadata_file, 'w') as json_file:
            json.dump(listObj, json_file, indent=4, separators=(',', ': '))
    except Exception as e:
        print(f"Error al guardar metadata.json: {str(e)}")
        return jsonify({'message': 'Error al actualizar el archivo metadata.json.'}), 500

    return jsonify({'message': 'Datos actualizados.'}), 200
 

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

    print("Datos recibidos para corrección de eventos consecutivos:", data)  # Debug

    resultados, tiene_consecutivos = corregir_eventos_consecutivos(data)

    print("Resultados después de corrección:", resultados)  # Debug

    if not tiene_consecutivos:
        return jsonify({'message': 'No se encontraron eventos consecutivos.', 'resultados': resultados})

    return jsonify({'message': 'Eventos consecutivos corregidos.', 'resultados': resultados})

@process_log_bp.route('/insert-missing-exits', methods=['POST'])
def insert_missing_exits():
    data = request.json.get('data', [])
    if not data:
        return jsonify({'message': 'No se recibió ningún dato.'}), 400

    # Llamar a la función auxiliar para generar las salidas faltantes
    updated_data, nuevas_salidas = insertar_salidas_faltantes(data)

    if not nuevas_salidas:
        return jsonify({'message': 'No hay entradas sin salida para procesar.', 'resultados': updated_data})

    return jsonify({'message': 'Salidas faltantes insertadas.', 'resultados': updated_data})
