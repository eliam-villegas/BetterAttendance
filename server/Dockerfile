FROM python:3.10-slim

RUN apt-get update && \
    apt-get install -y git && \
    apt-get clean

RUN mkdir -p /app && cd /app && git init

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

CMD ["flask", "run", "--host=0.0.0.0"]