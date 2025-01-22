from django.urls import path
from . import views

urlpatterns = [
    
    path('', views.login, name='login'),  # Root URL points to login
     path('task_dashboard/', views.task_dashboard, name='task_dashboard'),  # Task dashboard
]
