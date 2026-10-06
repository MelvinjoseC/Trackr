from django.contrib import admin
from django.urls import include, path
from tracker.views import health_check

urlpatterns = [
    path('health/', health_check, name='system_health_check'),
    path('', include('tracker.urls')),
    path('admin/', admin.site.urls),
]
