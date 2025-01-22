
from datetime import datetime
from django.shortcuts import render, redirect
from django.contrib import messages
from django.db import connection
import base64
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib import messages
from django.db import connection

import json

# Define a global variable
global_user_data = None

def login(request):
    global global_user_data  # Declare the global variable
    
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Invalid request format."})
        
        # Check the credentials in the database
        user = None
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT employee_id, name FROM employee_details WHERE name = %s AND password = %s",
                [username, password]
            )
            user = cursor.fetchone()
        
        if user:
            # Store employee_id and name in a single variable (as a dictionary)
            global_user_data = {
                "employee_id": user[0],
                "name": user[1]
            }

            # Save user ID in the session for further authentication
            request.session['user_id'] = user[0]
            return JsonResponse({"success": True, "redirect_url": "/task_dashboard/"})
        else:
            return JsonResponse({"success": False, "message": "Invalid username or password."})
    
    return render(request, 'signin.html')


def task_dashboard(request):
    global global_user_data  # Assuming you're using a global variable for user data

    # Default data
    user_id = global_user_data.get("employee_id", None)
    name = global_user_data.get("name", "Guest")
    designation = "No Designation"
    image_base64 = None

    if user_id:
        # Fetch designation and image from the database
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT designation, image FROM employee_details WHERE employee_id = %s", [user_id]
            )
            result = cursor.fetchone()
            if result:
                designation = result[0]
                image_data = result[1]
                if image_data:
                    # Convert binary image data to Base64
                    image_base64 = base64.b64encode(image_data).decode('utf-8')

    # Pass data to the template
    return render(request, 'tasks_dashboard.html', {
        'name': name,
        'designation': designation,
        'image_base64': image_base64,  # Base64-encoded image string
        'employee_id': user_id  # Pass employee_id to the template
    })

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
        selected_date = (
            datetime.strptime(selected_date_str, '%Y-%m-%d').date()
            if selected_date_str
            else datetime.now().date()
        )
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




