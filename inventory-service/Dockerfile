FROM python:3.10-slim

# -----------------------------
# Environment setup
# -----------------------------
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/usr/local/bin:$PATH"

WORKDIR /app

# -----------------------------
# Install system dependencies
# -----------------------------
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    pkg-config \
    default-libmysqlclient-dev \
    gcc \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# -----------------------------
# Install Python dependencies
# -----------------------------
COPY requirements.txt .
RUN python -m pip install --no-cache-dir --upgrade pip && \
    python -m pip install --no-cache-dir -r requirements.txt

# -----------------------------
# Copy project files
# -----------------------------
COPY . .
# Startup script
# -----------------------------
CMD bash -c "echo 'Waiting for database...'; \
while ! nc -z ${DJANGO_DB_HOST} ${DJANGO_DB_PORT} -w 1; do \
  sleep 1; \
done; \
echo 'Running migrations...'; \
python manage.py migrate --noinput; \
echo 'Collecting static files...'; \
python manage.py collectstatic --noinput; \
echo 'Starting Django server...'; \
exec python manage.py runserver 0.0.0.0:8000 --insecure"


