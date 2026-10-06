from datetime import date, time
from django.test import TestCase
from tracker.models import (
    EmployeeDetails,
    TrackerTasks,
    ProjectTacker,
    ProjectTracker,
    LeaveApplication,
    Attendance,
    Holiday,
    TeamRanking,
)


class ModelTests(TestCase):
    def setUp(self):
        self.employee = EmployeeDetails.objects.create(
            name="Alice Smith",
            designation="Backend Engineer",
            date_joined=date(2023, 1, 15),
            email="alice@example.com",
            phone_number="1234567890",
            department="Engineering",
            status="Active",
            password="hashed_pw_test",
            authentication="Admin",
            team_name="Platform",
        )

        self.project = ProjectTracker.objects.create(
            name="Alpha Project",
            status="Active",
            sender_name="Alice Smith",
        )

        self.task = TrackerTasks.objects.create(
            title="Design DB Schema",
            projects="Alpha Project",
            scope="Database",
            priority="High",
            category="Architecture",
            task_status="In Progress",
            start=date(2024, 1, 1),
            end=date(2024, 1, 10),
            assigned="Alice Smith",
            task_benchmark=12.0,
            time=6.0,
            team="Platform",
            date1=date(2024, 1, 5),
            rev="1",
        )

    def test_employee_details_properties(self):
        self.assertTrue(self.employee.is_admin)
        self.assertFalse(self.employee.is_md)
        self.assertTrue(self.employee.is_active)
        self.assertEqual(
            str(self.employee),
            "Alice Smith - Backend Engineer (Platform)",
        )

    def test_tracker_tasks_str(self):
        self.assertEqual(
            str(self.task),
            "[Alpha Project] Design DB Schema (Rev: 1)",
        )

    def test_project_tracker_str_and_alias(self):
        self.assertIs(ProjectTracker, ProjectTacker)
        self.assertEqual(str(self.project), "Alpha Project (Active)")

    def test_leave_application_str(self):
        leave = LeaveApplication.objects.create(
            start_date=date(2024, 2, 1),
            end_date=date(2024, 2, 3),
            reason="Vacation",
            username="Alice Smith",
            approver="Bob Manager",
            leave_type="Casual",
            status="Pending",
        )
        self.assertIn("Leave Application", str(leave))
        self.assertIn("Alice Smith", str(leave))

    def test_attendance_str(self):
        att = Attendance.objects.create(
            date=date(2024, 3, 1),
            punch_in=time(9, 0),
            punch_out=time(17, 0),
            break_time=3600.0,
            worktime=7.0,
            user_id=self.employee.employee_id,
            is_compensated=0,
            redeemed=0,
            username="Alice Smith",
        )
        self.assertEqual(str(att), "Attendance for Alice Smith on 2024-03-01")

    def test_holiday_str(self):
        h = Holiday.objects.create(name="New Year", date=date(2025, 1, 1))
        self.assertEqual(str(h), "New Year on 2025-01-01")

    def test_team_ranking_str(self):
        tr = TeamRanking.objects.create(
            team_name="Core Team",
            team_member="Alice, Bob",
            speed_of_execution=9,
            complaints_of_check_list=1,
            task_ownership=10,
            understanding_task=9,
            quality_of_work=9,
        )
        self.assertIn("Core Team", str(tr))
