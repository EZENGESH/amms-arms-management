FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONFAULTHANDLER=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PIP_NO_CACHE_DIR=1

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