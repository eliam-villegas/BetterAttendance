import os
from flask import Blueprint, render_template, request, redirect, url_for, flash, session, g
from werkzeug.security import generate_password_hash, check_password_hash
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Cargar las variables de entorno del archivo .env
load_dotenv()

auth_bp = Blueprint('auth', __name__)

def get_db_connection():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )
    return conn

@auth_bp.route('/')
def index():
    return redirect(url_for('auth.login'))

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cur.fetchone()
        cur.close()
        conn.close()

        if user and check_password_hash(user['password'], password):
            session['username'] = user['username']
            session['role'] = user['role']  
            flash("Has iniciado sesión exitosamente.", "success")
            return redirect('http://localhost:5000/home')
        else:
            flash("Nombre de usuario o contraseña incorrectos.", "danger")
    return render_template('login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        role = request.form['role']  # Obtener el rol del formulario, por defecto 'user'
        
        # Comprobar si el nombre de usuario ya existe
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cur.fetchone()
        cur.close()

        if user:
            flash("El nombre de usuario ya está en uso.", "danger")
            return redirect(url_for('auth.register'))

        # Encriptar la contraseña antes de almacenarla
        hashed_password = generate_password_hash(password)

        # Insertar el nuevo usuario en la base de datos
        cur = conn.cursor()
        cur.execute("INSERT INTO users (username, password, role) VALUES (%s, %s, %s)", 
                    (username, hashed_password, role))
        conn.commit()
        cur.close()
        conn.close()

        flash("Usuario registrado exitosamente.", "success")
        return redirect(url_for('auth.login'))  # Redirigir al login después del registro

    return render_template('register.html')
