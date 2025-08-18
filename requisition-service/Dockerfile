# Builder stage
FROM python:3.10-slim as builder

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_ROOT_USER_ACTION=ignore \
    POETRY_VERSION=1.7.1

# Install system dependencies with upgrade and cleanup
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Poetry
RUN pip install --upgrade pip && \
    pip install poetry==${POETRY_VERSION}

# Copy dependency files
COPY pyproject.toml poetry.lock* ./

# Install project dependencies (including dev dependencies for builder)
RUN poetry config virtualenvs.create false && \
    poetry install --no-interaction --no-ansi --only main

# Copy application code
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# --- Final image ---
FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/home/appuser/.local/bin:${PATH}" \
    PYTHONPATH="/app"

# Install runtime dependencies
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    libmariadb3 \
    netcat-openbsd \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root user early for better security
RUN useradd --create-home appuser && \
    mkdir -p /app/staticfiles && \
    chown -R appuser:appuser /app

# Copy from builder stage
COPY --from=builder --chown=appuser:appuser /app /app
COPY --from=builder --chown=appuser:appuser /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=builder --chown=appuser:appuser /app/staticfiles /app/staticfiles

USER appuser

# Health check with dependencies verification
HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health/ || exit 1

# Entrypoint script for pre-start checks
COPY --chown=appuser:appuser docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Default command
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", \
    "--threads", "2", "--timeout", "120", "--access-logfile", "-", \
    "--error-logfile", "-", "user_service.wsgi:application"]