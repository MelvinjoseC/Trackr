from datetime import date
from django.test import TestCase
from tracker.models import TrackerTasks, LeaveApplication, Attendance


class ManagersTestCase(TestCase):
    def setUp(self):
        # Create tasks
        self.task1 = TrackerTasks.objects.create(
            title="Task Alpha",
            projects="Project A",
            assigned="alice",
            task_status="Pending",
            date1=date(2026, 11, 10),
        )
        self.task2 = TrackerTasks.objects.create(
            title="Task Beta",
            projects="Project B",
            assigned="bob",
            task_status="Completed",
            date1=date(2026, 11, 15),
        )

        # Create leave applications
        self.leave_pending = LeaveApplication.objects.create(
            username="alice",
            approver="manager1",
            start_date=date(2026, 11, 20),
            end_date=date(2026, 11, 22),
            reason="Personal",
            leave_type="Casual",
            status="Pending",
        )
        self.leave_approved = LeaveApplication.objects.create(
            username="bob",
            approver="manager1",
            start_date=date(2026, 11, 25),
            end_date=date(2026, 11, 26),
            reason="Sick",
            leave_type="Sick",
            status="Approved",
        )

        # Create attendance
        self.att1 = Attendance.objects.create(
            date=date(2026, 11, 1),
            punch_in="09:00:00",
            punch_out="17:00:00",
            break_time=3600.0,
            worktime=7.0,
            user_id=1,
            username="alice",
        )
        self.att2 = Attendance.objects.create(
            date=date(2026, 10, 15),
            punch_in="09:00:00",
            punch_out="18:00:00",
            break_time=3600.0,
            worktime=8.0,
            user_id=1,
            username="alice",
        )

    def test_tasks_manager_filters(self):
        self.assertEqual(TrackerTasks.objects.for_employee("alice").count(), 1)
        self.assertEqual(TrackerTasks.objects.for_project("Project B").count(), 1)
        self.assertEqual(TrackerTasks.objects.completed().count(), 1)
        self.assertEqual(TrackerTasks.objects.pending().count(), 1)

    def test_tasks_date_range_filter(self):
        in_range = TrackerTasks.objects.for_date_range(date(2026, 11, 1), date(2026, 11, 12))
        self.assertEqual(in_range.count(), 1)
        self.assertEqual(in_range.first().title, "Task Alpha")

    def test_leave_application_manager_status(self):
        self.assertEqual(LeaveApplication.objects.pending().count(), 1)
        self.assertEqual(LeaveApplication.objects.approved().count(), 1)
        self.assertEqual(LeaveApplication.objects.rejected().count(), 0)

    def test_leave_application_overlapping_range(self):
        overlap = LeaveApplication.objects.overlapping_range(date(2026, 11, 21), date(2026, 11, 23))
        self.assertEqual(overlap.count(), 1)
        self.assertEqual(overlap.first().username, "alice")

    def test_attendance_manager_for_month(self):
        nov_records = Attendance.objects.for_month(2026, 11)
        oct_records = Attendance.objects.for_month(2026, 10)
        self.assertEqual(nov_records.count(), 1)
        self.assertEqual(oct_records.count(), 1)
