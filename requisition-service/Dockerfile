FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies required for mysqlclient
RUN apt-get update && apt-get install -y \
    gcc \
    libmariadb-dev \
    default-libmysqlclient-dev \
    pkg-config \
    build-essential \
    default-mysql-client \
    && apt-get clean

# Set the working directory
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Set the default command to run the application
CMD ["gunicorn", "requisition_service.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]