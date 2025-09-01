FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    default-libmysqlclient-dev \
    pkg-config \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copy application files
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    python manage.py collectstatic --noinput

# Create a non-root user for security
RUN useradd -m -r appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health/', timeout=5)" || exit 1

# Startup command with fixed nc syntax
CMD bash -c "echo 'Waiting for database...'; \
while ! nc -z \${DJANGO_DB_HOST} \${DJANGO_DB_PORT} -w 1; do \
  sleep 1; \
done; \
echo 'Applying migrations...'; \
python manage.py migrate --noinput; \
echo 'Starting server...'; \
exec gunicorn --bind 0.0.0.0:8000 --workers 2 --timeout 120 --access-logfile - user_service.wsgi:application"