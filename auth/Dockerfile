FROM python:3.9-slim

WORKDIR /app

RUN pip install --no-cache-dir -r Flask

COPY . .

EXPOSE 5001

CMD ["python", "app.py"]
