FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

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

# Copy application files
COPY . .

# Create directory for static files
RUN mkdir -p staticfiles

# Simple CMD - Use shell form for simplicity
CMD python manage.py runserver 0.0.0.0:8000