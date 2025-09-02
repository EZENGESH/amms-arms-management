# Use Python base image
FROM python:3.10-slim

# Set workdir
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Run Gunicorn (Django WSGI)
CMD ["gunicorn", "requisition_service.wsgi:application", "--bind", "0.0.0.0:8000"]
