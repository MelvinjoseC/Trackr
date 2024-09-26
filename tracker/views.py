# tracker/views.py
import calendar

from .forms import AttendanceForm, TaskForm, TaskForms
from .models import Attendance, Task
from django.contrib.auth import logout as auth_logout, logout
from datetime import datetime, timedelta, date
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .forms import LeaveApplicationForm
from .models import LeaveApplication, Profile
from django.utils import timezone
from .models import Holiday


def holidays_view(request):
    today = date.today()
    future_holidays = Holiday.objects.filter(date__gte=today).order_by('date')
    context = {
        'holidays': future_holidays
    }
    return render(request, 'tracker/holidays.html',context)
def leave_applications(request):
    leave_applications = LeaveApplication.objects.filter(user=request.user)
    return render(request, 'tracker/leave_applications.html', {'leave_applications': leave_applications})

def holidays(request):
    holidays = Holiday.objects.all()
    return render(request, 'tracker/holidays.html', {'holidays': holidays})
@login_required
def home_view(request):
    return render(request, 'base.html')

@login_required
def custom_logout_view(request):
    logout(request)
    return render(request, 'tracker/logout.html')


@login_required
def calendar_view(request):
    # Get current month and year from URL parameters or default to current date
    current_month = int(request.GET.get('month', timezone.now().month))
    current_year = int(request.GET.get('year', timezone.now().year))

    # Get the month name
    current_month_name = calendar.month_name[current_month]

    # Calculate previous and next months
    prev_month, prev_year = (current_month - 1, current_year) if current_month > 1 else (12, current_year - 1)
    next_month, next_year = (current_month + 1, current_year) if current_month < 12 else (1, current_year + 1)

    # Calendar setup
    cal = calendar.Calendar()
    month_days = cal.itermonthdays(current_year, current_month)

    calendar_data = []
    total_worktime = 0

    def hours_and_minutes(decimal_hours):
        hours = int(decimal_hours)
        minutes = int((decimal_hours - hours) * 60)
        return f"{hours} hr {minutes} min"

    # Populate calendar data
    for day in month_days:
        if day != 0:
            day_date = date(current_year, current_month, day)
            attendance = Attendance.objects.filter(user=request.user, date=day_date).first()
            if attendance:
                worktime = attendance.worktime
                total_worktime += worktime
                calendar_data.append({
                    'day': day,
                    'worktime': hours_and_minutes(worktime),
                    'punch_in': attendance.punch_in,
                    'punch_out': attendance.punch_out,
                    'break_time': attendance.break_time,
                    'pk': attendance.pk
                })
            else:
                calendar_data.append({'day': day})
        else:
            calendar_data.append({'day': ''})

    return render(request, 'tracker/calendar.html', {
        'today': timezone.now().date(),
        'current_month': current_month,
        'current_year': current_year,
        'current_month_name': current_month_name,
        'prev_month': prev_month,
        'prev_year': prev_year,
        'next_month': next_month,
        'next_year': next_year,
        'calendar_data': calendar_data,
        'total_worktime': total_worktime
    })

from django.contrib import messages
@login_required
def clear_attendance_view(request):
    if request.method == 'POST':
        record_ids = request.POST.getlist('record_ids')
        if record_ids:
            Attendance.objects.filter(id__in=record_ids).delete()
            messages.success(request, "Selected attendance records have been deleted.")
        return redirect('clear_attendance')

    attendances = Attendance.objects.filter(user=request.user)
    return render(request, 'tracker/clear_attendance.html', {'attendances': attendances})


import logging
from django.contrib.auth.decorators import login_required
from .forms import AttendanceForm
from datetime import timedelta

# Configure logging
logging.basicConfig(level=logging.DEBUG)

@login_required
def attendance_view(request):
    if request.method == 'POST':
        form = AttendanceForm(request.POST)
        if form.is_valid():
            date = form.cleaned_data.get('date')

            # Prevent duplicate attendance records
            if Attendance.objects.filter(user=request.user, date=date).exists():
                form.add_error('date', 'Attendance record already exists for this date.')
                return render(request, 'tracker/attendance.html', {'form': form})

            attendance = form.save(commit=False)
            attendance.user = request.user

            # Assuming break_time is correctly captured as timedelta
            punch_in_time = form.cleaned_data['punch_in']
            punch_out_time = form.cleaned_data['punch_out']
            break_duration = form.cleaned_data['break_time']

            dt_punch_in = datetime.combine(date, punch_in_time)
            dt_punch_out = datetime.combine(date, punch_out_time)

            if dt_punch_out < dt_punch_in:
                dt_punch_out += timedelta(days=1)  # next day handling

            work_duration = dt_punch_out - dt_punch_in - break_duration
            work_time = max(0, work_duration.total_seconds() / 3600.0)
            attendance.work_time = work_time

            # Debugging log
            logging.debug(f"Calculated work time: {work_time}")

            # Save only if work_time is defined
            if work_time is not None:
                attendance.save()
                return redirect('attendance')
            else:
                logging.error("Failed to calculate work_time, it's None.")
                form.add_error(None, "Failed to calculate work time.")
        else:
            logging.error("Form is invalid")

        attendances = Attendance.objects.filter(user=request.user)
        return render(request, 'tracker/attendance.html', {'form': form, 'attendances': attendances})

    else:
        form = AttendanceForm()
        attendances = Attendance.objects.filter(user=request.user)
        return render(request, 'tracker/attendance.html', {'form': form, 'attendances': attendances})


@login_required
def edit_attendance(request, pk):
    attendance = get_object_or_404(Attendance, pk=pk)
    if request.method == 'POST':
        form = AttendanceForm(request.POST, instance=attendance)
        if form.is_valid():
            attendance = form.save(commit=False)
            punch_in = form.cleaned_data['punch_in']
            punch_out = form.cleaned_data['punch_out']
            break_time = form.cleaned_data['break_time']

            punch_in_datetime = datetime.combine(attendance.date, punch_in)
            punch_out_datetime = datetime.combine(attendance.date, punch_out)

            work_time = punch_out_datetime - punch_in_datetime - break_time
            attendance.worktime = work_time.total_seconds() / 3600.0

            attendance.save()
            return redirect('calendar')
    else:
        form = AttendanceForm(instance=attendance)

    return render(request, 'tracker/edit_attendance.html', {'form': form, 'attendance': attendance})

# views.py
from django.shortcuts import render
from django.utils import timezone

def daily_timesheet(request):
    # Pass any context data if needed
    context = {
        'current_date': timezone.now().strftime('%A, %B %d, %Y')
    }
    return render(request, 'tracker/timesheet.html', context)


# from datetime import datetime, time, timedelta
#
# @login_required
# def edit_attendance(request, pk):
#     attendance = get_object_or_404(Attendance, pk=pk)
#     if request.method == 'POST':
#         form = AttendanceForm(request.POST, instance=attendance)
#         if form.is_valid():
#             attendance = form.save(commit=False)
#             punch_in = form.cleaned_data['punch_in']
#             punch_out = form.cleaned_data['punch_out']
#             break_time = form.cleaned_data['break_time']
#
#             punch_in_datetime = datetime.combine(attendance.date, punch_in)
#             punch_out_datetime = datetime.combine(attendance.date, punch_out)
#
#             if isinstance(break_time, timedelta):
#                 # If break_time is a timedelta object
#                 break_duration = break_time
#             elif isinstance(break_time, time):
#                 # If break_time is a time object
#                 break_duration = timedelta(hours=break_time.hour, minutes=break_time.minute)
#             else:
#                 # Handle unexpected types
#                 break_duration = timedelta()
#
#             work_time = punch_out_datetime - punch_in_datetime - break_duration
#             attendance.worktime = work_time.total_seconds() / 3600.0
#
#             attendance.save()
#             return redirect('calendar')
#     else:
#         form = AttendanceForm(instance=attendance)
#
#     return render(request, 'tracker/edit_attendance.html', {'form': form, 'attendance': attendance})
@login_required
def delete_attendance(request, pk):
    attendance = get_object_or_404(Attendance, pk=pk)
    attendance.delete()
    return redirect('calendar')


from django.shortcuts import render, redirect
from .forms import TaskForm

def create_task(request):
    if request.method == 'POST':
        form = TaskForms(request.POST)
        if form.is_valid():
            form.save()
            return redirect('task_list')  # Redirect to a task list view after saving
    else:
        form = TaskForms()
    return render(request, 'tracker/create_task.html', {'form': form})

@login_required
def task_view(request):
    if request.method == 'POST':
        form = TaskForm(request.POST)
        if form.is_valid():
            task = form.save(commit=False)
            task.user = request.user
            task.save()
            return redirect('task')
    else:
        form = TaskForm()

    tasks = Task.objects.filter(user=request.user)
    return render(request, 'tracker/task.html', {'form': form, 'tasks': tasks})

@login_required
def edit_task(request, pk):
    task = get_object_or_404(Task, pk=pk)
    if request.method == 'POST':
        form = TaskForm(request.POST, instance=task)
        if form.is_valid():
            form.save()
            return redirect('task')
    else:
        form = TaskForm(instance=task)
    return render(request, 'tracker/edit_task.html', {'form': form, 'task': task})

@login_required
def task_dashboard(request):
    # Sample data for tasks and time details
    task_data = {
        'total_task_time': '0 hr',
        'total_week_time': '28.09 hr',
        'total_month_time': '73.9 hr',
    }

    # Render the template with context data
    return render(request, 'tracker/tasks_dashboard.html', task_data)


from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from datetime import datetime
from .models import LeaveApplication, Attendance, Profile
from .forms import LeaveApplicationForm
import logging

logger = logging.getLogger(__name__)

@login_required
def leave_application_view(request):
    profile, created = Profile.objects.get_or_create(user=request.user)
    error_message = None

    if request.method == 'POST':
        form = LeaveApplicationForm(request.POST)
        if form.is_valid():
            leave_application = form.save(commit=False)
            leave_application.user = request.user

            # Calculate the number of leave days
            start_date = form.cleaned_data['start_date']
            end_date = form.cleaned_data['end_date']
            leave_days = (end_date - start_date).days + 1

            leave_option = form.cleaned_data['leave_option']

            logger.debug(f"Requested leave days: {leave_days}")

            # Check if the start date is in the past
            if start_date < datetime.today().date():
                form.add_error('start_date', "You cannot apply for a leave in the past.")
            else:
                # Check if there's already a leave application for the given date range
                overlapping_leaves = LeaveApplication.objects.filter(
                    user=request.user,
                    start_date__lte=end_date,
                    end_date__gte=start_date
                )

                if overlapping_leaves.exists():
                    form.add_error(None, "A leave has already been applied for in the selected date range.")
                else:
                    if leave_option == 'redeemed':
                        # Get redeemed compensation leaves
                        redeemed_leaves = Attendance.objects.filter(user=request.user, is_compensated=True, redeemed=True)
                        redeemed_leave_count = redeemed_leaves.count()

                        if redeemed_leave_count >= leave_days:
                            # Mark the redeemed leaves as not redeemed
                            leaves_to_deduct = redeemed_leaves[:leave_days]
                            for leave in leaves_to_deduct:
                                leave.redeemed = False
                                leave.save()
                            leave_application.leave_type = 'Compensation'
                            leave_application.save()
                            return redirect('leave_application')
                        else:
                            form.add_error(None, "You don't have enough redeemed leaves.")
                    elif leave_option == 'balance':
                        if profile.compensation_leaves >= leave_days:
                            # Deduct remaining from balance leaves
                            profile.compensation_leaves -= leave_days
                            profile.save()
                            leave_application.leave_type = 'Compensation'
                            leave_application.save()
                            return redirect('leave_application')
                        else:
                            # Calculate monthly leave allowance
                            current_date = datetime.now()
                            current_year = current_date.year
                            join_date = profile.user.date_joined
                            if join_date.year == current_year:
                                months_worked = current_date.month - join_date.month + 1
                            else:
                                months_worked = current_date.month
                            monthly_leave_allowance = 15
                            pro_rated_leave_allowance = round(monthly_leave_allowance * months_worked)

                            total_leaves_taken = (
                                LeaveApplication.objects.filter(user=request.user, leave_type='Full Day').count()
                                + LeaveApplication.objects.filter(user=request.user, leave_type='Half Day').count()
                                + LeaveApplication.objects.filter(user=request.user, leave_type='WFH').count()
                            )

                            balance_leave = pro_rated_leave_allowance - total_leaves_taken

                            if balance_leave >= leave_days:
                                # Deduct remaining from monthly leave allowance
                                new_leave_type = form.cleaned_data['leave_type']
                                leave_application.leave_type = new_leave_type
                                leave_application.save()
                                return redirect('leave_application')
                            else:
                                form.add_error(None, "You don't have enough leave.")
                                logger.debug("Not enough compensated or monthly leave allowance available.")
        else:
            error_message = "Form validation failed."
    else:
        form = LeaveApplicationForm()

    # Get leave counts
    full_day_leaves = LeaveApplication.objects.filter(user=request.user, leave_type='Full Day').count()
    half_day_leaves = LeaveApplication.objects.filter(user=request.user, leave_type='Half Day').count()
    wfh_leaves = LeaveApplication.objects.filter(user=request.user, leave_type='WFH').count()
    compensation_leaves = Attendance.objects.filter(user=request.user, is_compensated=True, redeemed=True).count()

    leave_applications = LeaveApplication.objects.filter(user=request.user)
    context = {
        'form': form,
        'leave_applications': leave_applications,
        'compensation_leaves': compensation_leaves,
        'balance_leaves': profile.compensation_leaves,  # Displaying compensation_leaves as balance_leaves
        'full_day_leaves': full_day_leaves,
        'half_day_leaves': half_day_leaves,
        'wfh_leaves': wfh_leaves,
        'error_message': error_message,
    }
    return render(request, 'tracker/leave_application.html', context)



from django.contrib.auth.models import User
@login_required
def edit_leave_application_view(request, pk):
    leave_application = get_object_or_404(LeaveApplication, pk=pk, user=request.user)
    profile = get_object_or_404(Profile, user=request.user)

    if request.method == 'POST':
        form = LeaveApplicationForm(request.POST, instance=leave_application)
        if form.is_valid():
            form.save()
            return redirect('leave_applications')
    else:
        form = LeaveApplicationForm(instance=leave_application)

    approvers = User.objects.all()

    context = {
        'form': form,
        'leave_application': leave_application,
        'approvers': approvers,
        'compensation_leaves': profile.compensation_leaves,
        'balance_leaves': profile.balance_leaves,
    }
    return render(request, 'tracker/edit_leave_application.html', context)
@login_required
def delete_leave_application(request, pk):
    leave_application = get_object_or_404(LeaveApplication, pk=pk)
    if request.method == 'POST':
        leave_application.delete()
        return redirect('leave_applications')
    return render(request, 'tracker/delete_leave_application.html', {'leave_application': leave_application})

from django.contrib.auth.decorators import login_required
from datetime import datetime
@login_required
def main_leave_page(request):
    # Get the user's profile
    user = request.user
    profile = get_object_or_404(Profile, user=request.user)

    # Get the current date and year
    current_date = datetime.now()
    current_year = current_date.year

    # Get the join date of the user
    join_date = profile.user.date_joined

    # Calculate the number of months worked in the current year
    if join_date.year == current_year:
        months_worked = current_date.month - join_date.month + 1
    else:
        months_worked = current_date.month

    # Determine the prorated leave allowance (15 days per year)
    monthly_leave_allowance = 15
    pro_rated_leave_allowance = monthly_leave_allowance
    # pro_rated_leave_allowance = round(monthly_leave_allowance * months_worked)

    # Get leave counts
    full_day_leaves = LeaveApplication.objects.filter(user=request.user, leave_type='Full Day').count()
    half_day_leaves = LeaveApplication.objects.filter(user=request.user, leave_type='Half Day').count()
    wfh_leaves = LeaveApplication.objects.filter(user=request.user, leave_type='WFH').count()
    redeemed_compensation_leaves = Attendance.objects.filter(user=user, is_compensated=True, redeemed=True).count()

    # Calculate balance leave
    total_leaves_taken = full_day_leaves + half_day_leaves + wfh_leaves
    balance_leave = pro_rated_leave_allowance - total_leaves_taken

    # Calculate total leave
    total_leave = balance_leave + redeemed_compensation_leaves

    context = {
        'full_day_leaves': full_day_leaves,
        'half_day_leaves': half_day_leaves,
        'wfh_leaves': wfh_leaves,
        'balance_leave': balance_leave,  # Pass the calculated balance leave to the template
        'compensation_leaves': redeemed_compensation_leaves,
        'total_leave': total_leave,  # Pass the calculated total leave
        'pro_rated_leave_allowance': pro_rated_leave_allowance,
        # Include prorated leave allowance for debugging purposes
    }

    return render(request, 'tracker/mainleavepage.html', context)


# @login_required
# def redeem_page(request):
#     profile = get_object_or_404(Profile, user=request.user)
#
#     full_day_leaves = LeaveApplication.objects.filter(user=request.user, leave_type='Full Day').count()
#     half_day_leaves = LeaveApplication.objects.filter(user=request.user, leave_type='Half Day').count()
#     wfh_leaves = LeaveApplication.objects.filter(user=request.user, leave_type='WFH').count()
#
#     context = {
#         'full_day_leaves': full_day_leaves,
#         'half_day_leaves': half_day_leaves,
#         'wfh_leaves': wfh_leaves,
#     }
#
#     return render(request, 'tracker/redeem.html', context)





def compensated_leave_details(request):
    user = request.user

    # Calculating full and half days correctly
    full_days = Attendance.objects.filter(
        user=user, is_compensated=True, redeemed=False, worktime__gte=9
    ).count()
    half_days = Attendance.objects.filter(
        user=user, is_compensated=True, redeemed=False, worktime__gte=4.5, worktime__lt=9
    ).count()
    total_comp = full_days + half_days

    # Filter leaves that are redeemed and unredeemed
    unredeemed_leaves = Attendance.objects.filter(user=user, is_compensated=True, redeemed=False)
    redeemed_leaves = Attendance.objects.filter(user=user, is_compensated=True, redeemed=True)

    return render(request, 'tracker/redeem.html', {
        'full_days': full_days,
        'half_days': half_days,
        'total_comp': total_comp,
        'unredeemed_leaves': unredeemed_leaves,
        'redeemed_leaves': redeemed_leaves,
    })


from django.http import JsonResponse
from django.db.models import F
from .models import Attendance
from django.utils.dateformat import DateFormat


def add_to_total_compensation_leave(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

    leave_id = request.POST.get('leave_id')
    if not leave_id:
        return JsonResponse({'status': 'error', 'message': 'No leave ID provided'}, status=400)

    try:
        leave = Attendance.objects.get(id=leave_id)
    except Attendance.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Leave not found'}, status=404)

    if leave.redeemed:
        return JsonResponse({'status': 'error', 'message': 'This leave has already been redeemed'}, status=409)

    leave.redeemed = True
    leave.save()

    user = leave.user
    # Recalculate the total compensation leave excluding redeemed ones
    full_days = Attendance.objects.filter(
        user=user, is_compensated=True, redeemed=False, worktime__gte=9
    ).count()
    half_days = Attendance.objects.filter(
        user=user, is_compensated=True, redeemed=False, worktime__gte=4.5, worktime__lt=9
    ).count()
    total_comp = full_days + half_days

    response_data = {
        'status': 'success',
        'full_days': full_days,
        'half_days': half_days,
        'total_comp': total_comp,
        'leave_id': leave_id,
        'date': DateFormat(leave.date).format('Y-m-d'),
        'worktime': leave.worktime,
        'full_day_or_half_day': 'FULL DAY' if leave.worktime >= 9 else 'HALF DAY'
    }

    return JsonResponse(response_data)

from django.shortcuts import render

def task_tracker_selection(request):
    # Expanded list of running projects
    projects = [
        "VMS-050 BERGE YOTEI",
        "VM ADDITIONAL WORKS",
        "VM5-054 FWN SUN",
        "VM5-058-ARDMORE SEAHAWK",
        "VM5-055 ARDMORE SEALION",
        "FE24.0062 VALUE CARBON CATCH AND RELEASE",
        "AUTOMATION",
        "FE24.IP.0002 AERO BRIDGE DESIGN",
        "FE24.IP.010 MONOPILE UPENDING TOOL",
        "FE24.IP.017 OFFSHORE GANGWAY",
        "2D DWGs MANJOORAN",
        "FE24.019 GANTRY CRANE AND WORKSHOP DESIGN",
        "FE24.0049 JUB BLADERACK JB119",
        "FE24.0054 HES FPU FEED INSTALLATION EWD",
        "FE24.0057 SCALDIS DECOM ENI_PETROFAC",
        "FE24.0059 KTB FLIPPING UNIT",
        "FE24.0011 CADELER WIND PEAK BOATLANDING",
        "TENDERS",
        "FE24.0043 CADELER GANGWAY PLATFORM",
        "FE24.0045 JB119 BOAT LANDING MODIFICATION",
        "FE24.0058 JUB BLADERACK TUGGER LINES JB119",
        "FE24.0060 DEME MCPG GRIPPER PLATFORM",
        "FE24.0064 STEELMAX SPREADER BEAM",
        "FE24.0008 Q3 BARGE DESIGN",
        "FE24.IP.013 HYDROFOIL CRAFT",
        "YACHT",
        "FE23.0009 CDWE HAI LONG OSS AND FOU",
        "FE24.0002 COASTAL VIRGINIA OFFSHORE WIND",
        "FE24.0040 DEME VW1 LIFTING",
        "FE24.0038 GINA KROG DECOMMISSIONING"
    ]

    # Render the HTML template and pass the projects list to it
    return render(request, 'tracker/task_tracker_selection.html', {'projects': projects})


# # views.py
# from django.shortcuts import render, redirect
# from django.contrib.auth import login
# from .forms import CustomUserCreationForm
#
#
# def register(request):
#     if request.method == 'POST':
#         form = CustomUserCreationForm(request.POST)
#         if form.is_valid():
#             user = form.save()
#             login(request, user)  # Automatically log the user in
#             return redirect('home')  # Redirect after successful registration
#     else:
#         form = CustomUserCreationForm()
#
#     return render(request, 'registration/register.html', {'form': form})

