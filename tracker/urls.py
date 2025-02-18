from django.urls import path
from . import views

urlpatterns = [
    path("", views.login, name="login"),
    path("task_dashboard/", views.task_dashboard, name="task_dashboard"),
    path("sign_up/", views.sign_up, name="sign_up"),
    path(
        "save_employee_details/",
        views.save_employee_details,
        name="save_employee_details",
    ),
    path(
        "api/task_dashboard/", views.task_dashboard_api, name="task_dashboard_api"
    ),  # New API endpoint
    path("api/create-task/", views.create_task, name="create_task"),
    path("api/edit-task/", views.edit_task, name="edit_task"),
    path("api/submit_timesheet/", views.submit_timesheet, name="submit_timesheet"),
    path("calendar/", views.attendance_calendar, name="calendar"),
]
