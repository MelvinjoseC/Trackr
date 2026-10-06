import json
from datetime import date
from django.test import TestCase, Client
from tracker.models import EmployeeDetails, TrackerTasks, ProjectTracker


class TaskManagementTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = EmployeeDetails.objects.create(
            name="DevUser",
            designation="Developer",
            date_joined=date.today(),
            email="dev@test.com",
            phone_number="1234567890",
            department="Engineering",
            status="Active",
            password="HashedPassword",
            authentication="Employee",
            team_name="Web",
        )
        self.project = ProjectTracker.objects.create(
            name="Phoenix",
            status="Active",
            sender_name="DevUser",
        )
        self.task = TrackerTasks.objects.create(
            title="Setup CI/CD",
            projects="Phoenix",
            scope="DevOps",
            priority="High",
            category="Infrastructure",
            task_status="In Progress",
            start=date.today(),
            end=date.today(),
            assigned="DevUser",
            task_benchmark=5.0,
            time=2.0,
            team="Web",
            date1=date.today(),
        )

    def test_task_dashboard_unauthenticated_redirects(self):
        response = self.client.get('/task_dashboard/')
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, '/')

    def test_task_dashboard_authenticated(self):
        session = self.client.session
        session['user_id'] = self.user.employee_id
        session['username'] = 'DevUser'
        session['authentication'] = 'Employee'
        session.save()

        response = self.client.get('/task_dashboard/')
        self.assertEqual(response.status_code, 200)

    def test_create_task_api(self):
        payload = {
            "taskData": {
                "assigned_to": "DevUser",
                "checker": "DevUser",
                "qc_3_checker": "DevUser",
                "verification_status": "Pending",
                "task_status": "In Progress",
            },
            "tasks": [
                {
                    "title": "New Automated Test",
                    "projects": "Phoenix",
                    "scope": "QA",
                    "category": "Testing",
                    "task_benchmark": 4.0,
                    "d_no": "D-101",
                    "rev": "0",
                    "start": "2026-10-06",
                    "end": "2026-10-07",
                }
            ]
        }
        response = self.client.post(
            '/api/create-task/',
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(TrackerTasks.objects.filter(title="New Automated Test").exists())

    def test_get_task_by_title_project_scope_api(self):
        response = self.client.get('/api/get-task-edit/', {
            'title': 'Setup CI/CD',
            'project': 'Phoenix',
            'scope': 'DevOps',
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get('title'), 'Setup CI/CD')
        self.assertEqual(data.get('project'), 'Phoenix')

    def test_delete_task_api(self):
        response = self.client.get('/delete_task/', {'task_id': self.task.id})
        self.assertEqual(response.status_code, 200)
        self.assertFalse(TrackerTasks.objects.filter(id=self.task.id).exists())

    def test_get_projects_api(self):
        response = self.client.get('/get-projects/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("projects", data)
        self.assertIn("Phoenix", data["projects"])
