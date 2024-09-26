from datetime import timezone

from django.contrib.auth.models import User
from django.db import models

class Holiday(models.Model):
    name = models.CharField(max_length=255)
    date = models.DateField()

    def __str__(self):
        return f"{self.name} ({self.date})"
from datetime import timedelta
from django.db import models
from django.contrib.auth.models import User

# # models.py
# from django.contrib.auth.models import AbstractUser
# from django.db import models
#
# class CustomUser(AbstractUser):
#     role = models.CharField(max_length=100, blank=True, null=True)
#     date_of_joining = models.DateField(blank=True, null=True)
#
#     # Add related_name to avoid clashes with Django's default User model
#     groups = models.ManyToManyField(
#         'auth.Group',
#         related_name='customuser_set',  # Customize the related name here
#         blank=True,
#         help_text='The groups this user belongs to.',
#         verbose_name='groups',
#     )
#     user_permissions = models.ManyToManyField(
#         'auth.Permission',
#         related_name='customuser_set_permissions',  # Customize the related name here
#         blank=True,
#         help_text='Specific permissions for this user.',
#         verbose_name='user permissions',
#     )

class Attendance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    punch_in = models.TimeField()
    punch_out = models.TimeField()
    break_time = models.DurationField()  # DurationField to store break time
    worktime = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # Total work time in hours
    is_compensated = models.BooleanField(default=False)  # Track if the day is compensated
    redeemed = models.BooleanField(default=False)  # Track if the leave is redeemed

    def __str__(self):
        return f"{self.user} - {self.date} - {self.worktime} hrs"

    def calculate_worktime(self):
        punch_in_time = timedelta(hours=self.punch_in.hour, minutes=self.punch_in.minute)
        punch_out_time = timedelta(hours=self.punch_out.hour, minutes=self.punch_out.minute)
        work_duration = punch_out_time - punch_in_time - self.break_time
        work_duration_hours = work_duration.total_seconds() / 3600
        return round(work_duration_hours, 2)

    def save(self, *args, **kwargs):
        self.worktime = self.calculate_worktime()
        super().save(*args, **kwargs)


    def __str__(self):
        return f"{self.user} - {self.date} - {self.worktime} hrs"

class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    description = models.TextField()

    def __str__(self):
        return f"{self.user} - {self.date} - {self.description}"

# # models.py
# from django.db import models
# from django.contrib.auth.models import User
#
# class Timesheet(models.Model):
#     LIST_TYPES = [
#         ('PIPING','PIPING'),
#         ('STRUCTURAL','STRUCTURAL'),
#         ('CALCULATION','CALCULATION'),
#         ('LIFTING & RIGGING', 'LIFTING & RIGGING'),
#         ('MARINE ENGINEERING', 'MARINE ENGINEERING'),
#         ('GENERAL', 'GENERAL'),
#         ('ANIMATION', 'ANIMATION'),
#         ('EPLAN', 'EPLAN'),
#         ('ADMIN & IT', 'ADMIN & IT'),
#         ('DEVELOPERS', 'DEVELOPERS'),
#         ('ACCOUNTS', 'ACCOUNTS'),
#     ]
#     SCOPE_TYPES = [
#         ('FRONT END', 'FRONT END'),
#         ('BACK END', 'BACK END'),
#         ('PLANNING', 'PLANNING'),
#     ]
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     select_date = models.DateField()
#     select_list = models.CharField(max_length=100, choices=LIST_TYPES)
#     project = models.CharField(max_length=100)
#     scope = models.CharField(max_length=100, choices=SCOPE_TYPES)
#     task = models.CharField(max_length=100)
#     phase = models.CharField(max_length=100)
#     phase_status = models.CharField(max_length=100)
#     hours = models.DecimalField(max_digits=5, decimal_places=2)
#
#     def __str__(self):
#         return f"{self.user.username} - {self.project} - {self.task}"

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    compensation_leaves = models.IntegerField(default=15)
    balance_leaves = models.IntegerField(default=15)
    total_leave_allowance = models.IntegerField(default=30)

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class LeaveApplication(models.Model):
    LEAVE_TYPES = [
        ('Full Day', 'Full Day'),
        ('Half Day', 'Half Day'),
        ('WFH', 'WFH'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applied_leaves')
    approver = models.ForeignKey(User, on_delete=models.CASCADE, default=1, related_name='approved_leaves')
    start_date = models.DateField()
    end_date = models.DateField()
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPES)
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending',null=True, blank=True)
    def __str__(self):
        return f"{self.user.username} - {self.leave_type} - {self.start_date} to {self.end_date}"


from django.db import models

class Tasks(models.Model):
    PROJECT_TYPES = [
        ('WEB APP', 'WEB APP'),
        ('TASK TRACKER', 'TASK TRACKER'),
        ('EXCEL CODING', 'EXCEL CODING'),
        ('LEAVE APP', 'LEAVE APP'),
        ('ATTENDANCE APP', 'ATTENDANCE APP'),
    ]
    SCOPE_TYPES = [
        ('FRONT END', 'FRONT END'),
        ('BACK END', 'BACK END'),
        ('PLANNING', 'PLANNING'),
    ]
    PRIORITY_TYPES = [
        ('LOW', 'LOW'),
        ('HIGH', 'HIGH'),
        ('NORMAL', 'NORMAL'),
    ]
    CATEGORY_TYPES = [
        ('DEVELOPERS', 'DEVELOPERS'),
        ('PLANNING', 'PLANNING'),
    ]
    STATUS_TYPES = [
        ('VERIFIED', 'VERIFIED'),
        ('NOT VERIFIED', 'NOT VERIFIED'),
        ('N/A', 'N/A'),
        ('PENDING', 'PENDING')
    ]
    TASK_TYPES=[
        ('COMPLETED', 'COMPLETED'),
        ('NOT STARTED', 'NOT STARTED'),
        ('ON HOLD', 'ON HOLD'),
        ('IN PROCESS', 'IN PROCESS'),
        ('QC-2 UPDATES', 'QC-2 UPDATES'),
        ('QC-3 UPDATES', 'QC-3 UPDATES'),
        ('UPDATES POST SUBMISSION', 'UPDATES POST SUBMISSION'),
        ('QUALITY CHECKS', 'QUALITY CHECKS'),


    ]
    Title = models.CharField(max_length=100)
    project = models.CharField(max_length=30, choices=PROJECT_TYPES)
    scope = models.CharField(max_length=100, choices=SCOPE_TYPES)
    priority = models.CharField(max_length=50, choices=PRIORITY_TYPES)
    assigned_to = models.CharField(max_length=100)
    checker = models.CharField(max_length=100)
    qc_3_checker = models.CharField(max_length=100)
    group = models.CharField(max_length=100)
    category = models.CharField(max_length=100, choices=CATEGORY_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    verification_status = models.CharField(max_length=50, choices=STATUS_TYPES)
    task_status = models.CharField(max_length=50, choices=TASK_TYPES)

    def __str__(self):
        return self.project


