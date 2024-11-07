from flask import Flask, render_template, redirect, send_from_directory, url_for
from flask_socketio import SocketIO
from api_handling import ApiHandler
#from Gitlike import Gitlike
import os

app = Flask(__name__)

socketio = SocketIO(app)

@app.route('/')
def login():
    #con login:
    #return redirect('http://localhost:5001/login') 

    #sin login(para pruebas):
    return redirect('http://localhost:5000/home') 

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

def home():
    return render_template('editor.html')

# Ruta para servir node_modules
@app.route('/node_modules/<path:filename>')
def node_modules(filename):
    return send_from_directory(os.path.join(app.root_path, 'node_modules'), filename)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
