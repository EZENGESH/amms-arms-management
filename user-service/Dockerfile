FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install system dependencies including pkg-config and build tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    pkg-config \
    default-libmysqlclient-dev \
    gcc \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copy application files
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Create logs directory and set proper permissions BEFORE creating user
RUN mkdir -p /app/logs && \
    chmod 755 /app/logs && \
    touch /app/logs/django.log && \
    chmod 666 /app/logs/django.log

# Startup command
CMD bash -c "echo 'Waiting for database...'; \
while ! nc -z \${DJANGO_DB_HOST} \${DJANGO_DB_PORT} -w 1; do \
  sleep 1; \
done; \
python manage.py migrate --noinput; \
exec gunicorn --bind 0.0.0.0:8000 --workers 2 user_service.wsgi:application"