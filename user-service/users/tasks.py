from celery import shared_task

@shared_task
def send_welcome_email(user_id):
    # Simulate sending a welcome email
    print(f"Sending welcome email to user with ID: {user_id}")
    return f"Welcome email sent to user {user_id}."