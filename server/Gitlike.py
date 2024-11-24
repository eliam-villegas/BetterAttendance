import os
import json
from git import Repo

class Gitlike():
    def __init__(self, path='./uploads'):
        self.repo_path = path
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
    
    def commit(self, file, date, msg='Cambios Guardados'):
        if not os.path.exists(os.path.join(self.repo_path, file)):
            raise RuntimeError(f"El archivo {file} no existe en el repositorio.")
        try:
            self.repo.git.add(".")
            self.repo.git.commit(m=msg)
            self.update_metadata(file, date)
        except Exception as e:
            raise RuntimeError(f"Error al guardar cambios: {e}")
        
    def update_metadata(self, file, date):
        metadata_file = os.path.join(self.repo_path, "metadata.json")
    
        with open(metadata_file, "r") as f:
            try:
                metadata = json.load(f)  # Intentamos cargar el JSON existente
            except json.JSONDecodeError:
                metadata = []  # Si hay un error de decodificación, inicializamos como lista vacía
            
        metadata.append({
        "date": date,
        "file": file
        })

        with open(metadata_file, "w") as f:
            json.dump(metadata, f, indent=4)

    def get_history(self, file):
        # me lo dio gepeto, hay que ver como se ve sino cambiarlo
        data = self.repo.git.execute(f'git log --pretty=format:"{{\\"commit\\": \\"%H\\", \\"author\\": \\"%an\\", \\"date\\": \\"%ad\\", \\"message\\": \\"%s\\"}}" -- {file}')
        history = json.dumps(data)
        return history
    
    def rollback(self, history_hash):
        # TODO: buscar como retornar el hash del historial para esta funcion
        try:
            self.repo.git.execute(f'git reset --soft {history_hash}')
        except Exception as e:
            raise RuntimeError(f"Error al devolver el cambio: {e}")