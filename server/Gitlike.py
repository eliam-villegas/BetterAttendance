import os
import json
from git import InvalidGitRepositoryError, Repo, GitCommandError

class Gitlike():
    def __init__(self, repo_path='.', logs_dir='logs'):
        self.repo_path = os.path.abspath(repo_path)
        self.logs_dir = os.path.join(os.path.dirname(__file__), logs_dir)
        os.makedirs(self.logs_dir, exist_ok=True)

        # Comprobar si el repositorio es válido, si no, inicializar uno nuevo
        try:
            self.repo = Repo(self.repo_path)
            if self.repo.bare:
                raise InvalidGitRepositoryError("El repositorio es bare.")
        except InvalidGitRepositoryError:
            # Inicializar un nuevo repositorio si no existe
            self.repo = Repo.init(self.repo_path)
            print(f"Repositorio Git inicializado en {self.repo_path}")

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

    def commit(self, log_name, message='default'):
        try:
            self.repo.git.add(A=True)
            commit = self.repo.index.commit(message)
            
            log_path = os.path.join(self.logs_dir, f"{log_name}.json")
            if os.path.exists(log_path):
                with open(log_path, 'r') as log_file:
                    history = json.load(log_file)
            else:
                history = []

            commit_data = {
                "id": commit.hexsha,
                "message": commit.message,
                "author": commit.author.name,
                "date": commit.committed_datetime.isoformat()
            }

            history.append(commit_data)
            with open(log_path, 'w') as log_file:
                json.dump(history, log_file, indent=4)

            return f"Commit {commit.hexsha} realizado con mensaje: {message}"
        except GitCommandError as e:
            return f"Error en commit: {e}"

    def rollback(self, log_name, commit_id):
        try:
            self.repo.git.reset('--hard', commit_id)
            
            log_path = os.path.join(self.logs_dir, f"{log_name}.json")
            if os.path.exists(log_path):
                with open(log_path, 'r') as log_file:
                    history = json.load(log_file)

                history = [commit for commit in history if commit['id'] == commit_id]
                
                with open(log_path, 'w') as log_file:
                    json.dump(history, log_file, indent=4)
                
                return f"Rollback al commit {commit_id} completado."
            else:
                return "No existe historial para hacer rollback."
        except GitCommandError as e:
            return f"Error en rollback: {e}"



    def log(self, limit=10):
        try:
            commits = list(self.repo.iter_commits('HEAD', max_count=limit))
            log_list = []
            for commit in commits:
                log_list.append({
                    "id": commit.hexsha,
                    "message": commit.message,
                    "author": commit.author.name,
                    "date": commit.committed_datetime.isoformat()
                })
            return log_list
        except GitCommandError as e:
            return f"Error al obtener el log: {e}"

    # Por si acaso se quedan
    def create_branch(self, branch_name):
        try:
            new_branch = self.repo.create_head(branch_name)
            return f"Rama '{branch_name}' creada exitosamente."
        except GitCommandError as e:
            return f"Error al crear rama: {e}"

    def checkout_branch(self, branch_name):
        try:
            self.repo.git.checkout(branch_name)
            return f"Cambio a la rama '{branch_name}' completado."
        except GitCommandError as e:
            return f"Error al cambiar de rama: {e}"