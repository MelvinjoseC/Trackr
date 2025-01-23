from datetime import timezone
from django.contrib.auth.models import User
from django.db import models
from django.shortcuts import render

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
    iso_verification = models.BooleanField(default=False)
    task_benchmark = models.TextField(null=True, blank=True)

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

    class Meta:
        db_table = 'employee_details'  # Custom table name
