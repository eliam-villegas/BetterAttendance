from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # Necesario para que funcione `flash`

# Usuario y contraseña predefinidos
USERNAME = 'admin'
PASSWORD = 'password'

@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if username == USERNAME and password == PASSWORD:
            # Redirige a la webapp utilizando el nombre del servicio 'webapp'
            return redirect("http://main:5000/dashboard")  # 'webapp' es el nombre del servicio de Docker
        else:
            flash("Nombre de usuario o contraseña incorrectos")
    
    return render_template('login.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
