FROM python:3.10-slim

RUN apt-get update && \
    apt-get install -y git && \
    apt-get clean

RUN mkdir -p /app && cd /app 

WORKDIR /server

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

CMD ["python", "app.py"]