from django.db import connection

from django.shortcuts import render
from datetime import datetime



from django.shortcuts import render
from django.db import connection
from datetime import datetime


def fetch_task_dashboard_data(user_id, selected_date_str):
    """
    Fetch the data required for the task dashboard.

    Args:
        user_id (int): The ID of the logged-in user.
        selected_date_str (str): The selected date as a string.

    Returns:
        dict: A dictionary containing designation, selected_date, and monthly_calendar_data.
    """
    # Fetch the user's designation
    designation = None
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT designation FROM auth_user WHERE id = %s", [user_id])
            result = cursor.fetchone()
            designation = result[0] if result else None
    except Exception as e:
        print(f"Error fetching designation: {e}")

    # Parse the selected date or use the current date
    try:
        selected_date = datetime.strptime(selected_date_str,
                                          '%Y-%m-%d').date() if selected_date_str else datetime.now().date()
    except ValueError:
        selected_date = datetime.now().date()
        print("Invalid date format provided. Defaulting to today's date.")

    # Fetch task data for the selected date
    monthly_calendar_data = []
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    id, title, scope, date, time, assigned, category, project, 
                    list, rev_no, comments, benchmark, d_no, mail_no, ref_no, created, updated
                FROM tasktracker.tracker_monthlycalendar
                WHERE date = %s
            """, [selected_date])
            rows = cursor.fetchall()
            monthly_calendar_data = [
                {
                    'id': row[0],
                    'title': row[1],
                    'scope': row[2],
                    'date': row[3],
                    'time': row[4],
                    'assigned': row[5],
                    'category': row[6],
                    'project': row[7],
                    'list': row[8],
                    'rev_no': row[9],
                    'comments': row[10],
                    'benchmark': row[11],
                    'd_no': row[12],
                    'mail_no': row[13],
                    'ref_no': row[14],
                    'created': row[15],
                    'updated': row[16],
                }
                for row in rows
            ]
    except Exception as e:
        print(f"Error fetching monthly calendar data: {e}")

    return {
        'designation': designation,
        'selected_date': selected_date,
        'monthly_calendar_data': monthly_calendar_data,
    }


def task_dashboard(request):
    """
    Render the task dashboard page.

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        HttpResponse: The rendered task dashboard page.
    """
    # Get the selected date from the request
    selected_date_str = request.GET.get('date', None)

    # Fetch the data using the helper function
    task_data = fetch_task_dashboard_data(request.user.id, selected_date_str)

    # Render the template with the data
    return render(request, 'tasks_dashboard.html', task_data)
