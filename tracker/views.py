# tracker/views.py
import calendar
from .forms import TaskForms
from .models import Task
from django.contrib.auth import logout
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Holiday


def holidays(request):
    today = date.today()
    current_year = today.year
    all_holidays = Holiday.objects.filter(date__year=current_year).order_by('date')
    context = {
        'holidays': all_holidays,
        'today': today
    }
    return render(request, 'tracker/holidays.html',context)
def leave_applications(request):
    leave_applications = LeaveApplication.objects.filter(user=request.user)
    return render(request, 'tracker/leave_applications.html', {'leave_applications': leave_applications})

def holidays_view(request):
    holidays = Holiday.objects.all()
    return render(request, 'tracker/holidays.html', {'holidays': holidays})


# views.py
from django.shortcuts import render
from django.db import connection


def user_info_list(request):
    # Modify the query to use the correct table name `userinfo`
    query = "SELECT * FROM tracker_userinfo"

    # Execute the raw query
    with connection.cursor() as cursor:
        cursor.execute(query)
        result = cursor.fetchall()  # Fetch all rows from the query

    # Pass the result to the template
    return render(request, 'tracker/user_info_list.html', {'user_info': result})


# from datetime import date
# from .models import Holiday, LeaveApplication
#
# def leave_page(request):
#     # Fetch future holidays
#     today = date.today()
#     future_holidays = Holiday.objects.filter(date__gte=today).order_by('date')
#
#     # Fetch leave applications for the current user
#     leave_applications = LeaveApplication.objects.filter(user=request.user)
#
#     context = {
#         'holidays': future_holidays,
#         'leave_applications': leave_applications
#     }
#     return render(request, 'tracker/leave_page.html', context)


@login_required
def home_view(request):
    return render(request, 'base.html')

@login_required
def custom_logout_view(request):
    logout(request)
    return render(request, 'tracker/logout.html')

import calendar
from datetime import date
from django.shortcuts import render
from django.utils import timezone
from .models import Attendance, LeaveApplication

@login_required
def calendar_view(request):
    current_month = int(request.GET.get('month', timezone.now().month))
    current_year = int(request.GET.get('year', timezone.now().year))
    current_month_name = calendar.month_name[current_month]

    # Calculate previous and next months for navigation
    prev_month, prev_year = (current_month - 1, current_year) if current_month > 1 else (12, current_year - 1)
    next_month, next_year = (current_month + 1, current_year) if current_month < 12 else (1, current_year + 1)

    # Create a calendar object to get the days of the current month
    cal = calendar.Calendar()
    month_days = cal.itermonthdays(current_year, current_month)

    # Fetch all holidays in the current month
    holidays = Holiday.objects.filter(date__year=current_year, date__month=current_month).values_list('date', flat=True)

    calendar_data = []
    total_worktime = 0
    weekly_worktime = 0  # To track total hours in the current week
    weekly_workdays = 0  # To track actual working days in the current week
    month_workdays = 0  # To track total working days in the current month

    def hours_and_minutes(decimal_hours):
        hours = int(decimal_hours)
        minutes = int((decimal_hours - hours) * 60)
        return f"{hours} hr {minutes} min"

    # Get the current week number based on the current date
    today_date = timezone.now().date()
    current_week_num = today_date.isocalendar()[1]  # Get current ISO week number

    # Calculate the start and end date of the current week (Monday-Sunday)
    start_of_week = today_date - timedelta(days=today_date.weekday())  # Monday of the current week
    end_of_week = start_of_week + timedelta(days=6)  # Sunday of the current week

    # Calculate the valid workdays in the current week (Monday to Friday)
    for i in range(5):  # Iterate through Monday to Friday
        week_day = start_of_week + timedelta(days=i)
        if week_day.month == current_month and not (week_day in holidays or week_day.weekday() >= 5):
            weekly_workdays += 1  # Increment for valid workdays in the current week

    # Populate calendar data with attendance and leave details
    for day in month_days:
        if day != 0:
            day_date = date(current_year, current_month, day)
            attendance = Attendance.objects.filter(user=request.user, date=day_date).first()
            leave_application = LeaveApplication.objects.filter(user=request.user, start_date__lte=day_date,
                                                                end_date__gte=day_date).first()

            # Check if the day is a weekend (Saturday or Sunday) or a holiday
            is_holiday = day_date in holidays
            is_weekend = day_date.weekday() >= 5  # 5 = Saturday, 6 = Sunday

            # Increment `month_workdays` if the day is a valid workday (not a weekend or holiday)
            if not is_weekend and not is_holiday:
                month_workdays += 1

            # Add data for weekends or holidays if attendance or leave data exists
            if is_holiday:
                calendar_data.append({'day': day, 'status': 'holiday'})
            elif attendance:
                worktime = attendance.worktime
                total_worktime += worktime

                # If the day is in the current week, add the worktime to weekly total
                if day_date.isocalendar()[1] == current_week_num:
                    weekly_worktime += worktime

                # Handle leave status combined with attendance
                if leave_application and leave_application.leave_type == 'Half Day':
                    status = 'half-day'
                    calendar_data.append({
                        'day': day,
                        'worktime': hours_and_minutes(worktime),
                        'punch_in': attendance.punch_in,
                        'punch_out': attendance.punch_out,
                        'break_time': attendance.break_time,
                        'pk': attendance.pk,
                        'status': status,
                        'details': 'Half Day Leave'
                    })
                else:
                    status = 'office' if not leave_application else 'wfh' if leave_application.leave_type == 'WFH' else 'leave'
                    calendar_data.append({
                        'day': day,
                        'worktime': hours_and_minutes(worktime),
                        'punch_in': attendance.punch_in,
                        'punch_out': attendance.punch_out,
                        'break_time': attendance.break_time,
                        'pk': attendance.pk,
                        'status': status
                    })
            elif leave_application:
                # Handle leave without attendance
                if leave_application.leave_type == 'Half Day':
                    calendar_data.append({
                        'day': day,
                        'status': 'half-day',
                        'details': 'Half Day Leave'
                    })
                else:
                    status = 'wfh' if leave_application.leave_type == 'WFH' else 'leave'
                    calendar_data.append({
                        'day': day,
                        'status': status
                    })
            else:
                # Mark the day as weekend if no attendance or leave data is found
                calendar_data.append({'day': day, 'status': 'weekend' if is_weekend else 'no-data'})
        else:
            calendar_data.append({'day': ''})

    # Expected work hours for the current week and month, excluding holidays and weekends
    expected_weekly_hours = weekly_workdays * 9  # 9 hours per valid workday in the current week
    expected_monthly_hours = month_workdays * 9  # 9 hours per valid workday in the current month

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
        'total_worktime': total_worktime,
        'weekly_worktime': weekly_worktime,  # Total weekly worktime in hours
        'expected_weekly_hours': expected_weekly_hours,  # Expected weekly worktime in hours
        'expected_monthly_hours': expected_monthly_hours,  # Expected monthly worktime in hours
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


from django.db import connection
from .models import Profile, LeaveApplication , Attendance, Holiday
from django.shortcuts import render, redirect, get_object_or_404
from .forms import LeaveApplicationForm
from datetime import datetime

@login_required
def leave_application_view(request, pk=None):
    profile, created = Profile.objects.get_or_create(user=request.user)
    error_message = None
    leave_application = None

    # If pk is provided, fetch the leave application for editing
    if pk:
        leave_application = get_object_or_404(LeaveApplication, pk=pk, user=request.user)

    if request.method == 'POST':
        form = LeaveApplicationForm(request.POST, instance=leave_application)
        if form.is_valid():
            leave_application = form.save(commit=False)

            # Set the user before saving the leave application
            leave_application.user = request.user

            # Assign the approver dynamically using ID
            approver_id = request.POST.get("approver")  # Fetch approver ID from form
            if approver_id:
                try:
                    approver = User.objects.get(id=approver_id)  # Fetch approver by ID
                    leave_application.approver = approver
                except User.DoesNotExist:
                    form.add_error('approver', "Selected approver does not exist.")
                    return render(request, 'tracker/leave_application.html', {
                        'form': form,
                        'error_message': "Selected approver does not exist."
                    })
            else:
                form.add_error('approver', "Please select an approver.")
                return render(request, 'tracker/leave_application.html', {
                    'form': form,
                    'error_message': "Please select an approver."
                })

            # Get leave type and calculate leave days
            leave_type = form.cleaned_data['leave_type']
            start_date = form.cleaned_data['start_date']
            end_date = form.cleaned_data['end_date']

            # Validate start and end dates
            if start_date < datetime.today().date() or end_date < datetime.today().date():
                form.add_error('start_date', "Start date and End date cannot be in the past.")
                return render(request, 'tracker/leave_application.html', {
                    'form': form,
                    'error_message': "Start date and End date cannot be in the past."
                })

            leave_days = (end_date - start_date).days + 1

            # Adjust leave days for Half Day leave type
            if leave_type == 'Half Day':
                leave_days = 0.5

            leave_option = form.cleaned_data.get('leave_option')  # Get leave option only if it exists

            # Check if there's already a leave application for the given date range
            overlapping_leaves = LeaveApplication.objects.filter(
                user=request.user,
                start_date__lte=end_date,
                end_date__gte=start_date
            ).exclude(pk=leave_application.pk)  # Exclude the current application in case of editing

            if overlapping_leaves.exists():
                form.add_error(None, "A leave has already been applied for in the selected date range.")
                return render(request, 'tracker/leave_application.html', {
                    'form': form,
                    'error_message': "A leave has already been applied for in the selected date range."
                })

            # Handle leave options and balance validation
            if leave_type == 'WFH':
                # For WFH, don't reduce leave balance, just save the leave
                leave_application.leave_type = leave_type
                leave_application.save()
                profile.total_wfh_leaves = getattr(profile, 'total_wfh_leaves', 0) + leave_days
                profile.save()
                return redirect('leave_application')
            elif leave_option == 'redeemed':
                # Use redeemed leaves first for compensation
                redeemed_leaves = Attendance.objects.filter(user=request.user, is_compensated=True, redeemed=True)
                redeemed_leave_count = redeemed_leaves.count()

                if redeemed_leave_count >= leave_days:
                    leaves_to_deduct = redeemed_leaves[:int(leave_days)]
                    for leave in leaves_to_deduct:
                        leave.redeemed = False
                        leave.save()
                    leave_application.leave_type = leave_type
                    leave_application.save()
                    return redirect('leave_application')
                else:
                    form.add_error(None, f"You don't have enough redeemed leaves. Available: {redeemed_leave_count}")
            elif leave_option == 'balance':
                # Fetch balance leaves from profile
                balance_leaves = profile.compensation_leaves

                if balance_leaves >= leave_days:
                    profile.compensation_leaves -= leave_days
                    profile.save()
                    leave_application.leave_type = leave_type
                    leave_application.save()
                    return redirect('leave_application')
                else:
                    # Use redeemed leaves if balance leaves are insufficient
                    redeemed_leaves = Attendance.objects.filter(user=request.user, is_compensated=True, redeemed=True)
                    redeemed_leave_count = redeemed_leaves.count()

                    if redeemed_leave_count >= leave_days:
                        leaves_to_deduct = redeemed_leaves[:int(leave_days)]
                        for leave in leaves_to_deduct:
                            leave.redeemed = False
                            leave.save()
                        leave_application.leave_type = leave_type
                        leave_application.save()
                        return redirect('leave_application')
                    else:
                        form.add_error(None, f"You don't have enough balance or redeemed leaves. "
                                             f"Balance Available: {balance_leaves}, Redeemed Available: {redeemed_leave_count}")
        else:
            error_message = "Form validation failed."
    else:
        # If editing, pre-fill the form with the existing data; otherwise, use a blank form
        form = LeaveApplicationForm(instance=leave_application)

    # Calculate leave statistics
    full_day_leaves = LeaveApplication.objects.filter(user=request.user, leave_type='Full Day').count()
    half_day_leaves = LeaveApplication.objects.filter(user=request.user, leave_type='Half Day').count() * 0.5
    wfh_leaves = LeaveApplication.objects.filter(user=request.user, leave_type='WFH').count()
    total_leaves_taken = full_day_leaves + half_day_leaves
    balance_leaves = profile.compensation_leaves - total_leaves_taken

    # Fetch approvers dynamically
    approver_usernames = ["manager1", "manager2", "manager3"]  # Replace with actual usernames
    approvers = User.objects.filter(username__in=approver_usernames)

    context = {
        'form': form,
        'leave_applications': LeaveApplication.objects.filter(user=request.user),
        'balance_leaves': balance_leaves,
        'full_day_leaves': full_day_leaves,
        'half_day_leaves': half_day_leaves,
        'wfh_leaves': wfh_leaves,
        'error_message': error_message,
        'approvers': approvers,
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
        return redirect('main_leave_page')
    return render(request, 'tracker/delete_leave_application.html', {'leave_application': leave_application})

from django.contrib.auth.decorators import login_required
from datetime import datetime
from .models import Holiday, LeaveApplication
@login_required
def main_leave_page(request):
    # Get the user's profile
    user = request.user
    profile = get_object_or_404(Profile, user=request.user)
    today = date.today()
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
    pro_rated_leave_allowance = monthly_leave_allowance  # Set as the full allowance
    # Uncomment this if you need prorated logic:
    # pro_rated_leave_allowance = round(monthly_leave_allowance * months_worked)

    # Get leave counts
    full_day_leaves = LeaveApplication.objects.filter(user=request.user, leave_type='Full Day').count()
    # Count half-day leaves as 0.5 for each instance
    half_day_leaves = LeaveApplication.objects.filter(user=request.user, leave_type='Half Day').count() * 0.5
    wfh_leaves = LeaveApplication.objects.filter(user=request.user, leave_type='WFH').count()
    redeemed_compensation_leaves = Attendance.objects.filter(user=user, is_compensated=True, redeemed=True).count()
    all_holidays = Holiday.objects.filter(date__year=current_year).order_by('date')
    # Fetch leave applications
    leave_applications = LeaveApplication.objects.filter(user=request.user)

    # Calculate total leaves taken
    total_leaves_taken = full_day_leaves + half_day_leaves

    # Calculate balance leave
    balance_leave = max(0, pro_rated_leave_allowance - total_leaves_taken)

    # Calculate total leave (includes redeemed compensation leaves)
    total_leave = balance_leave + redeemed_compensation_leaves

    context = {
        'holidays': all_holidays,
        'leave_applications': leave_applications,
        'full_day_leaves': full_day_leaves,
        'half_day_leaves': half_day_leaves,  # Pass adjusted half-day leave count
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

    # Fetch only unredeemed leaves for display
    unredeemed_leaves = Attendance.objects.filter(user=user, is_compensated=True, redeemed=False)
    redeemed_leaves = Attendance.objects.filter(user=user, is_compensated=True, redeemed=True)

    # Calculate full and half days for unredeemed leaves only
    full_days = unredeemed_leaves.filter(worktime__gte=9).count()
    half_days = unredeemed_leaves.filter(worktime__gte=4.5, worktime__lt=9).count()
    total_comp = full_days + half_days

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

    # Mark the leave as redeemed
    leave.redeemed = True
    leave.save()

    user = leave.user
    # Recalculate unredeemed leave counts after redemption
    unredeemed_leaves = Attendance.objects.filter(user=user, is_compensated=True, redeemed=False)
    full_days = unredeemed_leaves.filter(worktime__gte=9).count()
    half_days = unredeemed_leaves.filter(worktime__gte=4.5, worktime__lt=9).count()
    total_comp = full_days + half_days

    response_data = {
        'status': 'success',
        'full_days': full_days,
        'half_days': half_days,
        'total_comp': total_comp,
        'leave_id': leave_id,
        'date': leave.date.strftime('%Y-%m-%d'),
        'worktime': leave.worktime,
        'full_day_or_half_day': 'FULL DAY' if leave.worktime >= 9 else 'HALF DAY',
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

from django.shortcuts import render, get_object_or_404, redirect
from .models import Project
from .forms import ProjectForm

def project_dashboard(request):
    projects = Project.objects.all()  # Fetch all projects
    form = ProjectForm()  # Default empty form

    if request.method == 'POST':
        # Handle Project Creation
        if 'create' in request.POST:
            form = ProjectForm(request.POST)
            if form.is_valid():
                form.save()
                return redirect('project_dashboard')

        # Handle Project Editing
        elif 'edit' in request.POST:
            project_id = request.POST.get('project_id')
            project = get_object_or_404(Project, pk=project_id)
            form = ProjectForm(instance=project)  # Pass the project instance to pre-fill data

        # Handle Project Saving After Edit
        elif 'save_edit' in request.POST:
            project_id = request.POST.get('project_id')
            project = get_object_or_404(Project, pk=project_id)
            form = ProjectForm(request.POST, instance=project)  # Save changes to the existing project
            if form.is_valid():
                form.save()
                return redirect('project_dashboard')

        # Handle Project Deletion
        elif 'delete' in request.POST:
            project_id = request.POST.get('project_id')
            project = get_object_or_404(Project, pk=project_id)
            project.delete()
            return redirect('project_dashboard')

    context = {
        'projects': projects,
        'form': form,
    }
    return render(request, 'tracker/project_dashboard.html', context)


from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.views import View
from .models import MonthlyCalendar
from .forms import MonthlyCalendarForm
import json


@method_decorator(login_required, name='dispatch')
class MonthlyCalendarView(View):
    template_name = "tracker/monthly_calendar.html"

    def get(self, request):
        """
        Handle GET requests to render the template with grouped records.
        """
        from collections import defaultdict

        records = MonthlyCalendar.objects.all()

        # Group records by project, title, scope, and category
        grouped = defaultdict(lambda: {"assigned_details": [], "total_time": 0, "dates": []})

        for record in records:
            key = (record.project, record.title, record.scope, record.category)
            grouped[key]["project"] = record.project
            grouped[key]["title"] = record.title
            grouped[key]["scope"] = record.scope
            grouped[key]["category"] = record.category
            grouped[key]["assigned_details"].append({
                "name": record.assigned,
                "time": record.time,
            })
            # Add time values (ensure time is numeric or parse as needed)
            grouped[key]["total_time"] += float(record.time) if record.time else 0

            # Collect dates
            if record.date:
                grouped[key]["dates"].append(record.date)

        # Format the dates for each group
        for group in grouped.values():
            dates = sorted(set(group["dates"]))  # Remove duplicates and sort dates
            if len(dates) == 1:
                group["date_range"] = dates[0].strftime("%d-%m-%Y")  # Single date format
            elif len(dates) > 1:
                group["date_range"] = f"{dates[0].strftime('%d-%m-%Y')} TO {dates[-1].strftime('%d-%m-%Y')}"  # Range format
            else:
                group["date_range"] = ""

        # Prepare grouped data for the template
        grouped_records = list(grouped.values())

        return render(request, self.template_name, {"grouped_records": grouped_records})

    def post(self, request):
        """
        Handle POST requests for add, edit, or delete operations.
        """
        try:
            # Parse JSON request data
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)

        action = data.get("action")
        if not action:
            return JsonResponse({"error": "Action is missing"}, status=400)

        if action == "add":
            # Automatically set 'assigned' to the logged-in user's username
            data["assigned"] = request.user.username
            form = MonthlyCalendarForm(data)
            if form.is_valid():
                form.save()
                return JsonResponse({"message": "Record added successfully"}, status=201)
            return JsonResponse({"errors": form.errors}, status=400)

        elif action == "edit":
            record_id = data.get("id")
            if not record_id:
                return JsonResponse({"error": "Record ID is missing"}, status=400)

            # Retrieve and update the record
            record = get_object_or_404(MonthlyCalendar, id=record_id)
            for field, value in data.items():
                if field != "action" and hasattr(record, field):
                    setattr(record, field, value)
            record.assigned = request.user.username  # Update the 'assigned' field
            record.save()
            return JsonResponse({"message": "Record updated successfully"}, status=200)

        elif action == "delete":
            record_id = data.get("id")
            if not record_id:
                return JsonResponse({"error": "Record ID is missing"}, status=400)

            # Delete the record
            record = get_object_or_404(MonthlyCalendar, id=record_id)
            record.delete()
            return JsonResponse({"message": "Record deleted successfully"}, status=200)

        return JsonResponse({"error": "Invalid action"}, status=400)
