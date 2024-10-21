import json
from flask_socketio import send
import os

LOGS_DIR = os.path.join(os.path.dirname(__file__), 'logs')
SCRIPTS_DIR = os.path.join(os.path.dirname(__file__), 'scripts')

def handle_message(message):
    try:
        data = json.loads(message)

        log_filename = data.get('log_file', 'default_log.txt')
        script_filename = data.get('script_file', 'default_script.py')

        log_file_path = os.path.join(LOGS_DIR, log_filename)

        script_result = execute_script(script_filename, log_file_path)

        log_content = read_log_file(log_file_path)

        response = {
            "status": "success",
            "log_content": log_content,
            "script_output": script_result
        }

        send(json.dumps(response))

    except Exception as e:
        send(json.dumps({"status": "error", "message": str(e)}))

def read_log_file(log_filename):
    if not os.path.exists(log_filename):
        return f"Log {log_filename} no encontrado."

    with open(log_filename, 'r') as log_file:
        return log_file.read()

def execute_script(script_filename, log_file_path):
    script_file_path = os.path.join(SCRIPTS_DIR, script_filename)

    if not os.path.exists(script_file_path):
        return f"Script {script_filename} no encontrado."

    try:
        exec_globals = {}
        with open(script_file_path, 'r') as script_file:
            exec(script_file.read(), {"log_file_path": log_file_path, **exec_globals})
        return exec_globals.get("run")(log_file_path)
    except Exception as e:
        return f"Error al ejecutar el script {script_filename}: {str(e)}"
