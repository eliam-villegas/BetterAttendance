FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt


##RUN pip install --no-cache-dir Flask

COPY . .

EXPOSE 5001

CMD ["python", "login.py"]
