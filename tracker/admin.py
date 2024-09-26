# tracker/admin.py

from django.contrib import admin
from .models import Attendance, Task, LeaveApplication
from .models import Holiday

admin.site.register(Holiday)

# Register your models here.
admin.site.register(Attendance)
admin.site.register(Task)
admin.site.register(LeaveApplication)
# # admin.py
# from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin
# from .models import CustomUser
#
# class CustomUserAdmin(UserAdmin):
#     model = CustomUser
#     list_display = ['username', 'email', 'role', 'date_of_joining', 'is_staff']
#
# admin.site.register(CustomUser, CustomUserAdmin)
