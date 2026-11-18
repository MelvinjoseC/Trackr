from datetime import date, time
from decimal import Decimal
from django.test import TestCase
from tracker.models import Attendance
from tracker.services.attendance_service import AttendanceService


class AttendanceServiceTestCase(TestCase):
    def test_calculate_shift_hours_standard(self):
        # 09:00 to 18:00 (9 hours) with 1 hour break (3600s) = 8.00 hours
        hours = AttendanceService.calculate_shift_hours(
            punch_in=time(9, 0),
            punch_out=time(18, 0),
            break_seconds=3600.0,
        )
        self.assertEqual(hours, Decimal("8.00"))

    def test_calculate_shift_hours_overnight_shift(self):
        # 22:00 to 06:00 next day (8 hours) with 1800s break (0.5 hour) = 7.50 hours
        hours = AttendanceService.calculate_shift_hours(
            punch_in="22:00:00",
            punch_out="06:00:00",
            break_seconds=1800.0,
        )
        self.assertEqual(hours, Decimal("7.50"))

    def test_record_attendance_create_and_update(self):
        rec = AttendanceService.record_attendance(
            username="david_kim",
            user_id=101,
            date_val=date(2026, 11, 10),
            punch_in="09:30:00",
            punch_out="17:30:00",
            break_seconds=1800.0,
        )
        self.assertIsNotNone(rec.id)
        self.assertEqual(rec.worktime, Decimal("7.50"))

        # Updating same day
        updated = AttendanceService.record_attendance(
            username="david_kim",
            user_id=101,
            date_val=date(2026, 11, 10),
            punch_in="09:00:00",
            punch_out="18:00:00",
            break_seconds=3600.0,
        )
        self.assertEqual(rec.id, updated.id)
        self.assertEqual(updated.worktime, Decimal("8.00"))

    def test_get_monthly_attendance_summary(self):
        # Seed 2 attendance days
        AttendanceService.record_attendance(
            username="sarah_connor",
            user_id=202,
            date_val=date(2026, 11, 1),
            punch_in="09:00",
            punch_out="17:00",
            break_seconds=0.0,
            is_compensated=1,
        )
        AttendanceService.record_attendance(
            username="sarah_connor",
            user_id=202,
            date_val=date(2026, 11, 2),
            punch_in="09:00",
            punch_out="19:00",
            break_seconds=3600.0,
            is_compensated=0,
        )

        summary = AttendanceService.get_monthly_attendance_summary("sarah_connor", 2026, 11)
        self.assertEqual(summary["total_days_worked"], 2)
        # Day 1: 8.0, Day 2: 9.0 -> 17.0 total
        self.assertEqual(summary["total_hours"], 17.0)
        self.assertEqual(summary["average_daily_hours"], 8.5)
        self.assertEqual(summary["compensated_days"], 1)
