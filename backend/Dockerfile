FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Run migrations first, then spin up the server
CMD alembic upgrade head && uvicorn app:app --host 0.0.0.0 --port $PORT --workers 2
