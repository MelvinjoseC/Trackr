from datetime import timezone
from django.contrib.auth.models import User
from django.db import models
from django.shortcuts import render

class ProjectTacker(models.Model):
    name = models.CharField(max_length=45, null=True, blank=True)
    to_aproove = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=45, null=True, blank=True)
    sender_name = models.CharField(max_length=45, null=True, blank=True)  # Added missing field

    class Meta:
        db_table = 'project_tacker'  # Matches the DB table name

class TrackerTasks(models.Model):
    id = models.AutoField(primary_key=True)
    d_no = models.CharField(null=True, blank=True, max_length=50)
    title = models.CharField(max_length=255)
    projects = models.CharField(max_length=255)
    scope = models.TextField(null=True, blank=True)
    rev = models.CharField(max_length=50, null=True, blank=True)
    task_status = models.CharField(max_length=50, null=True, blank=True)
    category = models.CharField(max_length=100, null=True, blank=True)
    priority = models.CharField(
        max_length=50,
        choices=[('Low', 'Low'), ('Medium', 'Medium'), ('High', 'High')],
        default='Medium'
    )
    start = models.DateField(null=True, blank=True)
    end = models.DateField(null=True, blank=True)
    group = models.CharField(max_length=255, null=True, blank=True)
    assigned = models.CharField(max_length=255, null=True, blank=True)
    checker = models.CharField(max_length=255, null=True, blank=True)
    qc3_checker = models.CharField(max_length=255, null=True, blank=True)
    review_3d = models.TextField(null=True, blank=True)
    qc1 = models.CharField(max_length=50, null=True, blank=True)
    qc2 = models.CharField(max_length=50, null=True, blank=True)
    qc3 = models.CharField(max_length=50, null=True, blank=True)
    verification_status = models.CharField(max_length=50, null=True, blank=True)
    phase_1_benchmark = models.CharField(max_length=50, null=True, blank=True)
    phase_2_benchmark = models.CharField(max_length=50, null=True, blank=True)
    phase_3_benchmark = models.CharField(max_length=50, null=True, blank=True)
    phase_4_benchmark = models.CharField(max_length=50, null=True, blank=True)
    phase_5_benchmark = models.CharField(max_length=50, null=True, blank=True)
    phase_6_benchmark = models.CharField(max_length=50, null=True, blank=True)
    phase_7_benchmark = models.CharField(max_length=50, null=True, blank=True)
    phase_8_benchmark = models.CharField(max_length=50, null=True, blank=True)
    phase_9_benchmark = models.CharField(max_length=50, null=True, blank=True)
    phase_10_benchmark = models.CharField(max_length=50, null=True, blank=True)
    task_benchmark = models.FloatField(null=True, blank=True)
    mail_no = models.CharField(max_length=50, null=True, blank=True)
    ref_no = models.CharField(max_length=50, null=True, blank=True)
    list = models.CharField(max_length=50, null=True, blank=True)
    date1 = models.DateField(null=True, blank=True)
    time = models.FloatField(null=True, blank=True)
    comments = models.CharField(max_length=1000, null=True, blank=True)
    project_status = models.CharField(max_length=50, null=True, blank=True)
    team = models.CharField(max_length=50, null=True, blank=True)
    class Meta:
        db_table = 'tracker_project'  # Custom table name

class EmployeeDetails(models.Model):
    employee_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)
    image = models.BinaryField(null=True, blank=True)
    date_joined = models.DateField()
    email = models.EmailField(max_length=150, null=True, blank=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    department = models.CharField(max_length=100, null=True, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(
        max_length=10,
        choices=[('Active', 'Active'), ('Inactive', 'Inactive')],
        default='Active'
    )
    password = models.CharField(max_length=255)
    authentication = models.CharField(max_length=50)
    approval = models.JSONField(null=True, blank=True)  # Added approval field as JSON
    team_name = models.CharField(max_length=50)

    class Meta:
        db_table = 'employee_details'  # Custom table name


from django.db import models

class LeaveApplication(models.Model):
    id = models.AutoField(primary_key=True)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.CharField(max_length=255)
    username = models.CharField(max_length=100)
    approver = models.CharField(max_length=100)
    leave_type = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=50)

    class Meta:
        db_table = 'tracker_leaveapplication'  # Custom table name

    def __str__(self):
        return f"Leave Application {self.id} - {self.username}"

from django.db import models

class Attendance(models.Model):
    # The `id` field is auto-generated as a BIGINT and is the primary key
    id = models.BigAutoField(primary_key=True)  # BIGINT AUTO_INCREMENT field
    
    date = models.DateField()  # Date of attendance
    punch_in = models.TimeField()  # Time for punch-in
    punch_out = models.TimeField()  # Time for punch-out
    break_time = models.FloatField()  # Break time in seconds (FLOAT type in the table)
    worktime = models.DecimalField(max_digits=5, decimal_places=2)  # Total work time in hours
    user_id = models.IntegerField()  # Integer type for user_id
    
    # Use IntegerField for compensation and redeemed flags, where 0 represents False and 1 represents True
    is_compensated = models.IntegerField(default=0)  # Compensation status (0 = False, 1 = True)
    redeemed = models.IntegerField(default=0)  # Whether the attendance is redeemed (0 = False, 1 = True)
    
    username = models.CharField(max_length=45)  # VARCHAR(45) for username
    
    class Meta:
        db_table = 'tracker_attendance'  # Custom table name as per the database

    def __str__(self):
        return f"Attendance for {self.username} on {self.date}"


from django.db import models

class Holiday(models.Model):
    id = models.AutoField(primary_key=True)  # Explicitly defining the ID field
    name = models.CharField(max_length=255)  # Name of the holiday
    date = models.DateField()  # Date of the holiday

    class Meta:
        db_table = 'tracker_holiday'  # Custom table name

    def __str__(self):
        return f"{self.name} on {self.date}"

from django.db import models
from django.utils.timezone import now

class TeamRanking(models.Model):
    teamid = models.AutoField(primary_key=True)
    team_name = models.CharField(max_length=100)
    team_member = models.TextField()
    date = models.DateField(auto_now=True)  # Auto set to current date
    speed_of_execution = models.IntegerField()
    complaints_of_check_list = models.IntegerField()
    task_ownership = models.IntegerField()
    understanding_task = models.IntegerField()
    quality_of_work = models.IntegerField()

    def __str__(self):
        return f"{self.team_name} - {self.date}"
