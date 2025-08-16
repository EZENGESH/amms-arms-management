FROM python:3.9-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc python3-dev default-libmysqlclient-dev pkg-config

COPY requirements.txt .
RUN pip install --user --no-cache-dir --timeout=1000 --retries=10 -r requirements.txt

COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# --- Final image ---
FROM python:3.9-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    default-libmysqlclient-dev \
    default-mysql-client \
    netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*

# Copy only necessary files from builder
COPY --from=builder /app /app
COPY --from=builder /root/.local /root/.local

ENV PATH=/root/.local/bin:$PATH

# Set environment variables for Django
ENV DJANGO_SETTINGS_MODULE=inventory_service.settings

# Gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "inventory_service.wsgi:application"]