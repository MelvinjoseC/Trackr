from django.urls import path
from . import views

urlpatterns = [
    path('', views.login, name='login'),
    path('task_dashboard/', views.task_dashboard, name='task_dashboard'),
    path('sign_up/', views.sign_up, name='sign_up'),
    path('save_employee_details/', views.save_employee_details, name='save_employee_details'),
     path('api/task_dashboard/', views.task_dashboard_api, name='task_dashboard_api'),  # New API endpoint
     path('api/create-task/', views.create_task, name='create_task'),
    path('api/edit-task/', views.edit_task, name='edit_task'),
     path('api/submit_timesheet/', views.submit_timesheet, name='submit_timesheet'),
      path('aproove_task/', views.aproove_task, name='aproove_task'),
        path('project-tracker/', views.project_tracker, name='project_tracker'),
     path('task_action/', views.task_action, name='task_action'),
    path('notifications/', views.notifications_view, name='notifications_page'),
    path('check_task_status/', views.check_task_status, name='check_task_status'),
    path('timesheet/get_times_by_date/', views.get_times_by_date, name='get_times_by_date'),
    path('timesheet/get_all_times_by_month/', views.get_all_times_by_month, name='get_all_times_by_month'),
    path('timesheet/get_tasks_by_date/', views.get_tasks_by_date, name='get_tasks_by_date'),
]

