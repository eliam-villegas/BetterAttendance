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

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)