from flask import Flask, render_template, redirect, url_for, request,send_from_directory, g, session, flash
from flask_socketio import SocketIO
from api_handling import ApiHandler
from routes.process_log import process_log_bp  # Importa el Blueprint
import psycopg2
from psycopg2.extras import RealDictCursor
#from Gitlike import Gitlike
import os

app = Flask(__name__)
socketio = SocketIO(app)

# Registra el Blueprint
app.register_blueprint(process_log_bp)

# Clave
# app.secret_key = "software2"
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB para el tamano de archivos
UPLOADS_PATH = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['UPLOADS_PATH'] = UPLOADS_PATH
app.secret_key = 'supersecretkey'  # pa que funcione `flash`
app.config['SESSION_COOKIE_DOMAIN'] = '.miapp.com'

def get_db_connection():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )
    return conn

@app.before_request
def load_user():
    """Cargar el usuario de la sesión antes de cada solicitud"""
    g.username = session.get('username')
    g.role = session.get('role')

@app.route('/admin')
def admin_panel():
    if g.role != 'admin':
        return redirect(url_for('calendar'))  # Si no es admin, redirige al calendario

    return render_template('admin_panel.html')

@app.route('/admin/edit_user/<int:user_id>', methods=['GET', 'POST'])
def edit_user(user_id):
    conn = get_db_connection()
    cur = conn.cursor()

    # Obtener la información del usuario para mostrarla en el formulario
    cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user = cur.fetchone()

    if not user:
        flash("Usuario no encontrado.", "danger")
        return redirect(url_for('admin_panel'))  # Redirigir a la vista de panel de administración si el usuario no existe

    if request.method == 'POST':
        username = request.form['username']
        role = request.form['role']
        
        # Validar si el nombre de usuario ya está en uso (opcional)
        cur.execute("SELECT * FROM users WHERE username = %s AND id != %s", (username, user_id))
        existing_user = cur.fetchone()

        if existing_user:
            flash("El nombre de usuario ya está en uso.", "danger")
            return redirect(url_for('edit_user', user_id=user_id))

        # Actualizar la información del usuario en la base de datos
        cur.execute("""
            UPDATE users
            SET username = %s, role = %s
            WHERE id = %s
        """, (username, role, user_id))

        conn.commit()
        cur.close()
        conn.close()

        flash("Usuario actualizado exitosamente.", "success")
        return redirect(url_for('admin_panel'))  # Redirigir al panel de administración después de editar

    # Mostrar el formulario de edición con la información actual del usuario
    return render_template('edit_user.html', user=user)

@app.route('/admin/delete_user/<int:user_id>')
def delete_user(user_id):
    conn = get_db_connection()
    cur = conn.cursor()

    # Comprobar si el usuario existe en la base de datos
    cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user = cur.fetchone()

    if not user:
        flash("Usuario no encontrado.", "danger")
        return redirect(url_for('admin_panel'))  # Redirigir si el usuario no existe

    # Eliminar el usuario de la base de datos
    cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
    conn.commit()
    cur.close()
    conn.close()

    flash("Usuario eliminado exitosamente.", "success")
    return redirect(url_for('admin_panel'))

@app.route('/logout')
def logout():
    session.clear()
    flash("Has cerrado sesión.", "info")
    return redirect('http://localhost:5001/login')


@app.route('/')
def login():
    #return redirect('http://localhost:5001/login')      #<-- Para producción
    return redirect(url_for('calendar'))               # <-- Para desarrollo

@app.route('/home')
def calendar():
    return render_template('index.html')

@app.route('/editor')
def editor():
    file_name = request.args.get('file')  # Obtener el nombre del archivo de la URL
    if not file_name:
        return "No se especificó ningún archivo.", 400

    file_path = os.path.join(app.config['UPLOADS_PATH'], file_name)
    if not os.path.exists(file_path):
        return "El archivo no existe.", 404

    return render_template('editor.html', file_name=file_name)


@socketio.on('message')
def handle_socket_message(message):
    print("Mensaje recibido en el servidor:", message)
    handler = ApiHandler()
    handler.handle_message(message)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOADS_PATH, filename)

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
