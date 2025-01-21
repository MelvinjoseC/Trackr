# tracker/urls.py

from django.urls import path
from .views import (attendance_view, task_view, leave_application_view, custom_logout_view, home_view, \
                    delete_leave_application, edit_attendance, delete_attendance, edit_task, \
                    calendar_view, clear_attendance_view, leave_applications, edit_leave_application_view, \
                    holidays_view, main_leave_page, compensated_leave_details, add_to_total_compensation_leave, \
                    create_task, task_tracker_selection, task_dashboard, daily_timesheet, user_info_list,
                    project_dashboard, MonthlyCalendarView, )  # register
                    # redeem_page,

urlpatterns = [
    # path('login/', home_view, name='home'),  # Home page
    # path('register/', register, name='register'),
    path('attendance/', attendance_view, name='attendance'),
    path('task/', task_view, name='task'),
    path('calendar/', calendar_view, name='calendar'),
    path('leave_application/', leave_application_view, name='leave_application'),
    path('logouts/', custom_logout_view, name='logouts'),
    path('leave_application/edit/<int:pk>/',leave_application_view, name='edit_leave_application'),
    path('leave_application/delete/<int:pk>/', delete_leave_application, name='delete_leave_application'),
    path('attendance/edit/<int:pk>/', edit_attendance, name='edit_attendance'),
    path('attendance/delete/<int:pk>/', delete_attendance, name='delete_attendance'),
    path('clear_attendance/', clear_attendance_view, name='clear_attendance'),
    path('task/edit/<int:pk>/', edit_task, name='edit_task'),
    # path('task/delete/<int:pk>/', delete_task, name='delete_task'),
    path('leave_applications/', leave_applications, name='leave_applications'),
    path('holidays/', holidays_view, name='holidays'),
    path('main-leave-page/', main_leave_page, name='main_leave_page'),
    # path('redeem/', redeem_page, name='redeem'),
    path('comp-leave-details/', compensated_leave_details, name='comp_leave_details'),
    path('add_to_total_compensation_leave/', add_to_total_compensation_leave, name='add_to_total_compensation_leave'),
    path('create_task/', create_task, name='create_task'),
    path('task-tracker-selection/', task_tracker_selection, name='task_tracker_selection'),
    path('tasks/', task_dashboard, name='task_dashboard'),
    path('timesheet/', daily_timesheet, name='daily_timesheet'),
    path('user_info_list/', user_info_list, name='user_info_list'),
    path('projects/', project_dashboard, name='project_dashboard'),
    path('calendar1/', MonthlyCalendarView.as_view(), name='monthly_calendar1'),  # Use .as_view()

]
