from flask import Blueprint, render_template, request, redirect, url_for, flash

auth_bp = Blueprint('auth', __name__)

USERNAME = 'admin'
PASSWORD = '1234'

@auth_bp.route('/')
def index():
    return redirect(url_for('auth.login'))

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username == USERNAME and password == PASSWORD:
            return redirect('http://localhost:5000/home')
        else:
            flash("Nombre de usuario o contraseña incorrectos")
    return render_template('login.html')
