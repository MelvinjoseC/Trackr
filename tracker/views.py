from django.db import connection
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from datetime import datetime


@login_required
def task_dashboard(request):
    # Fetch the logged-in user's designation
    designation = None
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT designation FROM auth_user WHERE id = %s", [request.user.id])
            result = cursor.fetchone()
            designation = result[0] if result else None
    except Exception as e:
        print(f"Error fetching designation: {e}")

    # Get the selected date from the request or use the current date
    selected_date_str = request.GET.get('date', None)
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

    # Prepare the context for the template
    task_data = {
        'designation': designation,  # Add user designation to context
        'monthly_calendar_data': monthly_calendar_data,  # Include fetched calendar data
        'selected_date': selected_date,  # Pass the selected or current date
    }

    # Render the task dashboard template
    return render(request, 'tasks_dashboard.html', task_data)
