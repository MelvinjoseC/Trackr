from django.contrib import admin
from .models import (
    EmployeeDetails,
    TrackerTasks,
    ProjectTacker,
    LeaveApplication,
    Attendance,
    Holiday,
    TeamRanking,
)

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


@admin.register(LeaveApplication)
class LeaveApplicationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'username',
        'leave_type',
        'start_date',
        'end_date',
        'status',
        'approver',
        'created_at',
    )
    list_filter = ('status', 'leave_type', 'start_date')
    search_fields = ('username', 'approver', 'reason')
    date_hierarchy = 'start_date'
    ordering = ('-created_at',)
    list_per_page = 25


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'username',
        'date',
        'punch_in',
        'punch_out',
        'break_time',
        'worktime',
        'is_compensated',
        'redeemed',
    )
    list_filter = ('date', 'is_compensated', 'redeemed')
    search_fields = ('username',)
    date_hierarchy = 'date'
    ordering = ('-date',)
    list_per_page = 25


@admin.register(Holiday)
class HolidayAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'date')
    list_filter = ('date',)
    search_fields = ('name',)
    ordering = ('date',)


@admin.register(TeamRanking)
class TeamRankingAdmin(admin.ModelAdmin):
    list_display = (
        'teamid',
        'team_name',
        'date',
        'speed_of_execution',
        'quality_of_work',
        'task_ownership',
    )
    list_filter = ('team_name', 'date')
    search_fields = ('team_name', 'team_member')
    ordering = ('-date',)
