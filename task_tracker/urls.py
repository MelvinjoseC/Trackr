"""
URL configuration for task_tracker project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: fromz django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# task_tracker/urls.py

from django.contrib import admin
from django.urls import include, path

from tracker.views import login

# from tracker.views import home_view
from django.urls import include, path

urlpatterns = [
    path('', include('tracker.urls')),  # Replace 'tracker' with your app name
    path('admin/', admin.site.urls),
]



