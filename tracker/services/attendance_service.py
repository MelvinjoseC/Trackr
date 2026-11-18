"""
Attendance domain service managing shift calculations, break deductions,
and monthly work-hour aggregations.
"""
from __future__ import annotations
from typing import Dict, Any, Optional
from datetime import date, time, datetime, timedelta
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.db.models import Sum, Avg, Count
from tracker.models import Attendance


class AttendanceService:
    @staticmethod
    def calculate_shift_hours(
        punch_in: time | str,
        punch_out: time | str,
        break_seconds: float = 0.0,
    ) -> Decimal:
        """
        Computes net working hours after deducting break intervals.
        """
        if isinstance(punch_in, str):
            punch_in = datetime.strptime(punch_in.strip(), "%H:%M:%S" if len(punch_in.strip()) == 8 else "%H:%M").time()
        if isinstance(punch_out, str):
            punch_out = datetime.strptime(punch_out.strip(), "%H:%M:%S" if len(punch_out.strip()) == 8 else "%H:%M").time()

        dummy_today = date(2000, 1, 1)
        dt_in = datetime.combine(dummy_today, punch_in)
        dt_out = datetime.combine(dummy_today, punch_out)

        # Handle night shift (punch out on next calendar day)
        if dt_out < dt_in:
            dt_out += timedelta(days=1)

        duration_seconds = (dt_out - dt_in).total_seconds()
        net_seconds = max(0.0, duration_seconds - float(break_seconds))
        hours = net_seconds / 3600.0

        return Decimal(str(round(hours, 2)))

    @classmethod
    def record_attendance(
        cls,
        username: str,
        user_id: int,
        date_val: date,
        punch_in: time | str,
        punch_out: time | str,
        break_seconds: float = 0.0,
        is_compensated: int = 0,
    ) -> Attendance:
        """
        Creates or updates an employee daily attendance record with calculated worktime.
        """
        worktime = cls.calculate_shift_hours(punch_in, punch_out, break_seconds)

        record, created = Attendance.objects.update_or_create(
            username=username,
            date=date_val,
            defaults={
                "user_id": user_id,
                "punch_in": punch_in,
                "punch_out": punch_out,
                "break_time": float(break_seconds),
                "worktime": worktime,
                "is_compensated": is_compensated,
                "redeemed": 0,
            },
        )
        return record

    @staticmethod
    def get_monthly_attendance_summary(
        username: str,
        year: int,
        month: int,
    ) -> Dict[str, Any]:
        """
        Aggregates monthly attendance hours, shifts attended, and averages.
        """
        records = Attendance.objects.for_user(username).for_month(year, month)
        aggregates = records.aggregate(
            total_hours=Sum('worktime'),
            avg_hours=Avg('worktime'),
            total_days=Count('id'),
        )

        total_hours = aggregates['total_hours'] or Decimal('0.00')
        avg_hours = aggregates['avg_hours'] or 0.0
        total_days = aggregates['total_days'] or 0

        compensated_count = records.compensated().count()

        return {
            "username": username,
            "year": year,
            "month": month,
            "total_days_worked": total_days,
            "total_hours": float(total_hours),
            "average_daily_hours": round(float(avg_hours), 2),
            "compensated_days": compensated_count,
        }
