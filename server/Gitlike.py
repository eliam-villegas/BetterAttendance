import git
import os
import json 

class Gitlike():
    def __init__(self, logs_dir='logs'):
        self.logs_dir = os.path.join(os.path.dirname(__file__), logs_dir)
        os.makedirs(self.logs_dir, exist_ok=True)

    def history_log(self, log_name):
        try:
            log_path = os.path.join(self.logs_dir, f"{log_name}.json")
            if os.path.exists(log_path):
                with open(log_path, 'r') as log_file:
                    return json.load(log_file)
            else:
                return "No hay historial disponible."
        except Exception as e:
            return f"Error al cargar el historial: {e}"

    def commit(self, log_name, mesagge='default'):
        try:
            log_path = os.path.join(self.logs_dir, f"{log_name}.json")
            
            if os.path.exists(log_path):
                with open(log_path, 'r') as log_file:
                    history = json.load(log_file)
            else:
                history = []

            commit_id = len(history) + 1
            commit_data = {
                "id": commit_id,
                "message": message,
            }

            history.append(commit_data)
            with open(log_path, 'w') as log_file:
                json.dump(history, log_file, indent=4)

            return f"Cambio {commit_id} realizado."
        except Exception as e:
            return f"Error en commit: {e}"
        
    def rollback(self, log_name, commit_id):
        try:
            log_path = os.path.join(self.logs_dir, f"{log_name}.json")
            
            if os.path.exists(log_path):
                with open(log_path, 'r') as log_file:
                    history = json.load(log_file)
                
                # Filtrar el historial hasta el commit_id especificado
                history = [commit for commit in history if commit['id'] <= commit_id]
                
                with open(log_path, 'w') as log_file:
                    json.dump(history, log_file, indent=4)
                
                return f"Rollback al cambio {commit_id} completado."
            else:
                return "No existe historial para hacer rollback."
        except Exception as e:
            return f"Error en rollback: {e}"
        
    ######
    # puede que haya que hacer algo con las branches 