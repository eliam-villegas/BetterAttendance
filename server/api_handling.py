import os
import uuid
from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
import subprocess

UPLOAD_FOLDER = './uploads'
SCRIPT_FOLDER = './scripts'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SCRIPT_FOLDER'] = SCRIPT_FOLDER

@app.route('/_handle', methods=['POST'])
def _handle():
    if 'file' not in request.files or 'script' not in request.form:
        return jsonify({"error": "Script not defined"}), 400

    file = request.files['file']
    script_ref = request.form['script']

    if not file.filename.endswith('.txt'):
        return jsonify({"error": "Invalid extension"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    script_path = os.path.join(app.config['SCRIPT_FOLDER'], script_ref)
    if not os.path.isfile(script_path):
        return jsonify({"error": "Script not found"}), 404

    change_id = str(uuid.uuid4())

    try:
        subprocess.run([script_path, file_path], check=True)
    except subprocess.CalledProcessError as e:
        return jsonify({"error": "Script error", "details": str(e)}), 500

    return 'referencia al archivo'
    #return send_file(file_path, as_attachment=True, attachment_filename=filename), 200, {"Change-ID": change_id}
