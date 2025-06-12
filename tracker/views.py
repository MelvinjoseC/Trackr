import calendar
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


from django.http import JsonResponse
from .models import EmployeeDetails  # Import the EmployeeDetails model
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
            return JsonResponse(
                {"success": False, "message": "Invalid request format."}
            )

        # Use Django ORM to check the credentials in the database
        user = EmployeeDetails.objects.filter(name=username, password=password).first()

        if user:
            # Store employee_id and name in a global variable
            global_user_data = {
                "employee_id": user.employee_id,
                "name": user.name,
            }

            # Save user ID in the session for further authentication
            request.session["user_id"] = user.employee_id
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

from django.shortcuts import render
from .models import EmployeeDetails  # Import the EmployeeDetails model
import base64

# Assuming global_user_data is set earlier
global_user_data = None

def task_dashboard(request):
    global global_user_data  # Assuming you're using a global variable for user data

    # Default data
    user_id = global_user_data.get("employee_id", None)
    name = global_user_data.get("name", "Guest")
    designation = global_user_data.get("designation", "NO DESIGNATION")
    image_base64 = None

    if user_id:
        # Use Django ORM to fetch designation and image from the database
        try:
            employee = EmployeeDetails.objects.get(employee_id=user_id)

            # Update designation
            designation = employee.designation

            # If the image exists, convert it to Base64
            if employee.image:
                image_base64 = base64.b64encode(employee.image).decode("utf-8")

        except EmployeeDetails.DoesNotExist:
            # Handle the case where the employee does not exist
            designation = "Employee not found"
    
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

from .models import TrackerTasks
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
            employees = EmployeeDetails.objects.all()
            employee_columns = [field.name for field in EmployeeDetails._meta.fields]
            employee_details = [dict(zip(employee_columns, [getattr(emp, field) for field in employee_columns])) for emp in employees]
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
                    list, rev, comments, benchmark, d_no, mail_no, ref_no, created, updated, verification_status, task_status, team, 
                FROM tasktracker.tracker_project
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
                    "team":row[19],
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


from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.utils.dateparse import parse_date
from tracker.models import TrackerTasks
import json

@csrf_exempt
def create_task(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))
            print("Received Data:", data)

            # Handle optional numeric field
            benchmark_raw = data.get("task_benchmark", "")
            try:
                task_benchmark = float(benchmark_raw) if benchmark_raw.strip() else None
            except ValueError:
                # If not a valid number, treat it as None without raising error
                task_benchmark = None

            task = TrackerTasks.objects.create(
                title=data.get("title", ""),
                list=data.get("list", ""),
                projects=data.get("project", ""),
                scope=data.get("scope", ""),
                priority=data.get("priority", "Medium"),
                assigned=data.get("assigned_to", ""),
                checker=data.get("checker", ""),
                qc3_checker=data.get("qc_3_checker", ""),
                category=data.get("category", ""),
                start=parse_date(data.get("start_date")) if data.get("start_date") else None,
                end=parse_date(data.get("end_date")) if data.get("end_date") else None,
                verification_status=data.get("verification_status", ""),
                task_status=data.get("task_status", ""),
                d_no=data.get("d_no", ""),
                rev=data.get("rev_no", ""),
                team=data.get("team", ""),
                task_benchmark=task_benchmark
            )

            return JsonResponse({"message": "Task created successfully!", "task_id": task.id}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            import traceback
            traceback.print_exc()
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
                "team": data.get("team"),
                "task_title": task_title,
                "project": data.get("project"),
                "scope": data.get("scope"),
                "priority": data.get("priority"),
                "task_benchmark":data.get("task_benchmark"),
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




from django.views.decorators.csrf import csrf_protect
from django.http import JsonResponse
from django.utils.dateparse import parse_date
from tracker.models import TrackerTasks
import json

@csrf_exempt
def edit_task(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))

            old_title = data.get("globalselectedtitil_for_edit_task_backend", "")
            old_project = data.get("project", "")
            old_scope = data.get("scope", "")

            try:
               task = TrackerTasks.objects.get(title=old_title, projects=old_project, scope=old_scope)
            except TrackerTasks.DoesNotExist:
                return JsonResponse({"error": "Task with the given title, project, and scope not found"}, status=404)

            benchmark_raw = data.get("task_benchmark", "")
            try:
                task_benchmark = float(benchmark_raw) if benchmark_raw.strip() else None
            except ValueError:
                task_benchmark = None

            task.title = data.get("title", "")
            task.list = data.get("list", "")
            task.priority = data.get("priority", "")
            task.assigned = data.get("assigned_to", "")
            task.checker = data.get("checker", "")
            task.qc3_checker = data.get("qc_3_checker", "")
            task.category = data.get("category", "")
            task.start = parse_date(data.get("start_date")) if data.get("start_date") else None
            task.end = parse_date(data.get("end_date")) if data.get("end_date") else None
            task.verification_status = data.get("verification_status", "")
            task.task_status = data.get("task_status", "")
            task.rev = data.get("rev_no", "")
            task.d_no = data.get("d_no", "")
            task.task_benchmark = task_benchmark

            # Handle phase benchmarks
            phase_benchmarks = [
                'phase_1_benchmark', 'phase_2_benchmark', 'phase_3_benchmark', 'phase_4_benchmark',
                'phase_5_benchmark', 'phase_6_benchmark', 'phase_7_benchmark', 'phase_8_benchmark',
                'phase_9_benchmark', 'phase_10_benchmark'
            ]
            for phase in phase_benchmarks:
                benchmark_value = data.get(phase, "")
                try:
                    if benchmark_value.strip():
                        task.__setattr__(phase, float(benchmark_value))
                    else:
                        task.__setattr__(phase, None)
                except ValueError:
                    task.__setattr__(phase, None)

            task.save()

            return JsonResponse({"message": "Task updated successfully!", "task": data}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from tracker.models import TrackerTasks  # Use correct import if your model is elsewhere

@csrf_exempt
def get_task_by_title_project_scope(request):
    if request.method == "GET":
        title = request.GET.get("title")
        project = request.GET.get("project")
        scope = request.GET.get("scope")

        if not (title and project and scope):
            return JsonResponse({"error": "Missing title, project, or scope"}, status=400)

        try:
            task = TrackerTasks.objects.get(title=title, projects=project, scope=scope)

            return JsonResponse({
                "title": task.title,
                "list": task.list,
                "project": task.projects,
                "scope": task.scope,
                "priority": task.priority,
                "assigned_to": task.assigned,
                "checker": task.checker,
                "qc_3_checker": task.qc3_checker,
                "category": task.category,
                "start_date": task.start.isoformat() if task.start else '',
                "end_date": task.end.isoformat() if task.end else '',
                "verification_status": task.verification_status,
                "task_status": task.task_status,
                "rev_no": task.rev,
                "d_no": task.d_no,
                "task_benchmark": task.task_benchmark
            })

        except TrackerTasks.DoesNotExist:
            return JsonResponse({"error": "Task not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def submit_timesheet(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))

            department = data.get("list", "")
            project_type = data.get("project_type", "")
            scope = data.get("scope", "")
            task = data.get("task", "")
            phase = data.get("phase", "")
            date1 = data.get("date1", "")
            time = data.get("time", 0)
            comments = data.get("comments", "")

            assigned = global_user_data.get("name", "Unassigned")

            select_query = """
                SELECT * FROM tracker_project 
                WHERE `list` = %s AND projects = %s AND scope = %s 
                AND title = %s AND category = %s 
                ORDER BY id DESC LIMIT 1
            """
            with connection.cursor() as cursor:
                cursor.execute(select_query, [department, project_type, scope, task, phase])
                result = cursor.fetchone()
                columns = [col[0] for col in cursor.description]

            if result:
                existing_row = dict(zip(columns, result))
                team_value = existing_row.get("team", "")

                if existing_row["date1"] is None:
                    update_query = """
                        UPDATE tracker_project 
                        SET date1 = %s, time = %s, comments = %s, assigned = %s, team = %s 
                        WHERE id = %s
                    """
                    with connection.cursor() as cursor:
                        cursor.execute(
                            update_query,
                            [date1, time, comments, assigned, team_value, existing_row["id"]],
                        )
                    return JsonResponse(
                        {"message": "Timesheet entry updated successfully (existing row)."},
                        status=200,
                    )

                else:
                    insert_query = """
                        INSERT INTO tracker_project (title, `list`, projects, scope, category, date1, time, comments, 
                                                     priority, checker, qc3_checker, `group`, start, end, 
                                                     verification_status, assigned, d_no, rev, team) 
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
                                    team_value,
                                ],
                            )
                    return JsonResponse(
                        {"message": "New timesheet entry created successfully (with copied values)."},
                        status=201,
                    )

            else:
                insert_query = """
                    INSERT INTO tracker_project (title, `list`, projects, scope, category, date1, time, comments, 
                                                 priority, checker, qc3_checker, `group`, start, end, 
                                                 verification_status, assigned, d_no, rev, team) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
                                "",
                                "Unassigned",
                                "",
                                "",
                                "",
                                "",
                                False,
                                assigned,
                                0,
                                "0.0",
                                "",  # Default/empty team for new insert
                            ],
                        )
                return JsonResponse(
                    {"message": "New timesheet entry created successfully."},
                    status=201,
                )

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)


from django.http import JsonResponse
from django.db.models import Count, F
from .models import LeaveApplication, Attendance

# Global User Data
global_user_data = None

def generate_pie_chart(request):
    global global_user_data

    # ✅ Ensure user is logged in
    if not global_user_data:
        return JsonResponse({"error": "User not logged in."}, status=401)

    username = global_user_data.get("name")  # Get username from global user data

    try:
        # ✅ Fetch Leave Data using ORM
        leave_data = LeaveApplication.objects.filter(
            username=username, status='Approved'
        ).values(
            'leave_type'
        ).annotate(
            count=Count('id')
        )

        # Initialize leave counts
        full_day_leave = 0
        half_day_leave = 0
        work_from_home = 0

        # Distribute leave counts based on leave_type
        for entry in leave_data:
            if entry['leave_type'] == 'Full Day':
                full_day_leave = entry['count']
            elif entry['leave_type'] == 'Half Day':
                half_day_leave = entry['count']
            elif entry['leave_type'] == 'Work From Home':
                work_from_home = entry['count']

        # ✅ Fetch Attendance Data (Redeemed Leaves) using ORM
        redeemed_days = Attendance.objects.filter(
            username=username, redeemed=1
        ).count()

        # ✅ Calculate Total Working Days (Base 15 + Redeemed Leaves)
        total_working_days = 15 + redeemed_days

        # ✅ Calculate Balance Leave Available
        balance_leave = total_working_days - (full_day_leave + (half_day_leave * 0.5))

        return JsonResponse({
            "balance_leave": balance_leave,
            "full_day_leave": full_day_leave,
            "half_day_leave": half_day_leave,
            "work_from_home": work_from_home,
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)




from django.shortcuts import render, redirect
from django.db import connection
import base64
from .models import ProjectTacker

global_user_data = None  # Global variable for user data

def project_tracker(request):
    global global_user_data

    # Ensure user is logged in
    if not global_user_data:
        return redirect("login_page")  # Redirect to login if not logged in

    # Fetch user details from global data
    user_id = global_user_data.get("employee_id", None)
    name = global_user_data.get("name", "Guest")
    designation = global_user_data.get("designation", None)
    authentication = global_user_data.get("authentication", None)
    image_base64 = None

    # If designation or authentication is not found, fetch from DB
    if user_id and (not designation or not authentication):
        with connection.cursor() as cursor:
            cursor.execute("SELECT designation, authentication, image FROM employee_details WHERE employee_id = %s", [user_id])
            result = cursor.fetchone()
            if result:
                designation = result[0] if result[0] else "No Designation"
                authentication = result[1] if result[1] else "No Role"
                image_base64 = base64.b64encode(result[2]).decode("utf-8") if result[2] else None

    # Fetch only the records where status is 'Pending'
    project_data = ProjectTacker.objects.filter(status="Pending")

    # Flatten all to_approve JSON data into one list with project info attached
    task_list = []
    for project in project_data:
        to_approve = project.to_aproove
        if to_approve:
            if isinstance(to_approve, dict):
                tasks = [to_approve]
            elif isinstance(to_approve, list):
                tasks = to_approve
            else:
                tasks = []

            for task in tasks:
                task_copy = task.copy()
                task_copy["project_name"] = project.name
                task_copy["sender_name"] = project.sender_name
                task_list.append(task_copy)

    # Determine if user is admin or MD based on the 'authentication' column
    is_admin_or_md = authentication in ['admin', 'MD']

    context = {
        "user_data": global_user_data,
        "task_list": task_list,
        "name": name,
        "designation": designation,  # <-- Now this is included
        "authentication": authentication,
        "image_base64": image_base64,
        "employee_id": user_id,
        "is_admin_or_md": is_admin_or_md  # <-- Pass it here
    }

    return render(request, "project_tracker.html", context)


import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import ProjectTacker, TrackerTasks

@csrf_exempt
def task_action(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "Invalid request method."}, status=405)

    try:
        data = json.loads(request.body)
        task_data = data.get("task_data")
        action = data.get("action")

        if not task_data or "name" not in task_data or "d_no" not in task_data:
            return JsonResponse({"success": False, "message": "Task data or identifiers missing."}, status=400)

        project_tracker = ProjectTacker.objects.filter(name=task_data.get("name")).first()
        if not project_tracker:
            return JsonResponse({"success": False, "message": "Project task not found."}, status=404)

        to_approve_data = project_tracker.to_aproove
        if not to_approve_data:
            return JsonResponse({"success": False, "message": "No tasks to approve."}, status=404)

        task = None
        for t in to_approve_data if isinstance(to_approve_data, list) else [to_approve_data]:
            if t.get("d_no") == task_data.get("d_no"):
                task = t
                break

        if not task:
            return JsonResponse({"success": False, "message": "Task not found in project data."}, status=404)

        if action not in ("accept", "reject"):
            return JsonResponse({"success": False, "message": "Invalid action specified."}, status=400)

        project_tracker.status = "Approved" if action == "accept" else "Rejected"
        project_tracker.save()

        if action == "accept":
            tracker_task, created = TrackerTasks.objects.get_or_create(d_no=task.get("d_no"))

            tracker_task.title = task.get("task_title") or task.get("title")
            tracker_task.d_no = task.get("d_no")
            tracker_task.scope = task.get("scope")
            tracker_task.rev = task.get("rev_no")
            tracker_task.checker = task.get("checker")
            tracker_task.projects = task.get("project")
            tracker_task.category = task.get("category")
            tracker_task.end = task.get("end_date")
            tracker_task.priority = task.get("priority")
            tracker_task.start = task.get("start_date")
            tracker_task.assigned = task.get("assigned_to")
            tracker_task.task_status = task.get("task_status") or "Accepted"
            tracker_task.qc3_checker = task.get("qc_3_checker")
            tracker_task.verification_status = task.get("verification_status", True)
            tracker_task.project_status = "Accepted"

            tracker_task.save()

        return JsonResponse({"success": True, "message": f"Task has been {action}ed."})

    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Invalid JSON format."}, status=400)
    except Exception as e:
        return JsonResponse({"success": False, "message": f"Error: {str(e)}"}, status=500)


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


import base64
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.db import connection

global_user_data = None  # Global variable for user data

def attendance_calendar(request):
    global global_user_data  

    # ✅ Ensure user is logged in
    if not global_user_data:
        return redirect("login_page")  # Redirect to login if not logged in

    # ✅ Fetch user details from global data
    user_id = global_user_data.get("employee_id", None)
    name = global_user_data.get("name", "Guest")
    designation = global_user_data.get("designation", None)  # Try from global data
    role = global_user_data.get("role", "").lower()  # Role should be 'admin' or 'user'
    image_base64 = None

    # ✅ If designation is not found in global data, fetch from DB
    if user_id and not designation:
        with connection.cursor() as cursor:
            cursor.execute("SELECT designation, image FROM employee_details WHERE employee_id = %s", [user_id])
            result = cursor.fetchone()
            if result:
                designation = result[0] if result[0] else "No Designation"  # Handle missing designation
                image_base64 = base64.b64encode(result[1]).decode("utf-8") if result[1] else None

    # ✅ Check if user is Admin or MD
    is_admin_or_md = False
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT authentication FROM employee_details WHERE name = %s
        """, [name])
        auth_result = cursor.fetchone()

        if auth_result:
            auth_value = str(auth_result[0]).strip().lower()
            is_admin_or_md = (auth_value == "admin" or auth_value == "md")

    # ✅ If request is not GET, return JSON response
    if request.method != "GET":
        return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)

    # ✅ Render template with user details and check for Admin or MD
    return render(request, "calendar.html", {
        "name": name,
        "designation": designation or "No Designation",  # Ensure designation is always present
        "image_base64": image_base64,
        "employee_id": user_id,
        "is_admin_or_md": is_admin_or_md,  # Pass Admin or MD status to template
    })


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
                SELECT id, title, `list`, projects, scope, category, date1, time, comments, assigned, rev, d_no,
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
            SELECT id, title, projects, scope, date1, time, comments, rev, d_no,
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
from django.db import models
from datetime import datetime
from django.core.files.storage import default_storage
from .models import EmployeeDetails, Holiday, LeaveApplication
import base64

# Global user data (Assuming this holds logged-in user info)
global_user_data = None  

def mainleavepage_view(request):
    global global_user_data  

    if not global_user_data:
        return JsonResponse({"error": "User not logged in."}, status=401)

    # ✅ Fetch user details from global data
    user_id = global_user_data.get("employee_id", None)
    name = global_user_data.get("name", "Guest")
    designation = global_user_data.get("designation", None)  # Try from global data
    image_base64 = None

    # ✅ If designation is not found in global data, fetch from DB
    if user_id and not designation:
        try:
            employee = EmployeeDetails.objects.get(employee_id=user_id)
            designation = employee.designation if employee.designation else "No Designation"
            
            # Check if image exists and is not None
            if employee.image:
                # Check if it's a file path or a bytes object
                if isinstance(employee.image, bytes):
                    image_base64 = base64.b64encode(employee.image).decode("utf-8")
                else:
                    # If it's an ImageField, get the file path and read it
                    with default_storage.open(employee.image.name, 'rb') as image_file:
                        image_base64 = base64.b64encode(image_file.read()).decode("utf-8")
        except EmployeeDetails.DoesNotExist:
            designation = "No Designation"
            image_base64 = None

    today = datetime.today().date()
    current_year = today.year

    # ✅ Fetch holidays
    holidays = Holiday.objects.filter(date__year=current_year).exclude(date__week_day=7).order_by('date')

    # Convert holidays to desired format
    holidays = [{"name": holiday.name, "date": holiday.date.strftime("%Y-%m-%d")} for holiday in holidays]

    # ✅ Fetch leave applications
    leave_applications = LeaveApplication.objects.filter(username=name).values(
        'id', 'start_date', 'end_date', 'reason', 'username', 'approver', 'leave_type', 
        'created_at', 'updated_at', 'status'
    )

    # ✅ Check if user is admin or MD by calling the `check_admin_status` method logic
    auth_result = None
    is_admin = False
    is_md = False

    # Fetch the authentication value from the database for the logged-in user
    try:
        employee = EmployeeDetails.objects.get(name=name)
        if employee.authentication:
            auth_value = employee.authentication.strip().lower()
            is_admin = auth_value == "admin"
            is_md = auth_value == "md"
    except EmployeeDetails.DoesNotExist:
        is_admin = False
        is_md = False

    # Return the context to the template
    return render(request, "mainleavepage.html", {
        "name": name,
        "designation": designation,
        "image_base64": image_base64,
        "employee_id": user_id,
        "is_admin": is_admin,
        "is_md": is_md,
        "holidays": holidays,
        "leave_applications": leave_applications,
    })



from django.shortcuts import render
from django.http import JsonResponse
from datetime import datetime
from .models import LeaveApplication  # Assuming the model is in the same app

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

            # ✅ Create a new leave application using Django ORM
            leave_application = LeaveApplication(
                start_date=start_date,
                end_date=end_date,
                reason=reason,
                username=current_user_name,
                approver=approver,
                leave_type=leave_type,
                status=status
            )

            # ✅ Save the leave application to the database
            leave_application.save()

            return JsonResponse({"message": "Leave request submitted successfully!"})

        except Exception as e:
            print("Error:", e)
            return JsonResponse({"error": "Something went wrong. Please try again later."}, status=500)


from django.shortcuts import render
from django.http import JsonResponse
from datetime import datetime
from .models import Holiday  # Import the existing Holiday model

def get_holidays(request):
    """Fetch upcoming holidays only for the current year, excluding Saturdays."""
    try:
        today = datetime.today().date()
        current_year = today.year  # Get current year dynamically

        # Query the Holiday model to get holidays for the current year, excluding Saturdays
        holidays = Holiday.objects.filter(date__year=current_year).exclude(date__week_day=7).order_by('date')

        # Convert holidays to JSON format with status
        holiday_list = []
        for holiday in holidays:
            holiday_date = holiday.date
            status = "past" if holiday_date < today else "upcoming"

            holiday_list.append({
                "name": holiday.name,
                "date": holiday_date.strftime("%Y-%m-%d"),
                "status": status  # Add status for styling in JS
            })

        return JsonResponse({"holidays": holiday_list})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)




from django.http import JsonResponse
from .models import LeaveApplication, Attendance

global_user_data = None

def leave_application_view(request):
    global global_user_data
    if not global_user_data:
        return JsonResponse({"error": "User not logged in."}, status=401)

    current_user_name = global_user_data["name"]

    try:
        # ✅ Fetch Leave Counts by Type (Approved) using Django ORM
        leave_data = LeaveApplication.objects.filter(username=current_user_name, status='Approved').values('leave_type').annotate(count=models.Count('id'))

        # Initialize leave counts
        full_day_leave = 0
        half_day_leave = 0
        work_from_home = 0

        # Distribute leave counts based on leave_type
        for entry in leave_data:
            if entry['leave_type'] == 'Full Day':
                full_day_leave = entry['count']
            elif entry['leave_type'] == 'Half Day':
                half_day_leave = entry['count']
            elif entry['leave_type'] == 'Work From Home':
                work_from_home = entry['count']

        # ✅ Fetch Redeemed Days from Attendance using Django ORM
        redeemed_days = Attendance.objects.filter(username=current_user_name, redeemed=True).count()

        # ✅ Calculate Balance Leave
        total_working_days = 15 + redeemed_days
        balance_leave = total_working_days - (full_day_leave + (half_day_leave * 0.5))

        # ✅ Fetch Leave Applications List using Django ORM
        leave_records = LeaveApplication.objects.filter(username=current_user_name).values(
            'id', 'start_date', 'end_date', 'reason', 'username', 'approver',
            'leave_type', 'created_at', 'updated_at', 'status'
        )

        # ✅ Add "Paid"/"Unpaid" Label Based on balance_leave
        labeled_leaves = []
        for leave in leave_records:
            if balance_leave > 0:
                leave["leave_payment_type"] = "Paid Leave"
                balance_leave -= 1  # Deduct 1 day per leave counted as paid
            else:
                leave["leave_payment_type"] = "Unpaid Leave"
            labeled_leaves.append(leave)

        return JsonResponse({
            "leave_applications": labeled_leaves,
            "balance_leave": balance_leave,
            "full_day_leave": full_day_leave,
            "half_day_leave": half_day_leave,
            "work_from_home": work_from_home,
            "redeemed_days": redeemed_days,
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)



from django.http import JsonResponse
from .models import EmployeeDetails, LeaveApplication  # Import the models

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

    # Fetch only pending leave approvals using Django ORM
    pending_leaves = LeaveApplication.objects.filter(status='Pending').values(
        'id', 'start_date', 'end_date', 'reason', 'username', 'approver', 
        'leave_type', 'created_at', 'updated_at', 'status'
    )

    # Convert the queryset to a list of dictionaries
    data = list(pending_leaves)

    return JsonResponse(data, safe=False)



from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import LeaveApplication  # Import the LeaveApplication model
import json

@csrf_exempt  # Temporarily bypass CSRF for debugging (Remove in production)
def update_leave_status(request):
    print("🔍 CSRF Token Received:", request.META.get("HTTP_X_CSRFTOKEN"))  # Debugging

    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method. Only POST is allowed."}, status=405)

    try:
        data = json.loads(request.body)
        leave_id = data.get("id")
        new_status = data.get("status")

        print("🔍 Received Data:", data)  # Debugging

        # Validate input data
        if leave_id is None or new_status is None:
            return JsonResponse({"error": "Missing required fields: 'id' and 'status' are needed."}, status=400)

        # ✅ Update the leave status using the model
        try:
            leave_application = LeaveApplication.objects.get(id=leave_id)
            leave_application.status = new_status
            leave_application.save()  # Save the updated status to the database

            print(f"✅ Leave ID {leave_id} updated to {new_status}")  # Debugging
            return JsonResponse({"message": f"Leave status successfully updated to {new_status}."})

        except LeaveApplication.DoesNotExist:
            return JsonResponse({"error": "Leave application not found."}, status=404)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data. Ensure the request body is properly formatted."}, status=400)

    except Exception as e:
        print("❌ Unexpected Error:", str(e))  # Debugging
        return JsonResponse({"error": f"Internal Server Error: {str(e)}"}, status=500)



def check_admin_status(request):
    global global_user_data

    if not global_user_data:
        return JsonResponse({"error": "User not logged in."}, status=401)

    username = global_user_data.get("name")  # Get logged-in username

    # ✅ Fetch authentication field for the user
    auth_result = EmployeeDetails.objects.filter(name=username).values_list("authentication", flat=True).first()
    
    # ✅ Ensure auth_result is a string and remove spaces
    auth_result = str(auth_result).strip().lower() if auth_result else ""

    print(f"🔍 DEBUG: {username}'s authentication value -> {auth_result}")

    # ✅ Check if the user is Admin or MD
    is_admin = auth_result == "admin"
    is_md = auth_result == "md"

    return JsonResponse({"is_admin": is_admin, "is_md": is_md})


import json
from django.http import JsonResponse
from django.db import connection

def get_task_details(request):
    task_id = request.GET.get("task_id")

    if not task_id:
        return JsonResponse({"error": "Task ID is required"}, status=400)

    try:
        # Fetch task details
        task_query = """
            SELECT id, title, projects, scope, date1, time, comments, list, category, task_status
            FROM tracker_project 
            WHERE id = %s
        """
        with connection.cursor() as cursor:
            cursor.execute(task_query, [task_id])
            row = cursor.fetchone()

        if not row:
            return JsonResponse({"error": "Task not found"}, status=404)

        columns = ["id", "title", "projects", "scope", "date1", "time", "comments", "list", "category", "task_status"]
        task = dict(zip(columns, row))

        # Fetch dropdown values dynamically
        dropdown_data = {}

        # Fetch department lists
        with connection.cursor() as cursor:
            cursor.execute("SELECT DISTINCT list FROM tracker_project")
            dropdown_data["list"] = [row[0] for row in cursor.fetchall() if row[0]]

        # Fetch projects based on list
        with connection.cursor() as cursor:
            cursor.execute("SELECT DISTINCT list, projects FROM tracker_project")
            dropdown_data["projects"] = [{"list": row[0], "name": row[1]} for row in cursor.fetchall() if row[0] and row[1]]

        # Fetch scopes based on projects
        with connection.cursor() as cursor:
            cursor.execute("SELECT DISTINCT projects, scope FROM tracker_project")
            dropdown_data["scope"] = [{"project": row[0], "name": row[1]} for row in cursor.fetchall() if row[0] and row[1]]

        # Fetch tasks based on scopes
        with connection.cursor() as cursor:
            cursor.execute("SELECT DISTINCT scope, title FROM tracker_project")
            dropdown_data["titles"] = [{"scope": row[0], "name": row[1]} for row in cursor.fetchall() if row[0] and row[1]]

        # Fetch categories based on tasks
        with connection.cursor() as cursor:
            cursor.execute("SELECT DISTINCT title, category FROM tracker_project")
            dropdown_data["category"] = [{"task": row[0], "name": row[1]} for row in cursor.fetchall() if row[0] and row[1]]

        print("Dropdown Data (Backend):", json.dumps(dropdown_data, indent=4))  # Debug print

        return JsonResponse({"task": task, "dropdowns": dropdown_data}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)



import json
from django.http import JsonResponse
from django.db import connection, transaction
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt  # Remove in production
def update_timesheet(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method. Use POST."}, status=405)

    try:
        # Parse JSON request body
        data = json.loads(request.body.decode("utf-8"))

        # Extract fields from JSON
        task_id = data.get("task_id")
        list_value = data.get("list", "").strip()  # Avoid conflict with Python keyword
        projects = data.get("projects", "").strip()
        scope = data.get("scope", "").strip()
        title = data.get("title", "").strip()
        category = data.get("category", "").strip()  # "Phase" is mapped to category
        task_status = data.get("task_status", "").strip()
        date1 = data.get("date1", "").strip()
        time = data.get("time", 0)
        comments = data.get("comments", "").strip()

        # Debugging: Log received data
        print("Received Data:", data)

        # Ensure task_id is provided
        if not task_id:
            return JsonResponse({"error": "task_id parameter is required"}, status=400)

        # Validate date1 - If empty, set it to NULL
        if not date1:
            date1 = None

        # Ensure 'time' is a valid number (default to 0 if invalid)
        try:
            time = int(time)
        except ValueError:
            return JsonResponse({"error": "Invalid value for 'time'. It must be an integer."}, status=400)

        # Ensure task exists
        select_query = "SELECT id FROM tracker_project WHERE id = %s"
        with connection.cursor() as cursor:
            cursor.execute(select_query, [task_id])
            if not cursor.fetchone():
                return JsonResponse({"error": "Task not found"}, status=404)

        # Update task details
        update_query = """
            UPDATE tracker_project 
            SET list = %s, projects = %s, scope = %s, title = %s, category = %s, 
                date1 = %s, time = %s, comments = %s, task_status = %s
            WHERE id = %s
        """
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    update_query,
                    [list_value, projects, scope, title, category, date1, time, comments, task_status, task_id],
                )

        return JsonResponse({"message": "Timesheet updated successfully."}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format"}, status=400)
    except Exception as e:
        print("Error:", str(e))  # Debugging
        return JsonResponse({"error": str(e)}, status=500)



def delete_task(request):
    task_id = request.GET.get('task_id')

    if not task_id:
        return JsonResponse({'error': 'task_id parameter is required'}, status=400)

    try:
        query = "DELETE FROM tracker_project WHERE id = %s"
        with connection.cursor() as cursor:
            cursor.execute(query, [task_id])

        return JsonResponse({'message': 'Task deleted successfully'}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

from django.http import JsonResponse
from datetime import datetime
from .models import LeaveApplication  # Import the LeaveApplication model

def delete_leave_application_view(request, leave_id):
    global global_user_data  # Using global variable for user authentication

    if not global_user_data:
        return JsonResponse({"error": "User not logged in."}, status=401)  # Show as popup

    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method. Use POST instead."}, status=405)

    current_user_name = global_user_data["name"]  # Get logged-in user's name

    try:
        # Fetch the leave application using Django ORM
        leave = LeaveApplication.objects.get(id=leave_id, username=current_user_name)

        start_date = leave.start_date
        status = leave.status.lower()

        # Check if the start date is in the past
        if start_date < datetime.today().date():
            return JsonResponse({"error": "You cannot delete leave applications with a start date in the past."}, status=403)

        # Delete the leave application
        leave.delete()

        return JsonResponse({"success": "✅ Leave application deleted successfully."})

    except LeaveApplication.DoesNotExist:
        return JsonResponse({"error": "Leave application not found or unauthorized."}, status=404)

    except Exception as e:
        return JsonResponse({"error": f"Internal Server Error: {str(e)}"}, status=500)



from django.http import JsonResponse
from datetime import datetime
from .models import LeaveApplication  # Import the LeaveApplication model

# Global variable to store user data
global_user_data = None  

def edit_leave_application_view(request, leave_id):
    global global_user_data  # Use global variable

    if not global_user_data:  # Check if user data is available
        return JsonResponse({"error": "User not logged in."}, status=401)

    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method."}, status=405)

    current_user_name = global_user_data["name"]  # Get logged-in user's name
    data = request.POST

    # Convert the provided start_date to a datetime object
    try:
        start_date = datetime.strptime(data.get("start_date"), "%Y-%m-%d").date()
    except ValueError:
        return JsonResponse({"error": "Invalid start date format."}, status=400)

    # Check if the start date is in the past
    if start_date < datetime.today().date():
        return JsonResponse({"error": "You cannot update the leave application to a past date."}, status=403)

    try:
        # Fetch the leave application object
        leave_application = LeaveApplication.objects.get(id=leave_id, username=current_user_name)

        # Update the fields
        leave_application.start_date = start_date
        leave_application.end_date = data.get("end_date")
        leave_application.reason = data.get("reason")
        leave_application.leave_type = data.get("leave_type")
        leave_application.updated_at = datetime.now()  # Update the timestamp

        # Save the updated leave application to the database
        leave_application.save()

        return JsonResponse({"success": "Leave application updated successfully."})

    except LeaveApplication.DoesNotExist:
        return JsonResponse({"error": "Leave application not found or unauthorized."}, status=404)

    except Exception as e:
        return JsonResponse({"error": f"Internal Server Error: {str(e)}"}, status=500)



from django.http import JsonResponse
from datetime import datetime, timedelta
from .models import Attendance, Holiday  # Import the Attendance and Holiday models

global_user_data = None  # Store the logged-in user's details globally

def attendance_view(request):
    global global_user_data  # Retrieve logged-in user data

    if request.method == "POST":
        try:
            if not global_user_data:
                return JsonResponse({"error": "User not logged in."}, status=401)

            # ✅ Get the logged-in user's details
            current_user_name = global_user_data.get("name")
            current_user_id = global_user_data.get("employee_id")

            if not current_user_id:
                return JsonResponse({"error": "User ID is missing."}, status=403)

            # ✅ Fetch form data (sent from JavaScript)
            attendance_date = request.POST.get("date", "").strip()
            punch_in = request.POST.get("punch_in", "").strip()
            punch_out = request.POST.get("punch_out", "").strip()
            break_time = request.POST.get("break_time", "").strip()

            # ✅ Debugging: Log Received Data
            print("📢 Received Data:", {
                "date": attendance_date,
                "punch_in": punch_in,
                "punch_out": punch_out,
                "break_time": break_time,
            })

            # ✅ Validate required fields
            if not all([attendance_date, punch_in, punch_out, break_time]):
                return JsonResponse({"error": "All fields are required!"}, status=400)

            # ✅ Convert input values to proper formats
            try:
                attendance_date = datetime.strptime(attendance_date, "%Y-%m-%d").date()
                punch_in = datetime.strptime(punch_in, "%H:%M:%S").time()
                punch_out = datetime.strptime(punch_out, "%H:%M:%S").time()
                break_time = int(break_time)
            except ValueError as e:
                print("📢 Invalid format error:", str(e))  # ✅ Print to Django logs
                return JsonResponse({"error": "Invalid date or time format"}, status=400)

            # ✅ Check if the date is a weekend (Saturday or Sunday) or a holiday
            is_weekend_or_holiday = False
            # Check if it's a weekend (Saturday or Sunday)
            if attendance_date.weekday() == 5 or attendance_date.weekday() == 6:  # 5: Saturday, 6: Sunday
                is_weekend_or_holiday = True
            # Check if it's a holiday
            elif Holiday.objects.filter(date=attendance_date).exists():
                is_weekend_or_holiday = True

            # ✅ Set the `is_compensated` flag based on weekend or holiday check
            is_compensated = 1 if is_weekend_or_holiday else 0

            # ✅ Handle overnight shifts
            dt_punch_in = datetime.combine(attendance_date, punch_in)
            dt_punch_out = datetime.combine(attendance_date, punch_out)

            if dt_punch_out < dt_punch_in:
                dt_punch_out += timedelta(days=1)

            # ✅ Calculate work duration in hours
            work_duration = dt_punch_out - dt_punch_in - timedelta(seconds=break_time)
            work_hours = max(0, work_duration.total_seconds() / 3600.0)  # Convert to hours

            # ✅ Create and save the attendance entry using Django ORM
            attendance = Attendance(
                date=attendance_date,
                punch_in=punch_in,
                punch_out=punch_out,
                break_time=break_time,
                worktime=work_hours,
                user_id=current_user_id,
                is_compensated=is_compensated,  # Set compensation status
                username=current_user_name,
            )
            attendance.save()

            print("✅ Attendance successfully added!")  # ✅ Debugging log

            return JsonResponse({
                "message": "Attendance added successfully!",
                "username": current_user_name,
                "work_hours": work_hours,
                "is_compensated": is_compensated,  # Include compensation status in response
            })

        except Exception as e:
            print("📢 Django Error:", str(e))  # ✅ Log full error in Django console
            return JsonResponse({"error": f"Something went wrong: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)


from django.http import JsonResponse
from datetime import datetime, timedelta
from .models import Attendance  # Import the Attendance model

global_user_data = None  # Global user data

def get_attendance(request):
    global global_user_data

    if not global_user_data:
        return JsonResponse({"error": "User not logged in."}, status=401)

    user_id = global_user_data.get("employee_id")

    # Fetch attendance for a specific date
    date = request.GET.get("date", "").strip()
    year = request.GET.get("year", "").strip()
    month = request.GET.get("month", "").strip()

    # Handle requests for monthly attendance
    if year and month:
        try:
            year = int(year)
            month = int(month)
        except ValueError:
            return JsonResponse({}, status=200)  # ✅ Return empty JSON instead of an error

        first_day = datetime(year, month, 1).date()
        last_day = (first_day.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)

        # Query using Django ORM
        attendance_records = Attendance.objects.filter(
            user_id=user_id,
            date__range=[first_day, last_day]
        ).order_by('date')

        attendance_data = [
            {
                "date": record.date.strftime("%Y-%m-%d"),
                "punch_in": str(record.punch_in),
                "punch_out": str(record.punch_out),
                "break_time": int(record.break_time),  # Convert break_time to integer
                "worktime": float(record.worktime) if record.worktime is not None else 0.0
            }
            for record in attendance_records
        ]

        return JsonResponse({"attendance": attendance_data}, status=200)

    # Handle single date requests
    if date:
        try:
            date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            return JsonResponse({}, status=200)  # ✅ Return empty JSON instead of an error

        # Query using Django ORM
        attendance_record = Attendance.objects.filter(
            user_id=user_id,
            date=date_obj
        ).first()

        if attendance_record:
            return JsonResponse({
                "date": attendance_record.date.strftime("%Y-%m-%d"),
                "punch_in": str(attendance_record.punch_in),
                "punch_out": str(attendance_record.punch_out),
                "break_time": int(attendance_record.break_time),
                "worktime": float(attendance_record.worktime) if attendance_record.worktime is not None else 0.0
            }, status=200)

        return JsonResponse({}, status=200)  # ✅ Return empty JSON instead of an error

    return JsonResponse({}, status=200)  # ✅ Return empty JSON instead of an error


from django.http import JsonResponse
from datetime import datetime, timedelta
from .models import Attendance  # Import the Attendance model

global_user_data = None  # Global user data

def edit_attendance_view(request):
    global global_user_data  # Retrieve logged-in user data

    if request.method == "POST":
        try:
            if not global_user_data:
                return JsonResponse({"error": "User not logged in."}, status=401)  # ✅ Status 200 prevents redirection

            user_id = global_user_data.get("employee_id")

            # ✅ Get form data
            attendance_date = request.POST.get("date", "").strip()
            punch_in = request.POST.get("punch_in", "").strip()
            punch_out = request.POST.get("punch_out", "").strip()
            break_time = request.POST.get("break_time", "").strip()
            is_compensated = request.POST.get("is_compensated", "0").strip()  # ✅ Ensure it is always sent

            missing_fields = [field for field, value in {
                "punch_in": punch_in,
                "punch_out": punch_out,
                "break_time": break_time,
                "is_compensated": is_compensated
            }.items() if not value]

            if missing_fields:
                return JsonResponse({"error": f"Missing fields: {', '.join(missing_fields)}"}, status=400)  # ✅ Prevents redirection

            # ✅ Convert input values to correct formats
            try:
                attendance_date = datetime.strptime(attendance_date, "%Y-%m-%d").date()
                punch_in = datetime.strptime(punch_in, "%H:%M:%S").time()
                punch_out = datetime.strptime(punch_out, "%H:%M:%S").time()
                break_time_seconds = int(break_time)  # Ensure break time is stored in seconds
                is_compensated = int(is_compensated)  # Ensure it's a valid integer
            except ValueError:
                return JsonResponse({"error": "Invalid date/time format!"}, status=400)  # ✅ Prevents redirection

            # ✅ Calculate work duration
            dt_punch_in = datetime.combine(attendance_date, punch_in)
            dt_punch_out = datetime.combine(attendance_date, punch_out)

            if dt_punch_out < dt_punch_in:
                dt_punch_out += timedelta(days=1)  # Handle overnight shifts

            work_duration = dt_punch_out - dt_punch_in - timedelta(seconds=break_time_seconds)
            work_hours = max(0, work_duration.total_seconds() / 3600.0)  # Convert to hours

            # ✅ Update attendance record in database using Django ORM
            attendance = Attendance.objects.filter(user_id=user_id, date=attendance_date).first()

            if not attendance:
                return JsonResponse({"error": "Attendance record not found."}, status=404)

            # Update fields
            attendance.punch_in = punch_in
            attendance.punch_out = punch_out
            attendance.break_time = break_time_seconds
            attendance.worktime = work_hours
            attendance.is_compensated = bool(is_compensated)

            # Save the updated record
            attendance.save()

            return JsonResponse({"message": "✅ Attendance updated successfully!", "work_hours": work_hours}, status=200)

        except Exception as e:
            return JsonResponse({"error": f"⚠️ Failed to update attendance. Please try again."}, status=500)  # ✅ Prevents redirection

    return JsonResponse({"error": "Invalid request method"}, status=405)  # ✅ Status 200 prevents error page

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from datetime import datetime
from .models import Attendance  # Import the Attendance model

global_user_data = None  # Global user data

@csrf_exempt
def delete_attendance_view(request):
    global global_user_data

    if request.method == "POST":
        try:
            if not global_user_data:
                return JsonResponse({"error": "User not logged in."}, status=401)

            user_id = global_user_data.get("employee_id")
            attendance_date = request.POST.get("date", "").strip()

            if not attendance_date:
                return JsonResponse({"error": "Date is required."}, status=400)

            try:
                attendance_date = datetime.strptime(attendance_date, "%Y-%m-%d").date()
            except ValueError:
                return JsonResponse({"error": "Invalid date format."}, status=400)

            # ✅ Delete the attendance record using Django ORM
            attendance = Attendance.objects.filter(user_id=user_id, date=attendance_date).first()

            if not attendance:
                return JsonResponse({"error": "Attendance record not found."}, status=404)

            # Delete the attendance record
            attendance.delete()

            return JsonResponse({"message": "Attendance deleted successfully."}, status=200)

        except Exception as e:
            return JsonResponse({"error": f"⚠️ Failed to delete attendance. Error: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request method."}, status=405)



from django.http import JsonResponse
from datetime import datetime, timedelta
from .models import Attendance, Holiday, LeaveApplication  # Assuming you have the Attendance, Holiday, and LeaveApplication models

global_user_data = None  # Global user data

def get_monthly_weekly_attendance(request):
    global global_user_data
    if not global_user_data:
        return JsonResponse({"error": "User not logged in."}, status=401)

    user_id = global_user_data.get("employee_id")

    # Get today's date
    today = datetime.today()

    # Get current week (Sunday to Saturday)
    week_start = today - timedelta(days=today.weekday() + 1)  # Get Sunday of this week
    week_end = week_start + timedelta(days=6)  # Get Saturday of this week

    # Get first and last day of the current month
    first_day_of_month = today.replace(day=1)
    last_day_of_month = (first_day_of_month.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)

    # Calculate total working days in the month (Monday to Friday)
    total_working_days_month = sum(
        1 for i in range(1, last_day_of_month.day + 1)
        if (first_day_of_month + timedelta(days=i - 1)).weekday() < 5
    )

    # Calculate total working days in the week (Monday to Friday)
    total_working_days_week = sum(
        1 for i in range(7)
        if (week_start + timedelta(days=i)).weekday() < 5  # Monday to Friday only
    )

    # Fetch holidays in the current month (excluding weekends)
    holiday_count_month = Holiday.objects.filter(
        date__range=[first_day_of_month, last_day_of_month]
    ).exclude(date__week_day__in=[6, 7]).count()  # Excluding weekends (Saturday and Sunday)

    # Fetch holidays in the current week (excluding weekends)
    holiday_count_week = Holiday.objects.filter(
        date__range=[week_start, week_end]
    ).exclude(date__week_day__in=[6, 7]).count()  # Excluding weekends (Saturday and Sunday)

    # Fetch leave applications for the current week (excluding weekends)
    leave_applications_week = LeaveApplication.objects.filter(
        username=user_id,
        start_date__gte=week_start,
        end_date__lte=week_end,
        status='Approved'
    )

    # Fetch leave applications for the current month (excluding weekends)
    leave_applications_month = LeaveApplication.objects.filter(
        username=user_id,
        start_date__gte=first_day_of_month,
        end_date__lte=last_day_of_month,
        status='Approved'
    )

    # Calculate leave days taken for the current week (ignoring full/half day)
    leave_taken_week = len(leave_applications_week)

    # Calculate leave days taken for the current month (ignoring full/half day)
    leave_taken_month = len(leave_applications_month)

    # **Expected Monthly Hours Calculation**
    # Total working days in the month minus holidays
    expected_monthly_working_days = total_working_days_month - holiday_count_month
    # Subtract 9 hours for each leave taken
    leave_deduction_month = leave_taken_month * 9
    expected_monthly_hours = expected_monthly_working_days * 9 - leave_deduction_month  # 9 hours per workday

    # **Expected Weekly Hours Calculation**
    # Total working days in the week minus holidays
    expected_weekly_working_days = total_working_days_week - holiday_count_week
    # Subtract 9 hours for each leave taken
    leave_deduction_week = leave_taken_week * 9
    expected_weekly_hours = expected_weekly_working_days * 9 - leave_deduction_week  # 9 hours per workday

    # Fetch total work time for the current month using Django ORM
    total_monthly_hours = Attendance.objects.filter(
        user_id=user_id,
        date__range=[first_day_of_month, last_day_of_month]
    ).aggregate(total_worktime=models.Sum('worktime'))['total_worktime'] or 0.0

    # Fetch total work time for the current week using Django ORM
    total_weekly_hours = Attendance.objects.filter(
        user_id=user_id,
        date__range=[week_start, week_end]
    ).aggregate(total_worktime=models.Sum('worktime'))['total_worktime'] or 0.0

    return JsonResponse({
        "total_monthly_hours": total_monthly_hours,
        "total_weekly_hours": total_weekly_hours,
        "expected_monthly_hours": expected_monthly_hours,
        "expected_weekly_hours": max(expected_weekly_hours, 0)  # Prevents negative values
    })



from django.http import JsonResponse
from datetime import datetime, timedelta
from .models import Attendance  # Import the Attendance model

global_user_data = None  # Global user data

def get_last_week_metrics(request):
    global global_user_data
    if not global_user_data:
        return JsonResponse({"error": "User not logged in."}, status=401)

    user_id = global_user_data.get("employee_id")

    # Get last week's date range (Monday to Sunday)
    today = datetime.today()
    last_week_start = today - timedelta(days=today.weekday() + 7)  # Previous Monday
    last_week_end = last_week_start + timedelta(days=6)  # Previous Sunday

    # Fetch total work hours and count working days in last week using Django ORM
    worktime_data = Attendance.objects.filter(
        user_id=user_id,
        date__range=[last_week_start, last_week_end]
    ).aggregate(total_worktime=models.Sum('worktime'), total_days=models.Count('date', distinct=True))

    total_hours_last_week = worktime_data['total_worktime'] or 0.0
    total_working_days = worktime_data['total_days'] or 1  # Avoid division by zero

    # Calculate Average Hours per Day
    average_hours_per_day = total_hours_last_week / total_working_days

    # Fetch total on-time arrivals (Punch-in before or at 9 AM)
    on_time_count = Attendance.objects.filter(
        user_id=user_id,
        date__range=[last_week_start, last_week_end],
        punch_in__lte="09:00:00"
    ).count()

    # Calculate On-Time Arrival Percentage
    on_time_percentage = (on_time_count / total_working_days) * 100 if total_working_days > 0 else 0.0

    return JsonResponse({
        "average_hours_per_day": f"{int(average_hours_per_day):02}:{int((average_hours_per_day % 1) * 60):02}",  # Convert to HH:MM format
        "on_time_percentage": round(on_time_percentage, 2)
    })


from django.http import JsonResponse
from .models import Attendance  # Import the Attendance model

global_user_data = None  # Global user data

def get_compensated_worktime(request):
    """Fetch compensated worktime records for the logged-in user."""
    global global_user_data

    if not global_user_data:
        return JsonResponse({"error": "User not logged in."}, status=401)

    username = global_user_data.get("name")  # Get username from global user data

    try:
        # Fetch compensated worktime records using Django ORM
        compensated_worktime_records = Attendance.objects.filter(
            is_compensated=True,
            username=username
        ).order_by('-date')  # Order by date descending

        # Prepare the data to be returned as JSON
        compensated_worktime_data = [
            {
                "id": record.id,
                "date": record.date.strftime("%Y-%m-%d"),
                "punch_in": str(record.punch_in),
                "punch_out": str(record.punch_out),
                "break_time": int(record.break_time),
                "worktime": float(record.worktime) if record.worktime is not None else 0.0,
                "user_id": record.user_id,
                "is_compensated": record.is_compensated,
                "redeemed": record.redeemed,
                "username": record.username
            }
            for record in compensated_worktime_records
        ]

        return JsonResponse({"compensated_worktime": compensated_worktime_data}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


from django.http import JsonResponse
from .models import Attendance  # Import the Attendance model
import json

global_user_data = None  # Global user data

def request_comp_leave(request):
    """User submits a request for compensatory leave approval."""
    global global_user_data

    if not global_user_data:
        return JsonResponse({"error": "User not logged in."}, status=401)

    if request.method != "POST":
        return JsonResponse({"error": "Method Not Allowed"}, status=405)

    try:
        data = json.loads(request.body)
        worktime_id = data.get("id")

        if not worktime_id:
            return JsonResponse({"error": "Missing worktime ID"}, status=400)

        # Fetch the attendance record with the given worktime_id using Django ORM
        attendance = Attendance.objects.filter(id=worktime_id).first()

        if not attendance:
            return JsonResponse({"error": "Attendance record not found."}, status=404)

        # Mark the compensatory leave request as pending approval (set is_compensated to 2)
        # Using is_compensated as an integer field (0 = not compensated, 2 = pending approval)
        attendance.is_compensated = 2
        attendance.save()  # Save the updated record

        return JsonResponse({"message": "Request submitted for approval."}, status=200)

    except Exception as e:
        return JsonResponse({"error": f"Failed to update attendance. Error: {str(e)}"}, status=500)


from django.http import JsonResponse
from .models import Attendance, EmployeeDetails  # Import the models
import json

global_user_data = None  # Global user data

def get_pending_comp_leave_requests(request):
    """MD fetches pending compensatory leave requests."""
    global global_user_data

    if not global_user_data:
        return JsonResponse({"error": "User not logged in."}, status=401)

    username = global_user_data.get("name")
    is_md = False

    # Check if the user is MD using Django ORM
    try:
        employee = EmployeeDetails.objects.filter(name=username).first()
        if employee and employee.authentication == "MD":
            is_md = True
    except EmployeeDetails.DoesNotExist:
        pass

    if not is_md:
        return JsonResponse({"error": "Forbidden: Only MD can view this."}, status=403)

    try:
        # Fetch pending compensatory leave requests using Django ORM
        pending_requests = Attendance.objects.filter(is_compensated=2).values(
            'id', 'date', 'username', 'worktime'
        )

        # Return the data as a list of dictionaries
        pending_requests_data = list(pending_requests)

        return JsonResponse({"pending_requests": pending_requests_data}, status=200)

    except Exception as e:
        return JsonResponse({"error": f"An error occurred: {str(e)}"}, status=500)

from django.http import JsonResponse
from django.db import transaction
from .models import Attendance, EmployeeDetails  # Import the models
import json

global_user_data = None  # Global user data

@csrf_exempt
def update_comp_leave_status(request):
    """MD approves or rejects a compensatory leave request."""
    global global_user_data

    if not global_user_data:
        return JsonResponse({"error": "User not logged in."}, status=401)

    username = global_user_data.get("name")
    is_md = False

    try:
        # Check if the logged-in user is an MD using Django ORM
        employee = EmployeeDetails.objects.filter(name=username).first()
        if employee and employee.authentication == "MD":
            is_md = True
    except EmployeeDetails.DoesNotExist:
        pass

    if not is_md:
        return JsonResponse({"error": "Forbidden: Only MD can approve/reject."}, status=403)

    if request.method != "POST":
        return JsonResponse({"error": "Method Not Allowed"}, status=405)

    try:
        data = json.loads(request.body)
        record_id = data.get("id")
        action = data.get("action")  # "approve" or "reject"

        if not record_id or action not in ["approve", "reject"]:
            return JsonResponse({"error": "Invalid request data."}, status=400)

        # Fetch the attendance record using Django ORM
        attendance = Attendance.objects.filter(id=record_id).first()

        if not attendance:
            return JsonResponse({"error": "Attendance record not found."}, status=404)

        # Update the attendance record based on the action (approve/reject)
        if action == "approve":
            attendance.is_compensated = 0  # Set is_compensated to 1 for approved
            attendance.redeemed = 1  # Set redeemed to 1 for approved
        elif action == "reject":
            attendance.is_compensated = 1  # Set is_compensated to 0 for rejected
            attendance.redeemed = 0 # Set redeemed to 0 for approved
        # Save the updated record
        attendance.save()

        # Commit the transaction
        transaction.commit()

        return JsonResponse({"message": f"Comp Leave {action}d successfully."}, status=200)

    except Exception as e:
        # Rollback in case of error
        transaction.rollback()
        return JsonResponse({"error": str(e)}, status=500)



from django.shortcuts import render
from datetime import datetime
from django.db.models import Sum
from .models import EmployeeDetails, Attendance  # Import models

def monthly_attendance_view(request):
    # Get the current month and year
    current_month = datetime.now().month
    current_year = datetime.now().year

    # Fetch the attendance data for the current month and year using Django ORM
    attendance_data = (
        EmployeeDetails.objects
        .filter(
            attendance__date__month=current_month,
            attendance__date__year=current_year
        )
        .annotate(
            total_worktime=Sum('attendance__worktime')  # Calculate the total worktime per employee
        )
        .values('name', 'total_worktime', 'attendance__date', 'attendance__worktime')
        .order_by('name', 'attendance__date')
    )

    # Format the data to match the previous structure
    attendance_data_list = [
        {
            'name': data['name'],
            'total_worktime': data['total_worktime'],
            'date': data['attendance__date'],
            'daily_worktime': data['attendance__worktime']
        }
        for data in attendance_data
    ]

    return render(request, "project_tracker.html", {'attendance_data': attendance_data_list})

from django.http import JsonResponse
from .models import EmployeeDetails  # Import the EmployeeDetails model

def get_employee_names(request):
    # Fetch employee names and ids from EmployeeDetails using Django ORM
    employees = EmployeeDetails.objects.all().order_by('name').values('employee_id', 'name')

    # Prepare the data to be returned in JSON format
    employee_data = [{'id': employee['employee_id'], 'name': employee['name']} for employee in employees]

    return JsonResponse({'employees': employee_data})


from django.http import JsonResponse
from django.db.models import Sum
from .models import Attendance  # Import the Attendance model

def get_user_worktime(request):
    try:
        employee_id = request.GET.get('employee_id')
        if not employee_id:
            return JsonResponse({'error': 'Missing employee_id'}, status=400)

        # Fetch the attendance records for the specific employee using Django ORM
        worktime_data = (
            Attendance.objects
            .filter(user_id=employee_id)  # Filter by the user_id
            .values('date', 'worktime')  # Select the necessary fields: date and worktime
            .annotate(total_worktime=Sum('worktime'))  # Calculate total worktime for the employee
            .order_by('date')  # Order by date
        )

        # Format the data to match the desired output structure
        worktime_data_list = [
            {
                'date': entry['date'],
                'daily_worktime': entry['worktime'],
                'total_worktime': entry['total_worktime']
            }
            for entry in worktime_data
        ]

        return JsonResponse({'worktime': worktime_data_list})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
from django.http import JsonResponse
from .models import Attendance  # Assuming you have an Attendance model

def get_attendance_details(request):
    try:
        employee_id = request.GET.get('employee_id')
        date = request.GET.get('date')  # Format: YYYY-MM-DD
        
        if not employee_id or not date:
            return JsonResponse({'error': 'Missing employee_id or date'}, status=400)

        # Fetch the attendance record for the specific employee and date
        attendance = Attendance.objects.filter(
            user_id=employee_id,
            date=date
        ).values('punch_in', 'punch_out', 'break_time', 'worktime')

        if not attendance:
            return JsonResponse({'error': 'No attendance found for this date'}, status=404)

        # Return the data as JSON
        return JsonResponse({'attendance': attendance[0]})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


from django.http import JsonResponse
from .models import TrackerTasks  # Import the TrackerTasks model

def monthly_project_analysis(request):
    project_name = request.GET.get('project_name', None)

    # Start the queryset to fetch data from TrackerTasks model
    project_query = TrackerTasks.objects.all()

    # Apply filtering if project_name is provided
    if project_name:
        project_query = project_query.filter(projects=project_name)

    # Fetch the relevant fields including task_benchmark
    project_data = project_query.values('projects', 'category', 'date1', 'time', 'task_benchmark', 'title').order_by('projects', 'date1')

    # Convert the queryset to a list of dictionaries
    project_data_list = [
        {
            'projects': item['projects'],
            'category': item['category'],
            'date1': item['date1'],
            'time': item['time'],
            'task_benchmark': item['task_benchmark'],
            'title':item['title'],
        }
        for item in project_data
    ]

    return JsonResponse({'projects': project_data_list})



from django.http import JsonResponse
from .models import TrackerTasks  # Import the TrackerTasks model

def get_project_categories(request):
    project_name = request.GET.get('project_name', None)

    if not project_name:
        return JsonResponse({'error': 'No project name provided'}, status=400)

    try:
        # Use Django ORM to get the distinct categories for the given project name
        categories = (
            TrackerTasks.objects
            .filter(projects=project_name)  # Filter by project name
            .values('category')  # Select the category field
            .distinct()  # Get distinct categories
        )

        # Extract the category names from the queryset
        category_list = [category['category'] for category in categories]

        # Return the categories in a JsonResponse
        return JsonResponse({'categories': category_list})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



from django.http import JsonResponse
from .models import TrackerTasks
from datetime import datetime, timedelta

def get_week_date_range(week_offset):
    """
    Helper function to get the date range for the given week offset.
    week_offset: 0 for CW (current week), -1 for W6 (previous week), etc.
    """
    today = datetime.today()
    start_of_week = today - timedelta(days=today.weekday())  # Monday of the current week

    # Calculate the start and end of the target week
    week_start = start_of_week + timedelta(weeks=week_offset)
    week_end = week_start + timedelta(days=6)

    return week_start.date(), week_end.date()
from django.http import JsonResponse
from .models import TrackerTasks
from datetime import datetime, timedelta

def get_week_date_range(week_offset):
    """
    Helper function to get the date range for the given week offset.
    week_offset: 0 for CW (current week), -1 for W6 (previous week), etc.
    """
    today = datetime.today()
    start_of_week = today - timedelta(days=today.weekday())  # Monday of the current week

    # Calculate the start and end of the target week
    week_start = start_of_week + timedelta(weeks=week_offset)
    week_end = week_start + timedelta(days=6)

    return week_start.date(), week_end.date()

def get_project_datas(request):
    department = request.GET.get('department', None)  # Use 'list' here for department
    project_name = request.GET.get('project_name', None)
    category = request.GET.get('category', None)
    week_offset = int(request.GET.get('week_offset', 0))  # Week offset: 0 for CW, -1 for W6, etc.

    # Get the date range for the selected week
    week_start, week_end = get_week_date_range(week_offset)

    # Start the queryset to fetch data from TrackerTasks model
    project_query = TrackerTasks.objects.all()

    # Apply filtering if department is provided
    if department:
        project_query = project_query.filter(list=department)  # Use 'list' field for department
    
    # Apply filtering if project_name is provided
    if project_name:
        project_query = project_query.filter(projects=project_name)

    # Apply filtering if category is provided
    if category:
        project_query = project_query.filter(category=category)
    
    # Apply filtering for the week based on the date range
    project_query = project_query.filter(date1__range=[week_start, week_end])

    # Fetch the relevant fields and annotate results
    project_data = project_query.values('projects', 'category', 'date1', 'time', 'list').order_by('projects', 'date1')

    # Convert the queryset to a list of dictionaries
    project_data_list = [
        {
            'projects': item['projects'],
            'category': item['category'],
            'date1': item['date1'],
            'time': item['time'],
            'department': item['list']
        }
        for item in project_data
    ]
    
    # Get available departments for the department dropdown
    departments = TrackerTasks.objects.values('list').distinct()
    department_list = [department['list'] for department in departments]

    # Get available projects for the project dropdown based on the selected department
    if department:
        projects = TrackerTasks.objects.filter(list=department).values('projects').distinct()
        project_list = [project['projects'] for project in projects]
    else:
        project_list = []

    # Get available categories for the category dropdown based on the selected project
    if project_name:
        categories = TrackerTasks.objects.filter(projects=project_name).values('category').distinct()
        category_list = [category['category'] for category in categories]
    else:
        category_list = []

    # Available weeks (CW, W6, W5, etc.)
    week_list = [
        {'label': 'CW', 'value': 0},
        {'label': 'W6', 'value': -1},
        {'label': 'W5', 'value': -2},
        {'label': 'W4', 'value': -3},
        {'label': 'W3', 'value': -4},
        {'label': 'W2', 'value': -5},
        {'label': 'W1', 'value': -6},
    ]

    # Return the response with department, project, category, week data, and the filtered project data
    return JsonResponse({
        'departments': department_list,
        'projects': project_list,
        'categories': category_list,
        'weeks': week_list,
        'project_data': project_data_list
    })


from django.http import JsonResponse
from .models import TrackerTasks
from datetime import datetime

def get_task_details_for_sidebar(request):
    # Fetch the date from the request
    selected_date = request.GET.get('date')

    if not selected_date:
        return JsonResponse({'error': 'date is required'}, status=400)

    try:
        # Ensure the date format is correct
        selected_date = datetime.strptime(selected_date, '%Y-%m-%d').date()

        # Query tasks by date (assuming date1 is the field that holds the task date)
        tasks = TrackerTasks.objects.filter(date1=selected_date)

        if not tasks:
            return JsonResponse({'error': 'No tasks found for this date'}, status=404)

        # Prepare task data to return in JSON format, including the assignee field (assigned)
        task_data = [{
            'title': task.title,
            'projects': task.projects,
            'scope': task.scope,
            'category': task.category,
            'time': task.time,
            'comments': task.comments,
            'task_benchmark': task.task_benchmark,
            'assigned': task.assigned  # Correctly using 'assigned' field
        } for task in tasks]

        return JsonResponse({'tasks': task_data})

    except ValueError:
        return JsonResponse({'error': 'Invalid date format, expected YYYY-MM-DD'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)


from django.shortcuts import render
from .models import TrackerTasks, EmployeeDetails  # Your model import
import base64
from django.db import connection

# Assuming global_user_data is a global variable
global_user_data = None

def team_dashboard(request):
    global global_user_data  # Access the global variable for user data

    # Default data if global_user_data is not set
    user_id = global_user_data.get("employee_id", None) if global_user_data else None
    name = global_user_data.get("name", "Guest") if global_user_data else "Guest"
    designation = global_user_data.get("designation", None) if global_user_data else None
    authentication = global_user_data.get("authentication", None) if global_user_data else None
    image_base64 = None  # Initialize empty image

    # If designation or authentication is not found, fetch from DB
    if user_id and (not designation or not authentication):
        with connection.cursor() as cursor:
            cursor.execute("SELECT designation, authentication, image FROM employee_details WHERE employee_id = %s", [user_id])
            result = cursor.fetchone()
            if result:
                designation = result[0] if result[0] else "No Designation"
                authentication = result[1] if result[1] else "No Role"
                image_base64 = base64.b64encode(result[2]).decode("utf-8") if result[2] else None

    # Determine if user is admin or MD based on the 'authentication' column
    is_admin_or_md = authentication in ['admin', 'MD']

    # Fetch TrackerTasks data
    tracker_data = []

    if user_id:
        try:
            # Get all tasks related to the user's team or their assignment
            tasks = TrackerTasks.objects.filter(assigned=name)  # Assuming 'assigned' stores employee name
            for task in tasks:
                tracker_data.append({
                    "team": task.team,
                    "task_benchmark": task.task_benchmark,  # APPROVED HOURS
                    "time": task.time,  # Total Worktime
                    "projects": task.projects,
                    "project_status": task.project_status,
                    "title": task.title,
                    "task_status": task.task_status,
                    "priority": task.priority,
                    "start": task.start,
                    "end": task.end,
                })
        
        except TrackerTasks.DoesNotExist:
            tracker_data = []

    # Now pass the data to the template
    return render(
        request,
        "team_dashboard.html",  # Your team dashboard template
        {
            "name": name,
            "designation": designation,
            "authentication": authentication,
            "image_base64": image_base64,  # Send base64 encoded image
            "employee_id": user_id,  # Pass employee_id to template
            "tracker_data": tracker_data,  # Pass tracker task data to template
            "is_admin_or_md": is_admin_or_md  # <-- Pass it here as well
        },
    )

from django.http import JsonResponse
from .models import TrackerTasks
from django.db.models import Sum

def get_team_chart_data(request):
    # Fetch all tasks from the database
    team_data = TrackerTasks.objects.values(
        'team',
        'projects',
        'scope',
        'category',
        'title',
        'rev',
        'task_benchmark'
    ).order_by('team')

    # Dictionary to accumulate approved hours and worktime
    approved_hours_dict = {}
    total_worktime_dict = {}

    # Loop through the data to manually filter duplicates for Approved Hours
    unique_combinations = set()
    for entry in team_data:
        key = (entry['team'], entry['projects'], entry['scope'], entry['category'], entry['title'], entry['rev'])
        
        # Check if the combination already exists
        if key not in unique_combinations:
            unique_combinations.add(key)  # Mark this combination as counted
            
            # Initialize the dictionary if team not present
            if entry['team'] not in approved_hours_dict:
                approved_hours_dict[entry['team']] = 0
            
            # Add the benchmark value only if it's unique
            approved_hours_dict[entry['team']] += float(entry['task_benchmark'] or 0)
    
    # Calculate Total Worktime by filtering just the Team
    worktime_data = TrackerTasks.objects.values('team').annotate(
        total_worktime=Sum('time')
    ).order_by('team')

    # Populate the dictionary with worktime values
    for entry in worktime_data:
        total_worktime_dict[entry['team']] = entry['total_worktime']

    # Prepare data for JSON response
    data = {
        "teams": list(approved_hours_dict.keys()),
        "approvedHours": list(approved_hours_dict.values()),
        "totalWorktime": [total_worktime_dict.get(team, 0) for team in approved_hours_dict.keys()]
    }
    
    return JsonResponse(data)

from django.http import JsonResponse
from .models import TrackerTasks

def get_team_data(request):
    teams = TrackerTasks.objects.values('team').distinct()
    team_names = [team['team'] for team in teams]
    return JsonResponse({"teams": team_names})

def get_projects(request, team):
    projects = TrackerTasks.objects.filter(team=team).values('projects').distinct()
    project_names = [project['projects'] for project in projects]
    return JsonResponse({"projects": project_names})

from django.http import JsonResponse
from .models import TrackerTasks
from django.db.models import Sum

def get_task_data(request, team, project):
    # Decode team and project if needed (e.g., if they contain special characters)
    # team = urllib.parse.unquote(team)
    # project = urllib.parse.unquote(project)

    # Query tasks based on team and project
    tasks = TrackerTasks.objects.filter(team=team, projects=project).values('title').distinct()
    
    approved_hours = []
    total_worktime = []
    task_titles = []
    
    for task in tasks:
        task_titles.append(task['title'])
        
        # Calculate total approved hours for each task
        approved_hours_sum = TrackerTasks.objects.filter(
            team=team, projects=project, title=task['title']
        ).aggregate(Sum('task_benchmark'))['task_benchmark__sum'] or 0
        approved_hours.append(approved_hours_sum)
        
        # Calculate total worktime for each task
        total_worktime_sum = TrackerTasks.objects.filter(
            team=team, projects=project, title=task['title']
        ).aggregate(Sum('time'))['time__sum'] or 0
        total_worktime.append(total_worktime_sum)
    
    return JsonResponse({
        "tasks": task_titles,
        "approvedHours": approved_hours,
        "totalWorktime": total_worktime
    })

from django.http import JsonResponse
from .models import TrackerTasks
from django.db.models import Sum

def get_team_chart_data(request):
    # Fetch all tasks from the database
    team_data = TrackerTasks.objects.values(
        'team',
        'projects',
        'scope',
        'category',
        'title',
        'rev',
        'd_no',  # Include d_no in the values
        'task_benchmark'
    ).order_by('team')

    # Dictionary to accumulate approved hours and worktime
    approved_hours_dict = {}
    total_worktime_dict = {}

    # Loop through the data to manually filter duplicates for Approved Hours
    unique_combinations = set()
    for entry in team_data:
        # Create a unique key based on the combination of team, project, scope, category, title, rev, and d_no
        key = (entry['team'], entry['projects'], entry['scope'], 
               entry['category'], entry['title'], entry['rev'], entry['d_no'])
        
        # Check if the combination already exists
        if key not in unique_combinations:
            unique_combinations.add(key)  # Mark this combination as counted
            
            # Initialize the dictionary if team is not present
            if entry['team'] not in approved_hours_dict:
                approved_hours_dict[entry['team']] = 0
            
            # Add the benchmark value (approved hours) for the unique combination
            approved_hours_dict[entry['team']] += float(entry['task_benchmark'] or 0)
    
    # Calculate Total Worktime by filtering just the Team
    worktime_data = TrackerTasks.objects.values('team').annotate(
        total_worktime=Sum('time')
    ).order_by('team')

    # Populate the dictionary with worktime values
    for entry in worktime_data:
        total_worktime_dict[entry['team']] = entry['total_worktime']

    # Prepare data for JSON response
    data = {
        "teams": list(approved_hours_dict.keys()),
        "approvedHours": list(approved_hours_dict.values()),
        "totalWorktime": [total_worktime_dict.get(team, 0) for team in approved_hours_dict.keys()]
    }

    return JsonResponse(data)


def get_project(request, team):
    projects = TrackerTasks.objects.filter(team=team).values('projects').distinct()
    project_names = [project['projects'] for project in projects]
    return JsonResponse({"projects": project_names})


from django.http import JsonResponse
from .models import TrackerTasks
from django.db.models import Sum

def get_task_datas(request, team, project):
    # Fetch all tasks for the specified team and project, grouped by the combination of team, project, scope, category, title, rev, and d_no (as string)
    tasks = TrackerTasks.objects.filter(team=team, projects=project).values(
        'team', 'projects', 'scope', 'category', 'title', 'rev', 'd_no'
    ).distinct()

    print("🟢 Tasks found:", list(tasks))

    approved_hours = []
    total_worktime = []
    task_titles = []

    # New: User worktime dictionary
    user_worktimes = {}

    for task in tasks:
        task_titles.append(task['title'])

        # Calculate total approved hours for this task combination (unique combination)
        approved_hours_sum = TrackerTasks.objects.filter(
            team=team, projects=project, title=task['title'], rev=task['rev'], d_no=task['d_no']
        ).aggregate(Sum('task_benchmark'))['task_benchmark__sum'] or 0
        approved_hours.append(approved_hours_sum)

        # Calculate total worktime for this task combination (unique combination)
        total_worktime_sum = TrackerTasks.objects.filter(
            team=team, projects=project, title=task['title'], rev=task['rev'], d_no=task['d_no']
        ).aggregate(Sum('time'))['time__sum'] or 0
        total_worktime.append(total_worktime_sum)

    # New: Aggregate total worktime per user for the selected project
    user_data = TrackerTasks.objects.filter(team=team, projects=project).values('assigned').annotate(
        total_worktime=Sum('time')
    )

    print("🟢 User Data Found:", list(user_data))  # << This should show user details

    # Fill the user_worktimes dictionary
    for entry in user_data:
        username = entry['assigned']
        worktime = entry['total_worktime']
        
        # Only add to the dictionary if worktime is not None
        if worktime is not None:
            user_worktimes[username] = worktime

    print("🟢 Final user worktimes:", user_worktimes)  # << This should show the final dictionary

    return JsonResponse({
        "tasks": task_titles,
        "approvedHours": approved_hours,
        "totalWorktime": total_worktime,
        "userWorktimes": user_worktimes
    })



from django.http import JsonResponse
from .models import TrackerTasks
from django.db.models import Sum

def get_project_data(request, team, project):
    # Fetch all tasks for the specified team and project with the relevant fields
    team_data = TrackerTasks.objects.filter(team=team, projects=project).values(
        'team',
        'projects',
        'scope',
        'category',
        'title',
        'rev',
        'd_no',
        'task_benchmark',
        'time'
    ).order_by('team')

    # Dictionary to accumulate approved hours and worktime
    approved_hours_dict = {}
    total_worktime_dict = {}

    # Set to track unique combinations for Approved Hours only
    unique_combinations = set()

    # Loop through the data
    for entry in team_data:
        # Create a unique key for Approved Hours only (scope, category, title, rev, d_no)
        key = (entry['team'], entry['projects'], entry['scope'], 
               entry['category'], entry['title'], entry['rev'], entry['d_no'])

        # Filter only approved hours with unique key
        if key not in unique_combinations:
            unique_combinations.add(key)  # Mark this combination as counted

            # Initialize the dictionary if team not present
            if entry['team'] not in approved_hours_dict:
                approved_hours_dict[entry['team']] = 0

            # Add the benchmark value (Approved Hours)
            approved_hours_dict[entry['team']] += float(entry['task_benchmark'] or 0)

        # Total worktime should be summed directly, without filtering by key
        if entry['team'] not in total_worktime_dict:
            total_worktime_dict[entry['team']] = 0
        
        total_worktime_dict[entry['team']] += float(entry['time'] or 0)

    # Prepare the data for JSON response
    data = {
        "projects": [project],  # Since we are filtering for one project
        "approvedHours": [approved_hours_dict.get(team, 0) for team in approved_hours_dict.keys()],
        "totalWorktime": [total_worktime_dict.get(team, 0) for team in approved_hours_dict.keys()]
    }

    return JsonResponse(data)



from django.shortcuts import render
from django.http import JsonResponse
from .models import TrackerTasks

# Assuming global_user_data is a global variable
global_user_data = None

def get_projects_data(request):
    # Fetch distinct project names from the TrackerTasks model
    projects = TrackerTasks.objects.values('projects').distinct()

    # Convert queryset to list of project names
    projects = [project['projects'] for project in projects]

    # Return the data as JSON
    return JsonResponse({
        'projects': projects
    })

from django.shortcuts import render
from django.http import JsonResponse
from .models import TrackerTasks
from .forms import ProjectStatusUpdateForm

# Assuming global_user_data is a global variable
global_user_data = None

def update_project_status(request):
    if request.method == 'POST':
        form = ProjectStatusUpdateForm(request.POST)
        if form.is_valid():
            # Get the selected data from the form
            project_name = form.cleaned_data['projects']
            project_status = form.cleaned_data['project_status']

            # Update only the selected project's status
            tasks = TrackerTasks.objects.filter(projects=project_name)

            # If tasks exist, update their project_status
            if tasks.exists():
                tasks.update(project_status=project_status)
                return JsonResponse({"success": "Project status updated successfully"}, status=200)
            else:
                return JsonResponse({"error": "Project not found"}, status=404)

    else:
        # Display the form initially (GET request)
        form = ProjectStatusUpdateForm()

    return render(request, 'project_tracker.html', {'form': form})


from django.shortcuts import render
from django.http import JsonResponse
from .models import TeamRanking
import json
from django.views.decorators.csrf import csrf_exempt

def team_ranking_page(request):
    return render(request, 'project_tracker.html')
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import TeamRanking
import json

@csrf_exempt
def add_team_ranking(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        
        # Check if the team member already exists in the specified team
        existing_record = TeamRanking.objects.filter(
            team_name=data['team_name'],
            team_member=data['team_member']
        ).first()
        
        if existing_record:
            # Update the existing record
            existing_record.speed_of_execution = data['speed_of_execution']
            existing_record.complaints_of_check_list = data['complaints_of_check_list']
            existing_record.task_ownership = data['task_ownership']
            existing_record.understanding_task = data['understanding_task']
            existing_record.quality_of_work = data['quality_of_work']
            existing_record.save()
            return JsonResponse({'status': 'updated'})
        else:
            # Create a new record if it doesn't exist
            TeamRanking.objects.create(
                team_name=data['team_name'],
                team_member=data['team_member'],
                speed_of_execution=data['speed_of_execution'],
                complaints_of_check_list=data['complaints_of_check_list'],
                task_ownership=data['task_ownership'],
                understanding_task=data['understanding_task'],
                quality_of_work=data['quality_of_work'],
            )
            return JsonResponse({'status': 'created'})
    return JsonResponse({'status': 'invalid request'}, status=400)


# In your views.py
@csrf_exempt
def get_team_member_details(request):
    team_name = request.GET.get('team_name')
    team_member = request.GET.get('team_member')
    
    data = TeamRanking.objects.filter(team_name=team_name, team_member=team_member).values().first()
    return JsonResponse(data, safe=False)


from django.http import JsonResponse
from .models import TeamRanking

def get_team_rankings(request):
    # Fetch the team data ordered by date in descending order (newest first)
    team_data = list(TeamRanking.objects.order_by('-date').values())
    return JsonResponse(team_data, safe=False)



from django.http import JsonResponse
from .models import TrackerTasks

def get_team_names(request):
    team_data = (
        TrackerTasks.objects.values('team', 'assigned')
        .distinct()
        .exclude(team__isnull=True, assigned__isnull=True)
    )
    formatted_data = [{'team_name': item['team'], 'team_member': item['assigned']} for item in team_data]
    return JsonResponse(formatted_data, safe=False)



from django.http import JsonResponse
from django.core.mail import send_mail
from django.conf import settings
import json

def send_notification(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            message = data.get('message', '')
            recipient = data.get('recipient', '')
            print(recipient)  
            if not message or not recipient:
                return JsonResponse({"error": "Invalid data"}, status=400)

            send_mail(
                subject="Task Benchmark Missing",  # Email subject
                message=message,                   # The message body
                from_email=settings.DEFAULT_FROM_EMAIL,  # From address
                recipient_list=[recipient],
                       # Recipient's email
                fail_silently=False
            )
            return JsonResponse({"success": "Notification sent to admin."})
        except Exception as e:
            print(f"Failed to send email: {e}")
            return JsonResponse({"error": f"Failed to send notification: {str(e)}"}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)

