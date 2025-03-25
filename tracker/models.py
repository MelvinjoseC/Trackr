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
    task_id = models.AutoField(primary_key=True)
    d_no = models.IntegerField(null=True, blank=True)
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
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    group_assigned = models.CharField(max_length=255, null=True, blank=True)
    assignee = models.CharField(max_length=255, null=True, blank=True)
    checker = models.CharField(max_length=255, null=True, blank=True)
    qc_3_checker = models.CharField(max_length=255, null=True, blank=True)
    review_3d = models.TextField(null=True, blank=True)
    qc_1_status = models.CharField(max_length=50, null=True, blank=True)
    qc_2_status = models.CharField(max_length=50, null=True, blank=True)
    qc_3_status = models.CharField(max_length=50, null=True, blank=True)
    verification_status = models.BooleanField(default=False)
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
    task_benchmark = models.TextField(null=True, blank=True)
    mail_no = models.CharField(max_length=50, null=True, blank=True)
    ref_no = models.CharField(max_length=50, null=True, blank=True)
    list = models.CharField(max_length=50, null=True, blank=True)
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

    class Meta:
        db_table = 'employee_details'  # Custom table name
