# =========================
#  Builder stage
# =========================
FROM python:3.10-slim AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    libmariadb-dev \
    default-mysql-client \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (with pip cache for faster rebuilds)
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project source
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput


# =========================
#  Final runtime stage
# =========================
FROM python:3.10-slim

WORKDIR /app

# Install only runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libmariadb3 \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages and source code
COPY --from=builder /usr/local /usr/local
COPY --from=builder /app /app

# Set environment variables
ENV PYTHONPATH=/app \
    DJANGO_SETTINGS_MODULE=requisition_service.settings

# Create non-root user early
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Entrypoint script handles DB wait + migrations
CMD bash -c '\
  echo "Waiting for database..." && \
  until mysqladmin ping -h "$DJANGO_DB_HOST" -u"$DJANGO_DB_USER" -p"$DJANGO_DB_PASSWORD" --silent; do \
    echo "Waiting for database..."; sleep 5; \
  done && \
  echo "Applying migrations..." && \
  python manage.py migrate --noinput && \
  echo "Starting server..." && \
  exec gunicorn --bind 0.0.0.0:8000 --workers 2 --timeout 120 requisition_service.wsgi:application \
'
