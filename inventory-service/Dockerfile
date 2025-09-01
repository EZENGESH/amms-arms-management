FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONFAULTHANDLER=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PIP_NO_CACHE_DIR=1

# Create a non-root user
RUN addgroup --system --gid 1000 appgroup && \
    adduser --system --uid 1000 --gid 1000 appuser

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    pkg-config \
    default-libmysqlclient-dev \
    gcc \
    netcat-openbsd \
    libmariadb-dev-compat \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install --trusted-host pypi.org \
               --trusted-host pypi.python.org \
               --trusted-host files.pythonhosted.org \
               --no-cache-dir \
               -r requirements.txt

# Copy application files with proper ownership
COPY --chown=appuser:appgroup . .

# Change to non-root user
USER appuser

# Create directory for static files and collect static files
RUN mkdir -p staticfiles && \
    python manage.py collectstatic --noinput

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python manage.py check --deploy || exit 1

# Startup command
CMD ["/bin/bash", "-c", \
    "echo 'Waiting for database...'; \
    counter=0; \
    max_wait=60; \
    while ! nc -z \${DJANGO_DB_HOST} \${DJANGO_DB_PORT} -w 1; do \
        sleep 1; \
        counter=\$((counter+1)); \
        if [ \$counter -ge \$max_wait ]; then \
            echo 'Error: Database not available after \$max_wait seconds'; \
            exit 1; \
        fi; \
    done; \
    echo 'Database is available!'; \
    echo 'Running migrations...'; \
    python manage.py migrate --noinput; \
    echo 'Starting development server...'; \
    exec python manage.py runserver 0.0.0.0:8000"]