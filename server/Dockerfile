FROM python:3.10-slim

RUN apt-get update && \
    apt-get install -y git && \
    apt-get clean

RUN mkdir -p /app && cd /app && git init

# Crear un nuevo usuario (ajusta el UID y GID si es necesario)
RUN adduser --disabled-password --gecos '' myuser && \
    chown -R myuser:myuser /app

# Cambiar el usuario
USER myuser

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

CMD ["python", "app.py"]
#CMD ["flask", "run", "--host=0.0.0.0"]