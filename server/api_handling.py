import json
import os
from flask_socketio import SocketIO, send
from flask import Flask
import subprocess

app = Flask(__name__)
socketio = SocketIO(app)

class ApiHandler:
    def __init__(self, logs_dir='logs', scripts_dir='scripts'):
        self.logs_dir = os.path.join(os.path.dirname(__file__), logs_dir)
        self.scripts_dir = os.path.join(os.path.dirname(__file__), scripts_dir)
        os.makedirs(self.logs_dir, exist_ok=True)
        os.makedirs(self.scripts_dir, exist_ok=True)

    def handle_message(self, message):
        print("Procesando mensaje:", message)
        try:
            data = json.loads(message)

            log_filename = data.get('log_file', 'default_log.txt')
            script_filename = data.get('script_file', 'default_script.py')

            log_file_path = os.path.join(self.logs_dir, log_filename)

            script_result = self.execute_script(script_filename, log_file_path)
            log_content = self.read_log_file(log_file_path)

            response = {
                "status": "success",
                "log_content": log_content,
                "script_output": script_result
            }
            socketio.emit('response', json.dumps(response))

        except Exception as e:
            socketio.emit('response', json.dumps({"status": "error", "message": str(e)}))

    def read_log_file(self, log_file_path):
        if not os.path.exists(log_file_path):
            return f"Log {log_file_path} no encontrado."

        with open(log_file_path, 'r') as log_file:
            return log_file.read()

def execute_script(self, script_filename, log_file_path):
    script_file_path = os.path.join(self.scripts_dir, script_filename)
    print(f"Ejecutando script en: {script_file_path}")

    if not os.path.exists(script_file_path):
        print(f"Script {script_filename} no encontrado.")
        return f"Script {script_filename} no encontrado."

    try:
        result = subprocess.run(
            ["python", script_file_path, log_file_path],
            capture_output=True,
            text=True
        )
        print("Resultado del script:", result.stdout)
        if result.returncode != 0:
            print("Error en ejecución:", result.stderr)
            return f"Error en ejecución: {result.stderr}"
        return result.stdout

    except Exception as e:
        print(f"Error al ejecutar el script {script_filename}: {str(e)}")
        return f"Error al ejecutar el script {script_filename}: {str(e)}"
