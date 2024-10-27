from flask import Flask, render_template, redirect, url_for
from flask_socketio import SocketIO
from api_handling import ApiHandler
import os

app = Flask(__name__)

socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def login():
    return redirect('http://localhost:5001/login') # cambiar para produccion

@app.route('/home')
def home():
    handler = ApiHandler() # Probablemente no vaya aca pero la idea es que se instancie asi
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)