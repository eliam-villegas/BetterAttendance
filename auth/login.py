from flask import Flask, render_template, request, redirect, url_for, flash

# Importar las rutas de los blueprints
from routes.error import errors_bp
from routes.auth import auth_bp

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # pa que funcione `flash`
app.config['SESSION_COOKIE_DOMAIN'] = None

# Registrar los blueprints
app.register_blueprint(errors_bp)
app.register_blueprint(auth_bp)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
