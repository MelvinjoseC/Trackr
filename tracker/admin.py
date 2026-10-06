from django.contrib import admin
from .models import EmployeeDetails, TrackerTasks, ProjectTacker

@admin.register(EmployeeDetails)
class EmployeeDetailsAdmin(admin.ModelAdmin):
    list_display = (
        'employee_id',
        'name',
        'designation',
        'team_name',
        'department',
        'authentication',
        'status',
        'date_joined',
    )
    list_filter = ('status', 'authentication', 'department', 'team_name')
    search_fields = ('name', 'email', 'designation', 'team_name')
    ordering = ('name',)
    list_per_page = 25


@admin.register(TrackerTasks)
class TrackerTasksAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'title',
        'projects',
        'category',
        'priority',
        'task_status',
        'assigned',
        'date1',
        'time',
    )
    list_filter = ('task_status', 'priority', 'category', 'projects', 'team')
    search_fields = ('title', 'projects', 'assigned', 'comments', 'scope')
    date_hierarchy = 'date1'
    ordering = ('-date1',)
    list_per_page = 25


@admin.register(ProjectTacker)
class ProjectTrackerAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'status', 'sender_name')
    list_filter = ('status',)
    search_fields = ('name', 'sender_name')
    ordering = ('name',)
