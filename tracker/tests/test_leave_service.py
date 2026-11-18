from datetime import date
from django.test import TestCase
from django.core.exceptions import ValidationError
from tracker.models import LeaveApplication, Holiday
from tracker.services.leave_service import LeaveService


class LeaveServiceTestCase(TestCase):
    def setUp(self):
        self.user = "elena_rostova"
        self.approver = "chief_admin"
        # Existing approved leave from Nov 10 to Nov 12
        self.existing_leave = LeaveApplication.objects.create(
            username=self.user,
            approver=self.approver,
            start_date=date(2026, 11, 10),
            end_date=date(2026, 11, 12),
            reason="Dentist appointment",
            leave_type="Medical",
            status="Approved",
        )
        # Holiday on Nov 18
        Holiday.objects.create(name="Regional Holiday", date=date(2026, 11, 18))

    def test_validate_leave_success_calculates_working_days(self):
        # Mon Nov 16 to Fri Nov 20, with holiday on Wed Nov 18 -> 4 business days
        res = LeaveService.validate_leave_application(
            username=self.user,
            start_date=date(2026, 11, 16),
            end_date=date(2026, 11, 20),
        )
        self.assertTrue(res["valid"])
        self.assertEqual(res["working_days"], 4)
        self.assertEqual(res["holiday_count"], 1)

    def test_validate_leave_inverted_dates_raises_error(self):
        with self.assertRaises(ValidationError) as ctx:
            LeaveService.validate_leave_application(
                username=self.user,
                start_date=date(2026, 11, 20),
                end_date=date(2026, 11, 16),
            )
        self.assertIn("cannot be after", str(ctx.exception))

    def test_validate_leave_overlapping_existing_raises_error(self):
        with self.assertRaises(ValidationError) as ctx:
            LeaveService.validate_leave_application(
                username=self.user,
                start_date=date(2026, 11, 11),
                end_date=date(2026, 11, 15),
            )
        self.assertIn("overlaps", str(ctx.exception).lower())

    def test_apply_leave_creates_pending_record(self):
        new_leave = LeaveService.apply_leave(
            username=self.user,
            start_date=date(2026, 11, 23),
            end_date=date(2026, 11, 25),
            reason="Conference",
            leave_type="Casual",
            approver=self.approver,
        )
        self.assertIsNotNone(new_leave.id)
        self.assertEqual(new_leave.status, "Pending")

    def test_update_leave_status_valid_and_invalid(self):
        updated = LeaveService.update_leave_status(
            self.existing_leave.id,
            new_status="Rejected",
            approver_username="hr_director",
        )
        self.assertEqual(updated.status, "Rejected")
        self.assertEqual(updated.approver, "hr_director")

        with self.assertRaises(ValidationError):
            LeaveService.update_leave_status(
                self.existing_leave.id,
                new_status="UnknownStatus",
                approver_username="hr_director",
            )

    def test_get_user_leave_stats(self):
        stats = LeaveService.get_user_leave_stats(self.user)
        self.assertEqual(stats["total_applications"], 1)
        self.assertEqual(stats["approved"], 1)
        self.assertEqual(stats["pending"], 0)
