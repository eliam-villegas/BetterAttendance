from flask import Blueprint, request, jsonify, redirect, url_for
import os
import json
from time import time
from .Gitlike import Gitlike
from scripts.find_duplicates_log import buscar_duplicados_en_lista
from scripts.remove_duplicates_log import eliminar_duplicados_en_lista
from scripts.find_entries_without_exit import buscar_entradas_sin_salidas
from scripts.correct_consecutive_events import corregir_eventos_consecutivos

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

    print("Datos recibidos para corrección de eventos consecutivos:", data)  # Depuración

    resultados, tiene_consecutivos = corregir_eventos_consecutivos(data)

    if not tiene_consecutivos:
        print("No se encontraron eventos consecutivos.")  # Depuración
        return jsonify({'message': 'No se encontraron eventos consecutivos.', 'resultados': resultados})

    print("Eventos consecutivos corregidos:", resultados)  # Depuración
    return jsonify({'message': 'Eventos consecutivos corregidos.', 'resultados': resultados})

@process_log_bp.route('/insert-missing-exits', methods=['POST'])
def insert_missing_exits():
    data = request.json.get('data', [])
    if not data:
        return jsonify({'message': 'No se recibió ningún dato.'}), 400

    # Filtrar entradas sin salida
    datos_procesados = buscar_entradas_sin_salidas(data)
    sin_salida = [item for item in datos_procesados if item.get('estado') == 'SIN_SALIDA']

    print("Entradas sin salida:", sin_salida)

    if not sin_salida:
        return jsonify({'message': 'No hay entradas sin salida para procesar.', 'resultados': data})

    nuevas_salidas = []
    for entrada in sin_salida:
        fecha_entrada = entrada['fecha']
        rut = entrada['rut_encriptado']
        hora_entrada = entrada['hora']

        print(f"Procesando entrada: {entrada}")

        salida_sugerida = None

        # Filtrar eventos del mismo RUT
        eventos_del_rut = [evento for evento in data if evento['rut_encriptado'] == rut]

        # Buscar salida del día siguiente
        for evento in eventos_del_rut:
            if evento['tipo_evento'] == 'Salida' and evento['fecha'] > fecha_entrada:
                salida_sugerida = evento
                break

        # Si no se encuentra salida del día siguiente, buscar del día anterior
        if not salida_sugerida:
            for evento in eventos_del_rut:
                if evento['tipo_evento'] == 'Salida' and evento['fecha'] < fecha_entrada:
                    salida_sugerida = evento

        # Si no se encuentra ninguna salida, generar una salida predeterminada
        if not salida_sugerida:
            print(f"No se encontró salida para la entrada {entrada}, generando salida predeterminada.")
            nueva_salida = {
                'tipo_evento': 'Salida',
                'rut_encriptado': rut,
                'hora': '18:00',  # Hora predeterminada
                'fecha': fecha_entrada,  # Mantener la misma fecha que la entrada
            }
        else:
            print(f"Salida sugerida para la entrada {entrada}: {salida_sugerida}")
            nueva_salida = {
                'tipo_evento': 'Salida',
                'rut_encriptado': rut,
                'hora': salida_sugerida['hora'],
                'fecha': fecha_entrada,  # Mantener la misma fecha que la entrada
            }

        nuevas_salidas.append(nueva_salida)

    print("Nuevas salidas generadas:", nuevas_salidas)

    # Agregar las nuevas salidas al conjunto de datos
    data.extend(nuevas_salidas)

    # Marcar las entradas que ahora tienen salidas como "CON_SALIDA"
    for entrada in sin_salida:
        entrada['estado'] = 'CON_SALIDA'

    return jsonify({'message': 'Salidas faltantes insertadas.', 'resultados': data})
