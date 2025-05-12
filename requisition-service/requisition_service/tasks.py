from celery import shared_task

@shared_task
def process_requisition(requisition_id):
    # Simulate requisition processing
    print(f"Processing requisition with ID: {requisition_id}")
    return f"Requisition {requisition_id} processed successfully."