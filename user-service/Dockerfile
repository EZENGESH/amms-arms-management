FROM python:3.10-slim AS builder

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Set working directory
WORKDIR /app

# Install system dependencies with retry logic
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    libmariadb-dev \
    pkg-config \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the application
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# --- Final image ---
FROM python:3.10-slim

WORKDIR /app

# Install runtime dependencies with retry
RUN apt-get update && \
    (apt-get install -y --no-install-recommends \
    libmariadb3 \
    netcat-openbsd \
    || apt-get update && apt-get install -y --no-install-recommends \
    libmariadb3 \
    netcat-openbsd) \
    && rm -rf /var/lib/apt/lists/*

# Copy from builder
COPY --from=builder /app /app
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Combined command for waiting, migrations, and running Gunicorn
CMD bash -c \
    "echo 'Waiting for database...' && \
    while ! nc -z \$DB_HOST \$DB_PORT; do sleep 2; done && \
    echo 'Applying migrations...' && \
    python manage.py makemigrations && \
    python manage.py migrate && \
    echo 'Starting server...' && \
    exec gunicorn --bind 0.0.0.0:8000 --workers 2 --timeout 120 user_service.wsgi:application"