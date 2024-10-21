from flask import Flask
from flask_socketio import SocketIO
from api_handling import handle_pipe
import os

app = Flask(__name__)

socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def hello():
    return "Hello from Flask!"

if __name__ == '__main__':
    app.run(host='0.0.0.0')