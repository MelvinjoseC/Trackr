
from datetime import datetime
from django.shortcuts import render, redirect
from django.contrib import messages
from django.db import connection
import base64
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib import messages
from django.db import connection
from .models import EmployeeDetails
from .models import TrackerTasks
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


def task_dashboard_api(request):
    # Fetch all tracker tasks
    task_list = []
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM tracker_project")
            tasks = cursor.fetchall()
            if cursor.description:
                task_columns = [col[0] for col in cursor.description]
                task_list = [dict(zip(task_columns, task)) for task in tasks]
    except Exception as e:
        return JsonResponse({"success": False, "message": f"Error fetching tasks: {str(e)}"})

    # Return task data as JSON
    return JsonResponse({"success": True, "tasks": task_list})

def sign_up(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Invalid request format."})

        if not username or not password:
            return JsonResponse({"success": False, "message": "Both username and password are required."})

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT authentication FROM employee_details WHERE name = %s AND password = %s",
                [username, password]
            )
            result = cursor.fetchone()

        if result:
            designation = result[0]
            if designation.lower() == 'admin':
                return render(request, 'employee_form.html')  # Render the HTML form for admin users
            else:
                return JsonResponse({"success": False, "message": "Only admin users are allowed to sign up."})
        else:
            return JsonResponse({"success": False, "message": "Invalid username or password."})

    return JsonResponse({"success": False, "message": "Invalid request method."})


def save_employee_details(request):
    if request.method == "POST":
        name = request.POST.get("name")
        designation = request.POST.get("designation")
        date_joined = request.POST.get("date_joined")
        email = request.POST.get("email")
        phone_number = request.POST.get("phone_number")
        department = request.POST.get("department")
        
        status = request.POST.get("status", "Active")
        password = request.POST.get("password")
        image = request.FILES.get("image")  # Get the uploaded file

        # Save the data to the EmployeeDetails model
        employee = EmployeeDetails(
            name=name,
            designation=designation,
            date_joined=date_joined,
            email=email,
            phone_number=phone_number,
            department=department,
        
            status=status,
            password=password,
            image=image.read() if image else None,  # Convert image to binary
        )
        employee.save()

        return JsonResponse({"success": True, "name": employee.name})  # Respond with success
    else:
        return JsonResponse({"success": False, "message": "Invalid request method."})



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
                    id, title, scope, date, time, assigned, category, projects, 
                    list, rev, comments, benchmark, d_no, mail_no, ref_no, created, updated, verification_status, task_status,
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
                    'verification_status': row[17],
                    'task_status': row[18],
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



from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json

# Helper function to execute SQL queries
def execute_query(query, params=None):
    with connection.cursor() as cursor:
        cursor.execute(query, params)
        if query.strip().lower().startswith("select"):
            # Fetch all rows for SELECT queries
            return cursor.fetchall()
        else:
            # For INSERT, UPDATE, DELETE
            return None


@csrf_exempt


def create_task(request):
    if request.method == 'POST':
        try:
            # Parse the request body
            data = json.loads(request.body.decode('utf-8'))

            # Debugging: Print received data (Optional)
            print("Received Data:", data)

            # SQL query to insert data into tracker_project
            query = """
                INSERT INTO tracker_project
                (title, `list`, projects, scope, priority, assigned, checker, qc3_checker, `group`, category, start, end, verification_status, task_status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            params = (
                data.get('title', ''),        # Provide default empty string if None
                data.get('list', ''),         # `list` is escaped with backticks
                data.get('project', ''),
                data.get('scope', ''),
                data.get('priority', ''),
                data.get('assigned_to', ''),
                data.get('checker', ''),
                data.get('qc_3_checker', ''),
                data.get('group', ''),
                data.get('category', ''),
                data.get('start_date', ''),
                data.get('end_date', ''),
                data.get('verification_status', ''),
                data.get('task_status', ''),
            )


            # Execute the query safely
            with connection.cursor() as cursor:
                cursor.execute(query, params)

            # Return success response
            return JsonResponse({'message': 'Task created successfully!', 'task': data}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt


def edit_task(request):
    if request.method == 'POST':
        try:
            # Parse the request body
            data = json.loads(request.body.decode('utf-8'))
            title_name = data.get('globalselectedtitil_for_edit_task_backend', '')  # Old title

            # Debugging: Print received data (Optional)
            print("Received Data:", data)
            print("Old Title Name:", title_name)

            # Check if the task with the given old title, project, and scope already exists
            check_query = """
                SELECT id FROM tracker_project 
                WHERE title = %s AND projects = %s AND scope = %s
            """
            params_check = (title_name, data.get('project', ''), data.get('scope', ''))

            # Execute the check query
            with connection.cursor() as cursor:
                cursor.execute(check_query, params_check)
                result = cursor.fetchone()  # Get the result if it exists

            if result:
                # Task exists, update the existing row with new title and other values
                update_query = """
                    UPDATE tracker_project
                    SET title = %s, `list` = %s, priority = %s, assigned = %s, checker = %s, qc3_checker = %s,
                        `group` = %s, category = %s, start = %s, end = %s, verification_status = %s, task_status = %s
                    WHERE id = %s
                """
                params_update = (
                    data.get('title', ''),  # Update with new title
                    data.get('list', ''),
                    data.get('priority', ''),
                    data.get('assigned_to', ''),
                    data.get('checker', ''),
                    data.get('qc_3_checker', ''),
                    data.get('group', ''),
                    data.get('category', ''),
                    data.get('start_date', ''),
                    data.get('end_date', ''),
                    data.get('verification_status', ''),
                    data.get('task_status', ''),
                    result[0]  # ID of the existing row
                )

                with connection.cursor() as cursor:
                    cursor.execute(update_query, params_update)

                return JsonResponse({'message': 'Task updated successfully!', 'task': data}, status=200)

            else:
                return JsonResponse({'error': 'Task with the given title, project, and scope not found'}, status=404)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


