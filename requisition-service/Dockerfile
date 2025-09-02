FROM python:3.10-slim AS builder

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    libmariadb-dev \
    default-mysql-client \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY . .

# --- Final Image ---
FROM python:3.10-slim

WORKDIR /app

# Runtime dependencies only
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    netcat-openbsd \
    libmariadb3 \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy from builder
COPY --from=builder /app /app
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages

# Environment variables
ENV PYTHONPATH=/app
ENV DJANGO_SETTINGS_MODULE=requisition_service.settings


# CMD: wait for DB, run migrations, then start server
CMD bash -c \
    "echo 'Waiting for database...' && \
    until mysql -h \$DJANGO_DB_HOST -u\$DJANGO_DB_USER -p\$DJANGO_DB_PASSWORD -e 'SELECT 1;'; do \
      echo 'Waiting for database...'; sleep 5; \
    done && \
    echo 'Applying migrations...' && \
    python manage.py makemigrations && \
    python manage.py migrate && \
    echo 'Collecting static files...' && \
    python manage.py collectstatic --noinput && \
    echo 'Starting server...' && \
    exec gunicorn --bind 0.0.0.0:8000 --workers 2 --timeout 120 requisition_service.wsgi:application"

