from datetime import date
from django.test import TestCase
from tracker.models import TrackerTasks
from tracker.services.task_service import TaskService


class TaskServiceTestCase(TestCase):
    def setUp(self):
        self.t1 = TrackerTasks.objects.create(
            title="Backend Migration",
            projects="Phoenix",
            assigned="senior_dev",
            task_status="Completed",
            date1=date(2026, 11, 5),
            time=4.5,
            task_benchmark=4.0,
        )
        self.t2 = TrackerTasks.objects.create(
            title="API Design",
            projects="Phoenix",
            assigned="senior_dev",
            task_status="In Progress",
            date1=date(2026, 11, 8),
            time=3.5,
            task_benchmark=5.0,
        )
        self.t3 = TrackerTasks.objects.create(
            title="UI Polish",
            projects="MobileApp",
            assigned="junior_dev",
            task_status="Pending",
            date1=date(2026, 11, 9),
            time=2.0,
            task_benchmark=2.0,
        )

    def test_get_employee_summary(self):
        summary = TaskService.get_employee_summary("senior_dev")
        self.assertEqual(summary["total_tasks"], 2)
        self.assertEqual(summary["completed_tasks"], 1)
        self.assertEqual(summary["pending_tasks"], 1)
        self.assertEqual(summary["completion_rate"], 50.0)
        self.assertEqual(summary["total_hours"], 8.0)
        self.assertEqual(summary["avg_benchmark"], 4.5)

    def test_get_project_hour_breakdown(self):
        breakdown = TaskService.get_project_hour_breakdown(year=2026, month=11)
        self.assertEqual(len(breakdown), 2)
        # Phoenix has 8.0 hours, MobileApp has 2.0 hours
        self.assertEqual(breakdown[0]["project"], "Phoenix")
        self.assertEqual(breakdown[0]["total_hours"], 8.0)
        self.assertEqual(breakdown[0]["task_count"], 2)
        self.assertEqual(breakdown[1]["project"], "MobileApp")
        self.assertEqual(breakdown[1]["total_hours"], 2.0)

    def test_create_task(self):
        new_task = TaskService.create_task(
            {
                "title": "Code Review",
                "projects": "Phoenix",
                "priority": "High",
                "time": 1.5,
            },
            created_by="tech_lead",
        )
        self.assertIsNotNone(new_task.id)
        self.assertEqual(new_task.assigned, "tech_lead")
        self.assertEqual(new_task.priority, "High")

    def test_update_task_status(self):
        updated = TaskService.update_task_status(
            self.t2.id,
            new_status="Completed",
            comments="Shipped to staging.",
        )
        self.assertEqual(updated.task_status, "Completed")
        self.assertIn("Shipped to staging.", updated.comments)
