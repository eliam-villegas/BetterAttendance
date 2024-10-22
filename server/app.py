from flask import Flask, render_template
from flask_socketio import SocketIO
from api_handling import handle_message
import os

app = Flask(__name__)

socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def hello():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0')