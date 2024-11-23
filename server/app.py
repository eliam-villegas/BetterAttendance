from flask import Flask, render_template, redirect, url_for
from flask_socketio import SocketIO
from api_handling import ApiHandler
from routes.process_log import process_log_bp  # Importa el Blueprint
from Gitlike import Gitlike
import os

app = Flask(__name__)
socketio = SocketIO(app)

UPLOAD_FOLDER = os.path.join(app.root_path, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Registra el Blueprint
app.register_blueprint(process_log_bp)

@app.route('/')
def login():
    #return redirect('http://localhost:5001/login')      #<-- Para producción
    return redirect(url_for('calendar'))               # <-- Para desarrollo

@app.route('/home')
def calendar():
    return render_template('index.html')

@app.route('/editor')
def editor():
    return render_template('editor.html')

@socketio.on('message')
def handle_socket_message(message):
    print("Mensaje recibido en el servidor:", message)
    handler = ApiHandler()
    handler.handle_message(message)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
