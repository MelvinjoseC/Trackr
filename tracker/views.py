from datetime import datetime
from django.shortcuts import render
from django.db import connection
import base64
from .models import EmployeeDetails
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import ProjectTacker
from django.db import connection, transaction
import matplotlib

matplotlib.use("Agg")  # Set the backend to avoid GUI errors

import matplotlib.pyplot as plt
import numpy as np
import io
import base64
from django.http import JsonResponse


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
            return JsonResponse(
                {"success": False, "message": "Invalid request format."}
            )

        # Check the credentials in the database
        user = None
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT employee_id, name FROM employee_details WHERE name = %s AND password = %s",
                [username, password],
            )
            user = cursor.fetchone()

        if user:
            # Store employee_id and name in a single variable (as a dictionary)
            global_user_data = {
                "employee_id": user[0],
                "name": user[1],
            }

            # Save user ID in the session for further authentication
            request.session["user_id"] = user[0]
            return JsonResponse({"success": True, "redirect_url": "/task_dashboard/"})
        else:
            return JsonResponse(
                {"success": False, "message": "Invalid username or password."}
            )

    return render(request, "signin.html")

def get_admins(request):
    admins = EmployeeDetails.objects.filter(authentication__iexact='admin')  # Case-insensitive check
    admin_list = [{"id": admin.employee_id, "name": admin.name} for admin in admins]
    return JsonResponse({"admins": admin_list})

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
                "SELECT designation, image FROM employee_details WHERE employee_id = %s",
                [user_id],
            )
            result = cursor.fetchone()
            if result:
                designation = result[0]
                image_data = result[1]
                if image_data:
                    # Convert binary image data to Base64
                    image_base64 = base64.b64encode(image_data).decode("utf-8")

    # Pass data to the template
    return render(
        request,
        "tasks_dashboard.html",
        {
            "name": name,
            "designation": designation,
            "image_base64": image_base64,  # Base64-encoded image string
            "employee_id": user_id,  # Pass employee_id to the template
        },
    )


def convert_bytes_safe(data):
    """Convert bytes to strings where possible, handle non-UTF-8 bytes gracefully."""
    if isinstance(data, bytes):
        try:
            # Try decoding as UTF-8
            return data.decode("utf-8")
        except UnicodeDecodeError:
            # If decoding fails, return a placeholder or handle it differently
            return f"[binary data: {len(data)} bytes]"  # Or return None to ignore it

    if isinstance(data, dict):
        return {key: convert_bytes_safe(value) for key, value in data.items()}
    if isinstance(data, list):
        return [convert_bytes_safe(item) for item in data]
    return data


def task_dashboard_api(request):
    # Initialize lists to store tasks and employee details
    task_list = []
    employee_details = []
    project_statuses = []  # Default empty list for statuses

    # Retrieve global_user_data (assuming it's stored in session)
    global_user_data
    if global_user_data:
        # Fetch only statuses where sender_name matches global_user_data
        project_statuses = list(
            ProjectTacker.objects.filter(sender_name=global_user_data).values_list(
                "status", flat=True
            )
        )

    try:
        with connection.cursor() as cursor:
            # Fetch all tracker tasks
            cursor.execute("SELECT * FROM tracker_project")
            task_columns = [col[0] for col in cursor.description]
            tasks = cursor.fetchall()
            task_list = [dict(zip(task_columns, task)) for task in tasks]

            # Fetch all employee details
            cursor.execute("SELECT * FROM employee_details")
            employee_columns = [col[0] for col in cursor.description]
            employees = cursor.fetchall()
            employee_details = [dict(zip(employee_columns, emp)) for emp in employees]
            employee_details = convert_bytes_safe(employee_details)

    except Exception as e:
        return JsonResponse(
            {"success": False, "message": f"Error fetching data: {str(e)}"}
        )

    # Return a single JSON response with all required data
    return JsonResponse(
        {
            "success": request.user.is_authenticated,
            "message": (
                "Authentication required"
                if not request.user.is_authenticated
                else "Data fetched successfully"
            ),
            "status_list": project_statuses,
            "tasks": task_list,
            "employee_details": employee_details,
        }
    )


def sign_up(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")
        except json.JSONDecodeError:
            return JsonResponse(
                {"success": False, "message": "Invalid request format."}
            )

        if not username or not password:
            return JsonResponse(
                {
                    "success": False,
                    "message": "Both username and password are required.",
                }
            )

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT authentication FROM employee_details WHERE name = %s AND password = %s",
                [username, password],
            )
            result = cursor.fetchone()

        if result:
            designation = result[0]
            if designation.lower() == "admin":
                return render(
                    request, "employee_form.html"
                )  # Render the HTML form for admin users
            else:
                return JsonResponse(
                    {
                        "success": False,
                        "message": "Only admin users are allowed to sign up.",
                    }
                )
        else:
            return JsonResponse(
                {"success": False, "message": "Invalid username or password."}
            )

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

        return JsonResponse(
            {"success": True, "name": employee.name}
        )  # Respond with success
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
            datetime.strptime(selected_date_str, "%Y-%m-%d").date()
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
            cursor.execute(
                """
                SELECT 
                    id, title, scope, date, time, assigned, category, projects, 
                    list, rev, comments, benchmark, d_no, mail_no, ref_no, created, updated, verification_status, task_status,
                FROM tasktracker.tracker_monthlycalendar
                WHERE date = %s
            """,
                [selected_date],
            )
            rows = cursor.fetchall()
            monthly_calendar_data = [
                {
                    "id": row[0],
                    "title": row[1],
                    "scope": row[2],
                    "date": row[3],
                    "time": row[4],
                    "assigned": row[5],
                    "category": row[6],
                    "project": row[7],
                    "list": row[8],
                    "rev_no": row[9],
                    "comments": row[10],
                    "benchmark": row[11],
                    "d_no": row[12],
                    "mail_no": row[13],
                    "ref_no": row[14],
                    "created": row[15],
                    "updated": row[16],
                    "verification_status": row[17],
                    "task_status": row[18],
                }
                for row in rows
            ]
    except Exception as e:
        print(f"Error fetching monthly calendar data: {e}")

    return {
        "designation": designation,
        "selected_date": selected_date,
        "monthly_calendar_data": monthly_calendar_data,
    }


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
    if request.method == "POST":
        try:
            # Parse the request body
            data = json.loads(request.body.decode("utf-8"))

            # Debugging: Print received data (Optional)
            print("Received Data:", data)

            # SQL query to insert data into tracker_project
            query = """
                INSERT INTO tracker_project
                (title, `list`, projects, scope, priority, assigned, checker, qc3_checker, category, start, end, verification_status, task_status, d_no, rev)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            params = (
                data.get("title", ""),  # Provide default empty string if None
                data.get("list", ""),  # `list` is escaped with backticks
                data.get("project", ""),
                data.get("scope", ""),
                data.get("priority", ""),
                data.get("assigned_to", ""),
                data.get("checker", ""),
                data.get("qc_3_checker", ""),
                data.get("category", ""),
                data.get("start_date", ""),
                data.get("end_date", ""),
                data.get("verification_status", ""),
                data.get("task_status", ""),
                data.get("d_no", ""),
                data.get("rev_no", ""),
            )

            # Execute the query safely
            with connection.cursor() as cursor:
                cursor.execute(query, params)

            # Return success response
            return JsonResponse(
                {"message": "Task created successfully!", "task": data}, status=201
            )

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from datetime import datetime
from .models import ProjectTacker


@csrf_exempt
def aproove_task(request):
    if request.method == "POST":
        try:
            # Parse JSON data
            data = json.loads(request.body)

            # Debugging: Print received JSON data
            print("Received Data:", data)

            # Validate approver_name
            approver_name = data.get("approver_name")
            if not approver_name or not isinstance(approver_name, str):
                return JsonResponse(
                    {"error": "Invalid or missing approver_name."}, status=400
                )

            # Validate required fields
            required_fields = ["title", "project"]
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                return JsonResponse(
                    {"error": f'Missing required fields: {", ".join(missing_fields)}'},
                    status=400,
                )

            # Extract task title
            task_title = data.get("title")

            # Validate and format dates
            start_date = data.get("start_date")
            end_date = data.get("end_date")

            try:
                if start_date:
                    start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
                if end_date:
                    end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
            except ValueError:
                return JsonResponse(
                    {"error": "Invalid date format. Use YYYY-MM-DD."}, status=400
                )

            # Convert dates to strings for JSON serialization
            task_details = {
                "task_title": task_title,
                "project": data.get("project"),
                "scope": data.get("scope"),
                "priority": data.get("priority"),
                "assigned_to": data.get("assigned_to"),
                "checker": data.get("checker"),
                "qc_3_checker": data.get("qc_3_checker"),
                "category": data.get("category"),
                "start_date": start_date.strftime("%Y-%m-%d") if start_date else None,
                "end_date": end_date.strftime("%Y-%m-%d") if end_date else None,
                "verification_status": data.get("verification_status"),
                "task_status": data.get("task_status"),
                "rev_no": data.get("rev_no"),
                "d_no": data.get("d_no"),
            }

            # Save task details to the database
            project_tacker_entry = ProjectTacker.objects.create(
                name=approver_name,
                to_aproove=task_details,
                status="Pending",
                sender_name=global_user_data,
            )

            return JsonResponse(
                {
                    "message": "Task created successfully!",
                    "project_tacker_id": project_tacker_entry.id,
                },
                status=201,
            )

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)
        except Exception as e:
            # Log the error for debugging purposes
            print("Error:", str(e))
            return JsonResponse(
                {"error": f"Internal server error: {str(e)}"}, status=500
            )

    return JsonResponse({"error": "Invalid HTTP method"}, status=405)


@csrf_exempt
def edit_task(request):
    if request.method == "POST":
        try:
            # Parse the request body
            data = json.loads(request.body.decode("utf-8"))
            title_name = data.get(
                "globalselectedtitil_for_edit_task_backend", ""
            )  # Old title

            # Check if the task with the given old title, project, and scope already exists
            check_query = """
                SELECT id FROM tracker_project 
                WHERE title = %s AND projects = %s AND scope = %s
            """
            params_check = (title_name, data.get("project", ""), data.get("scope", ""))

            # Execute the check query
            with connection.cursor() as cursor:
                cursor.execute(check_query, params_check)
                result = cursor.fetchone()  # Get the result if it exists

            if result:
                # Task exists, update the existing row with new title and other values
                update_query = """
                    UPDATE tracker_project
                    SET title = %s, `list` = %s, priority = %s, assigned = %s, checker = %s, qc3_checker = %s,
                     category = %s, start = %s, end = %s, verification_status = %s, task_status = %s
                    WHERE id = %s
                """
                params_update = (
                    data.get("title", ""),  # Update with new title
                    data.get("list", ""),
                    data.get("priority", ""),
                    data.get("assigned_to", ""),
                    data.get("checker", ""),
                    data.get("qc_3_checker", ""),
                    data.get("category", ""),
                    data.get("start_date", ""),
                    data.get("end_date", ""),
                    data.get("verification_status", ""),
                    data.get("task_status", ""),
                    result[0],  # ID of the existing row
                )

                with connection.cursor() as cursor:
                    cursor.execute(update_query, params_update)

                return JsonResponse(
                    {"message": "Task updated successfully!", "task": data}, status=200
                )

            else:
                return JsonResponse(
                    {
                        "error": "Task with the given title, project, and scope not found"
                    },
                    status=404,
                )

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def submit_timesheet(request):
    if request.method == "POST":
        try:
            # Parse the request body
            data = json.loads(request.body.decode("utf-8"))

            department = data.get("list", "")
            project_type = data.get("project_type", "")
            scope = data.get("scope", "")
            task = data.get("task", "")
            phase = data.get("phase", "")
            date1 = data.get("date1", "")
            time = data.get("time", 0)
            comments = data.get("comments", "")

            # Assume assigned user is coming from global_user_data['name']
            assigned = global_user_data.get("name", "Unassigned")

            # Check if a record exists with the same task
            select_query = """
                SELECT * FROM tracker_project 
                WHERE `list` = %s AND projects = %s AND scope = %s 
                AND title = %s AND category = %s 
                ORDER BY id DESC LIMIT 1
            """
            with connection.cursor() as cursor:
                cursor.execute(
                    select_query, [department, project_type, scope, task, phase]
                )
                result = cursor.fetchone()
                columns = [col[0] for col in cursor.description]  # Get column names

            if result:
                existing_row = dict(
                    zip(columns, result)
                )  # Convert the result to a dictionary

                if existing_row["date1"] is None:
                    # If date1 is NULL, update the existing row
                    update_query = """
                        UPDATE tracker_project 
                        SET date1 = %s, time = %s, comments = %s, assigned = %s 
                        WHERE id = %s
                    """
                    with connection.cursor() as cursor:
                        cursor.execute(
                            update_query,
                            [date1, time, comments, assigned, existing_row["id"]],
                        )
                    return JsonResponse(
                        {
                            "message": "Timesheet entry updated successfully (existing row)."
                        },
                        status=200,
                    )

                else:
                    # If date1 is NOT NULL, copy values from the existing row and insert a new row
                    insert_query = """
                        INSERT INTO tracker_project (title, `list`, projects, scope, category, date1, time, comments, 
                                                     priority, checker, qc3_checker, `group`, start, end, 
                                                     verification_status, assigned, d_no, rev) 
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """
                    with transaction.atomic():
                        with connection.cursor() as cursor:
                            cursor.execute(
                                insert_query,
                                [
                                    existing_row["title"],
                                    existing_row["list"],
                                    existing_row["projects"],
                                    existing_row["scope"],
                                    existing_row["category"],
                                    date1,
                                    time,
                                    comments,
                                    existing_row["priority"],
                                    existing_row["checker"],
                                    existing_row["qc3_checker"],
                                    existing_row["group"],
                                    existing_row["start"],
                                    existing_row["end"],
                                    existing_row["verification_status"],
                                    assigned,
                                    existing_row["d_no"],
                                    existing_row["rev"],
                                ],
                            )
                    return JsonResponse(
                        {
                            "message": "New timesheet entry created successfully (with copied values)."
                        },
                        status=201,
                    )

            else:
                # If no matching record is found, insert a new row with default values
                insert_query = """
                    INSERT INTO tracker_project (title, `list`, projects, scope, category, date1, time, comments, 
                                                 priority, checker, qc3_checker, `group`, start, end, 
                                                 verification_status, assigned, d_no, rev) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                with transaction.atomic():
                    with connection.cursor() as cursor:
                        cursor.execute(
                            insert_query,
                            [
                                task,
                                department,
                                project_type,
                                scope,
                                phase,
                                date1,
                                time,
                                comments,
                                "Medium",
                                "Unassigned",
                                "Unassigned",
                                "Default Group",
                                "1970-01-01",
                                "1970-01-01",
                                False,
                                assigned,
                                0,
                                "0.0",
                            ],
                        )
                return JsonResponse(
                    {
                        "message": "New timesheet entry created successfully (default values)."
                    },
                    status=201,
                )

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)


def generate_pie_chart(request):
    # Data for the pie chart
    values = [2, 6, 8, 12]  # The numbers outside the chart
    colors = [
        "#EEF3FF",
        "#DAE6FB",
        "#A5BDF1",
        "#6389DA",
    ]  # Colors corresponding to values

    # Create figure
    fig, ax = plt.subplots(figsize=(5, 5))

    # Generate pie chart without white separators
    wedges, texts, autotexts = ax.pie(
        values,
        labels=values,
        autopct="",
        colors=colors,
        startangle=140,
        wedgeprops={"linewidth": 0},  # Removes white separator lines
        pctdistance=0.85,
    )

    # Draw a circle in the center to make it a donut chart
    center_circle = plt.Circle((0, 0), 0.60, fc="white")
    fig.gca().add_artist(center_circle)

    # Adjust labels (font size & color)
    for text in texts:
        text.set_fontsize(13)
        text.set_color("#484848")  # Set font color

    # Set aspect ratio
    ax.set_aspect("equal")

    # Save the figure into a BytesIO object instead of saving it to a file
    buffer = io.BytesIO()
    plt.savefig(buffer, format="png", bbox_inches="tight")
    buffer.seek(0)

    # Encode the image to base64
    image_base64 = base64.b64encode(buffer.getvalue()).decode()

    # Close the plot to free memory
    plt.close()

    # Return the base64 image as JSON
    return JsonResponse({"image_base64": f"data:image/png;base64,{image_base64}"})


@csrf_exempt  # Use if you do not want to handle CSRF manually; otherwise, pass the token from the template
def project_tracker(request):
    global global_user_data

    # Fetch the row from ProjectTacker where name matches global_user_data['name']
    project_data = ProjectTacker.objects.filter(name=global_user_data["name"]).first()

    # If project_data exists, load the to_aproove JSON as a Python dictionary
    to_approve_data = project_data.to_aproove if project_data else []

    context = {
        "user_data": global_user_data,
        "project_data": project_data,
        "to_approve_data": to_approve_data,  # Pass JSON data to the template
    }

    return render(request, "project_tracker.html", context)


@csrf_exempt  # Required if CSRF protection is enabled
def task_action(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            task_data = data.get("task_data")  # Task data being passed
            action = data.get("action")  # Action: 'accept' or 'reject'

            # Find the ProjectTacker record by name (or any other unique identifier you are using)
            project_tracker = ProjectTacker.objects.filter(
                name=task_data.get("name")
            ).first()

            if project_tracker:
                # Update the status based on the action
                if action == "accept":
                    project_tracker.status = "Accepted"
                elif action == "reject":
                    project_tracker.status = "Rejected"
                else:
                    return JsonResponse(
                        {"success": False, "message": "Invalid action specified."}
                    )

                # Save the updated status in the database
                project_tracker.save()

                return JsonResponse(
                    {"success": True, "message": f"Task has been {action}ed."}
                )
            else:
                return JsonResponse(
                    {"success": False, "message": "Project task not found."}
                )

        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Invalid JSON format."})

    return JsonResponse({"success": False, "message": "Invalid request method."})


def notifications_view(request):
    return render(request, "notifications.html")


from django.core.exceptions import ObjectDoesNotExist


@csrf_exempt
def check_task_status(request):
    global global_user_data  # Use global variable

    if request.method == "POST":
        try:
            # Fetch all records where sender_name matches global_user_data['name']
            if not global_user_data:
                return JsonResponse(
                    {"status": None, "message": "User not authenticated"}, status=401
                )

            sender_name = global_user_data.get("name")

            projects = ProjectTacker.objects.filter(sender_name__icontains=sender_name)

            if not projects.exists():
                return JsonResponse(
                    {"status": None, "message": "No projects found for sender"},
                    status=404,
                )

            approved_rejected_projects = []

            for project in projects:
                # Convert to_aproove JSONField to a Python dictionary
                to_aprove_data = (
                    json.loads(project.to_aproove)
                    if isinstance(project.to_aproove, str)
                    else project.to_aproove
                )

                if project.status in ["Accepted", "Rejected", "Pending"]:
                    approved_rejected_projects.append(
                        {
                            "status": project.status,
                            "project": to_aprove_data.get("project", "Unknown Project"),
                        }
                    )

            return JsonResponse({"projects": approved_rejected_projects})

        except json.JSONDecodeError:
            return JsonResponse(
                {"status": None, "message": "Invalid JSON format"}, status=400
            )
        except Exception as e:
            return JsonResponse(
                {"status": None, "message": f"Internal server error: {str(e)}"},
                status=500,
            )

    return JsonResponse(
        {"status": None, "message": "Invalid request method"}, status=405
    )


def attendance_calendar(request):
    return render(request, "calendar.html")
    return JsonResponse({"status": None, "message": "Invalid request method"}, status=405)


from django.http import JsonResponse
from django.db import connection

def get_times_by_date(request):
    if request.method == 'GET':
        # Get the date1 parameter from the GET request
        date1 = request.GET.get('date1', None)
        
        if not date1:
            return JsonResponse({'error': 'date1 parameter is required'}, status=400)
        
        try:
            # Fetch rows matching the provided date1
            select_query = """
                SELECT id, title, `list`, projects, scope, category, date1, time, comments, assigned
                FROM tracker_project 
                WHERE date1 = %s
                ORDER BY id ASC
            """
            with connection.cursor() as cursor:
                cursor.execute(select_query, [date1])
                rows = cursor.fetchall()
                columns = [col[0] for col in cursor.description]
            
            # Convert the query result to a list of dictionaries
            timesheet_entries = [dict(zip(columns, row)) for row in rows]

            # Return the results as a JSON response
            return JsonResponse({'timesheet_entries': timesheet_entries}, status=200)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


def get_all_times_by_month(request):
    year = request.GET.get('year')
    month = request.GET.get('month')

    if not year or not month:
        return JsonResponse({'error': 'Year and month parameters are required'}, status=400)

    try:
        # Query to get entries for the given year and month
        query = """
            SELECT id, title, date1, time, projects, scope ,comments, assigned
            FROM tracker_project 
            WHERE YEAR(date1) = %s AND MONTH(date1) = %s
        """
        with connection.cursor() as cursor:
            cursor.execute(query, [year, month])
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]

        # Convert query result to a list of dictionaries
        timesheet_entries = [dict(zip(columns, row)) for row in rows]

        return JsonResponse({'timesheet_entries': timesheet_entries}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



from django.http import JsonResponse
from django.db import connection

def get_tasks_by_date(request):
    date1 = request.GET.get('date1')

    if not date1:
        return JsonResponse({'error': 'date1 parameter is required'}, status=400)

    try:
        query = """
            SELECT id, title, projects, scope, date1, time, comments 
            FROM tracker_project 
            WHERE date1 = %s
        """
        with connection.cursor() as cursor:
            cursor.execute(query, [date1])
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]

        tasks = [dict(zip(columns, row)) for row in rows]
        return JsonResponse({'tasks': tasks}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection
from datetime import datetime

def create_project_view(request):
    if request.method == "POST":
        try:
            project_name = request.POST.get("projectName")
            start_date = request.POST.get("startDate")
            end_date = request.POST.get("endDate")
            scope = request.POST.get("scope")
            category = request.POST.get("category")
            benchmark = request.POST.get("Benchmark")

            # Ensure all fields are filled
            if not all([project_name, start_date, end_date, scope, category, benchmark]):
                return JsonResponse({"error": "All fields are required!"}, status=400)

            # Insert into the database
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO tracker_project (projects, scope, category, task_benchmark, start, end)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, [project_name, scope, category, benchmark, start_date, end_date])

            return JsonResponse({"message": "Project Created Successfully!"})

        except Exception as e:
            print("Database Error:", e)  # Log the error for debugging
            return JsonResponse({"error": "Something went wrong. Please try again later."}, status=500)

    return render(request, "project_tracker.html")  # Load the form page

from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection
from datetime import datetime

global_user_data = None  # Store the logged-in user's details globally

def apply_leave_view(request):
    global global_user_data  # Retrieve logged-in user data

    if request.method == "POST":
        try:
            if not global_user_data:
                return JsonResponse({"error": "User not logged in."}, status=401)

            # ✅ Get the logged-in user's name from global_user_data
            current_user_name = global_user_data["name"]
            current_user_id = global_user_data["employee_id"]

            # ✅ Fetch form data (sent from JavaScript)
            start_date = request.POST.get("from_date", "").strip()
            end_date = request.POST.get("to_date", "").strip()
            leave_type = request.POST.get("leave-type", "").strip()
            reason = request.POST.get("reason", "").strip()
            approver = request.POST.get("approver", "").strip()  # ✅ Now storing the name

            status = "Pending"  # Default status

            # ✅ Debugging: Print received values
            print(f"Received Data - Start: {start_date}, End: {end_date}, Type: {leave_type}, Reason: {reason}, Approver: {approver}")

            # ✅ Validate required fields
            if not all([start_date, end_date, leave_type, reason, approver]):
                return JsonResponse({"error": "All fields are required!"}, status=400)

            created_at = updated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            # ✅ Insert leave request into the database
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO tracker_leaveapplication 
                    (start_date, end_date, reason, username, approver, leave_type, created_at, updated_at, status) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, [start_date, end_date, reason, current_user_name, approver, leave_type, created_at, updated_at, status])

            return JsonResponse({"message": "Leave request submitted successfully!"})

        except Exception as e:
            print("Database Error:", e)
            return JsonResponse({"error": "Something went wrong. Please try again later."}, status=500)


from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection
from datetime import datetime

def get_holidays(request):
    """Fetch upcoming holidays only for the current year, excluding Saturdays."""
    try:
        today = datetime.today().date()
        current_year = today.year  # Get current year dynamically

        with connection.cursor() as cursor:
            # ✅ Get holidays for the current year, excluding Saturdays
            cursor.execute("""
                SELECT name, date 
                FROM tracker_holiday 
                WHERE YEAR(date) = %s AND DAYOFWEEK(date) != 7  
                ORDER BY date ASC
            """, [current_year])
            holidays = cursor.fetchall()

        # Convert holidays to JSON format with status
        holiday_list = []
        for row in holidays:
            holiday_date = row[1]
            status = "past" if holiday_date < today else "upcoming"

            holiday_list.append({
                "name": row[0],
                "date": holiday_date.strftime("%Y-%m-%d"),
                "status": status  # ✅ Add status for styling in JS
            })

        return JsonResponse({"holidays": holiday_list})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)



from django.http import JsonResponse
from django.db import connection

# Define a global variable
global_user_data = None
def leave_application_view(request):
    global global_user_data  # Declare the global variable
    if not global_user_data:
        return JsonResponse({"error": "User not logged in."}, status=401)

    current_user_name = global_user_data["name"]  # Get logged-in user's name

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT id, start_date, end_date, reason, username, approver, leave_type, created_at, updated_at, status
            FROM tracker_leaveapplication
            WHERE username = %s
        """, [current_user_name])  # Filter by logged-in user's username

        columns = [col[0] for col in cursor.description]
        data = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return JsonResponse(data, safe=False)


from django.http import JsonResponse
from django.db import connection

global_user_data = None  # Assume this holds the logged-in user's data


def leave_approvals_view(request):
    global global_user_data
    if not global_user_data:
        return JsonResponse({"error": "User not logged in."}, status=401)

    # Ensure the logged-in user is an admin
    is_admin = EmployeeDetails.objects.filter(
        name=global_user_data["name"], authentication__iexact="admin"
    ).exists()

    if not is_admin:
        return JsonResponse({"error": "Forbidden: Only admins can access this."}, status=403)

    # Fetch only pending leave approvals
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT id, start_date, end_date, reason, username, approver, leave_type, created_at, updated_at, status
            FROM tracker_leaveapplication
            WHERE status = 'Pending'
        """)  

        columns = [col[0] for col in cursor.description]
        data = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return JsonResponse(data, safe=False)



from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json

@csrf_exempt  # ✅ Temporarily bypass CSRF for debugging (Remove this in production)
def update_leave_status(request):
    print("🔍 CSRF Token Received:", request.META.get("HTTP_X_CSRFTOKEN"))  # ✅ Debugging

    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method. Only POST is allowed."}, status=405)

    try:
        data = json.loads(request.body)
        leave_id = data.get("id")
        new_status = data.get("status")

        print("🔍 Received Data:", data)  # ✅ Debugging

        # Validate input data
        if leave_id is None or new_status is None:
            return JsonResponse({"error": "Missing required fields: 'id' and 'status' are needed."}, status=400)

       

        # Update the database
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE tracker_leaveapplication
                SET status = %s
                WHERE id = %s
                """,
                [new_status, leave_id]
            )

        print(f"✅ Leave ID {leave_id} updated to {new_status}")  # ✅ Debugging
        return JsonResponse({"message": f"Leave status successfully updated to {new_status}."})

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data. Ensure the request body is properly formatted."}, status=400)

    except Exception as e:
        print("❌ Unexpected Error:", str(e))  # ✅ Debugging
        return JsonResponse({"error": f"Internal Server Error: {str(e)}"}, status=500)


from django.http import JsonResponse

def check_admin_status(request):
    global global_user_data
    # Check if the logged-in user is an admin
    is_admin = EmployeeDetails.objects.filter(
        name=global_user_data["name"], authentication__iexact="admin"
    ).exists()

    return JsonResponse({"is_admin": is_admin})


from django.http import JsonResponse
from django.db import connection
import json

def update_task(request, task_id):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            title = data.get("title")
            projects = data.get("projects")
            scope = data.get("scope")
            date1 = data.get("date1")
            time = data.get("time")
            comments = data.get("comments")

            query = """
                UPDATE tracker_project 
                SET title = %s, projects = %s, scope = %s, date1 = %s, time = %s, comments = %s 
                WHERE id = %s
            """
            with connection.cursor() as cursor:
                cursor.execute(query, [title, projects, scope, date1, time, comments, task_id])

            return JsonResponse({"success": True}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)


def delete_task(request, task_id):
    if request.method == "POST":
        try:
            query = "DELETE FROM tracker_project WHERE id = %s"
            with connection.cursor() as cursor:
                cursor.execute(query, [task_id])

            return JsonResponse({"success": True}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)
