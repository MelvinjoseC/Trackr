"""
Custom QuerySets and Model Managers for domain-specific filtering.
"""
from django.db import models
from django.db.models import Q


class TrackerTasksQuerySet(models.QuerySet):
    def for_employee(self, username: str):
        return self.filter(assigned=username)

    def for_project(self, project_name: str):
        return self.filter(projects=project_name)

    def completed(self):
        return self.filter(
            Q(task_status__iexact='completed') |
            Q(project_status__iexact='completed') |
            Q(verification_status__iexact='completed')
        )

    def pending(self):
        return self.exclude(
            Q(task_status__iexact='completed') |
            Q(project_status__iexact='completed') |
            Q(verification_status__iexact='completed')
        )

    def for_date_range(self, start_date, end_date):
        qs = self
        if start_date:
            qs = qs.filter(date1__gte=start_date)
        if end_date:
            qs = qs.filter(date1__lte=end_date)
        return qs


class TrackerTasksManager(models.Manager.from_queryset(TrackerTasksQuerySet)):
    pass


class LeaveApplicationQuerySet(models.QuerySet):
    def pending(self):
        return self.filter(status__iexact='Pending')

    def approved(self):
        return self.filter(status__iexact='Approved')

    def rejected(self):
        return self.filter(status__iexact='Rejected')

    def for_user(self, username: str):
        return self.filter(username=username)

    def overlapping_range(self, start_date, end_date):
        return self.filter(
            start_date__lte=end_date,
            end_date__gte=start_date,
        )


class LeaveApplicationManager(models.Manager.from_queryset(LeaveApplicationQuerySet)):
    pass


class AttendanceQuerySet(models.QuerySet):
    def for_user(self, username: str):
        return self.filter(username=username)

    def for_month(self, year: int, month: int):
        return self.filter(date__year=year, date__month=month)

    def compensated(self):
        return self.filter(is_compensated=1)


class AttendanceManager(models.Manager.from_queryset(AttendanceQuerySet)):
    pass
