import git
import os

class Gitlike():
    def __init__(self, logs_dir='logs'):
        self.logs_dir = os.path.join(os.path.dirname(__file__), logs_dir)
        pass

    def history_log(log_name):
        try:
            return "seguramente un json con los cambios o algo asi"
        except Exception as e:
            return "no hay log"

    def commit(log_name, mesagge='algo como default'):
        # hace add y commit
        # para el commit debe tener un mensaje automatico si es por script o pedir un mensaje obligatoriamente
        # tal vez que cada script tenga su mensaje default
        try:
            return "pass"
        except Exception as e:
            return "no habia mensaje o archivo"
        
    def rollback(log_name, commit_id):
        try:
            return "pass"
        except Exception as e:
            return "algun argumento esta mal"
        
    ######
    # puede que haya que hacer algo con las branches 