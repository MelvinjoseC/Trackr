from django.urls import path
from . import views

urlpatterns = [
    path("", views.login, name="login"),
    path("task_dashboard/", views.task_dashboard, name="task_dashboard"),
    path("sign_up/", views.sign_up, name="sign_up"),
    path("save_employee_details/", views.save_employee_details,name="save_employee_details",),
    path("api/task_dashboard/", views.task_dashboard_api, name="task_dashboard_api"),  # New API endpoint
    path("api/create-task/", views.create_task, name="create_task"),
    path("api/edit-task/", views.edit_task, name="edit_task"),
    path("api/submit_timesheet/", views.submit_timesheet, name="submit_timesheet"),
    path("aproove_task/", views.aproove_task, name="aproove_task"),
    path("project-tracker/", views.project_tracker, name="project_tracker"),
    path("task_action/", views.task_action, name="task_action"),
    path("notifications/", views.notifications_view, name="notifications_page"),
    path("check_task_status/", views.check_task_status, name="check_task_status"),
    path("generate-pie-chart/", views.generate_pie_chart, name="generate_pie_chart"),
    path("calendar/", views.attendance_calendar, name="calendar"),
    path('timesheet/get_times_by_date/', views.get_times_by_date, name='get_times_by_date'),
    path('timesheet/get_all_times_by_month/', views.get_all_times_by_month, name='get_all_times_by_month'),
    path('timesheet/get_tasks_by_date/', views.get_tasks_by_date, name='get_tasks_by_date'),
    path('create-project/', views.create_project_view, name='create_project'),
    path('get-admins/', views.get_admins, name='get_admins'),
    path('apply-leave/', views.apply_leave_view, name='apply_leave'),  # ✅ Leave request form submission
    path('get-holidays/', views.get_holidays, name='get_holidays'),
    path("api/leave-applications/", views.leave_application_view, name="leave-applications"),
    path('api/leave-approvals/', views.leave_approvals_view, name='leave_approvals'),
    path('api/update-leave-status/', views.update_leave_status, name='update_leave_status'),
    path("api/check-admin-status/", views.check_admin_status, name="check-admin-status"),
    path("update_task/", views.update_timesheet, name="update_timesheet"),
    path("delete_task/", views.delete_task, name="delete_task"),
    path("get_task_details/", views.get_task_details, name="get_task_details"),
]

