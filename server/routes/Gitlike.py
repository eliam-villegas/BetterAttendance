import os
import json
from git import Repo
from datetime import datetime

UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'uploads'))

class Gitlike():
    def __init__(self):
        self.repo_path = UPLOAD_FOLDER
        print(f"Inicializando en {self.repo_path}")
        if not os.path.exists(self.repo_path):
            raise RuntimeError(f"Volumen no montado o inaccesible")
        else:
            print("Volumen encontrado, inicializando repositorio...")
            self.repo = self._init_repo()
            print(f"Repositorio inicializado en {self.repo_path}")

            
    def _init_repo(self):
        try:
            return Repo.init(self.repo_path)
        except:
            return Repo(self.repo_path)
    
    def commit(self, file, user, function):
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        msg = f"Cambio {function} en archivo {file} por usuario {user} el dia {date}"
        if not os.path.exists(os.path.join(self.repo_path, file)):
            raise RuntimeError(f"El archivo {file} no existe en el repositorio.")
        try:
            self.repo.index.add(file)
            print(f'files added')
            self.repo.index.commit(msg)
            print(f'files commited')
        except Exception as e:
            raise RuntimeError(f"Error al guardar cambios: {e}")

    def get_history(self, file):
        try:
            logs = self.repo.git.log(
                '--pretty=format:%H|%an|%ar|%s'
            )

            history = [
                {
                    "message": log.split('|')[3]
                }
                for log in logs.splitlines()
            ]
            
            filtered_history = [
                commit for commit in history if file in commit["message"]
            ]

            return filtered_history
        except Exception as e:
            raise RuntimeError(f"Error al obtener historial de cambios: {e}")

    def rollback(self, history_hash):
        # TODO: buscar como retornar el hash del historial para esta funcion
        try:
            self.repo.git.execute(f'git reset --soft {history_hash}')
        except Exception as e:
            raise RuntimeError(f"Error al devolver el cambio: {e}")