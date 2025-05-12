from celery import shared_task

@shared_task
def generate_report(report_id):
    # Simulate report generation
    print(f"Generating report with ID: {report_id}")
    return f"Report {report_id} generated successfully."