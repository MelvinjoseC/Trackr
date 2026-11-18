"""
Leave management service orchestrating conflict detection,
balance checks, and approval lifecycle state transitions.
"""
from __future__ import annotations
from typing import Dict, Any, Optional
from datetime import date
from django.core.exceptions import ValidationError
from tracker.models import LeaveApplication, Holiday
from tracker.utils.date_helpers import calculate_business_days


class LeaveService:
    @staticmethod
    def validate_leave_application(
        username: str,
        start_date: date,
        end_date: date,
        exclude_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Validates date order and prevents overlapping active leave requests.
        Returns duration in working business days.
        """
        if start_date > end_date:
            raise ValidationError("Leave start date cannot be after end date.")

        # Check existing overlapping requests (Pending or Approved)
        conflicts = (
            LeaveApplication.objects
            .for_user(username)
            .exclude(status__iexact='Rejected')
            .filter(start_date__lte=end_date, end_date__gte=start_date)
        )
        if exclude_id:
            conflicts = conflicts.exclude(id=exclude_id)

        if conflicts.exists():
            conflict = conflicts.first()
            raise ValidationError(
                f"Leave overlaps with an existing {conflict.status} application "
                f"from {conflict.start_date} to {conflict.end_date}."
            )

        # Retrieve holidays in that range
        holiday_dates = set(
            Holiday.objects
            .filter(date__range=(start_date, end_date))
            .values_list('date', flat=True)
        )

        working_days = calculate_business_days(
            start_date=start_date,
            end_date=end_date,
            holidays=holiday_dates,
        )

        return {
            "valid": True,
            "working_days": working_days,
            "holiday_count": len(holiday_dates),
        }

    @classmethod
    def apply_leave(
        cls,
        username: str,
        start_date: date,
        end_date: date,
        reason: str,
        leave_type: str,
        approver: str,
    ) -> LeaveApplication:
        """
        Validates business rules and creates a pending leave application.
        """
        cls.validate_leave_application(username, start_date, end_date)

        leave = LeaveApplication.objects.create(
            username=username,
            start_date=start_date,
            end_date=end_date,
            reason=reason.strip(),
            leave_type=leave_type.strip(),
            approver=approver.strip(),
            status="Pending",
        )
        return leave

    @staticmethod
    def update_leave_status(
        leave_id: int,
        new_status: str,
        approver_username: str,
    ) -> LeaveApplication:
        """
        Transitions leave application status (Approved or Rejected).
        """
        valid_statuses = {"Approved", "Rejected", "Pending"}
        normalized_status = new_status.capitalize()
        if normalized_status not in valid_statuses:
            raise ValidationError(f"Invalid status: '{new_status}'. Allowed: {valid_statuses}")

        leave = LeaveApplication.objects.get(id=leave_id)
        leave.status = normalized_status
        leave.approver = approver_username
        leave.save()
        return leave

    @staticmethod
    def get_user_leave_stats(username: str, year: Optional[int] = None) -> Dict[str, Any]:
        """
        Aggregates leave counts and status breakdowns for an employee.
        """
        qs = LeaveApplication.objects.for_user(username)
        if year:
            qs = qs.filter(start_date__year=year)

        total = qs.count()
        pending = qs.pending().count()
        approved = qs.approved().count()
        rejected = qs.rejected().count()

        return {
            "username": username,
            "total_applications": total,
            "pending": pending,
            "approved": approved,
            "rejected": rejected,
        }
