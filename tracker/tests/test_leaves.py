import json
from datetime import date, timedelta
from django.test import TestCase, Client
from tracker.models import EmployeeDetails, LeaveApplication, Holiday


class LeaveManagementTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.employee = EmployeeDetails.objects.create(
            name="SarahConnor",
            designation="Security Specialist",
            date_joined=date.today(),
            email="sarah@test.com",
            phone_number="1122334455",
            department="Operations",
            status="Active",
            password="HashedPassword",
            authentication="Employee",
            team_name="Defense",
        )
        self.approver = EmployeeDetails.objects.create(
            name="JohnManager",
            designation="Director",
            date_joined=date.today(),
            email="john@test.com",
            phone_number="9988776655",
            department="Operations",
            status="Active",
            password="HashedPassword",
            authentication="Admin",
            team_name="Defense",
        )

        # Login SarahConnor
        session = self.client.session
        session['user_id'] = self.employee.employee_id
        session['username'] = 'SarahConnor'
        session['authentication'] = 'Employee'
        session.save()

    def test_apply_leave_success(self):
        start_date = (date.today() + timedelta(days=10)).isoformat()
        end_date = (date.today() + timedelta(days=12)).isoformat()
        response = self.client.post('/apply-leave/', {
            'from_date': start_date,
            'to_date': end_date,
            'leave-type': 'Casual Leave',
            'reason': 'Family function',
            'approver': 'JohnManager',
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(LeaveApplication.objects.filter(username='SarahConnor', reason='Family function').exists())

    def test_apply_leave_missing_fields(self):
        response = self.client.post('/apply-leave/', {
            'from_date': '2026-11-01',
            # missing to_date, etc.
        })
        self.assertEqual(response.status_code, 400)

    def test_update_leave_status_api(self):
        leave = LeaveApplication.objects.create(
            start_date=date.today() + timedelta(days=5),
            end_date=date.today() + timedelta(days=7),
            reason="Medical checkup",
            username="SarahConnor",
            approver="JohnManager",
            leave_type="Sick Leave",
            status="Pending",
        )

        response = self.client.post(
            '/api/update-leave-status/',
            data=json.dumps({'id': leave.id, 'status': 'Approved'}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        leave.refresh_from_db()
        self.assertEqual(leave.status, 'Approved')

    def test_delete_leave_application(self):
        leave = LeaveApplication.objects.create(
            start_date=date.today() + timedelta(days=20),
            end_date=date.today() + timedelta(days=22),
            reason="Personal work",
            username="SarahConnor",
            approver="JohnManager",
            leave_type="Casual Leave",
            status="Pending",
        )
        response = self.client.post(f'/leave/delete/{leave.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(LeaveApplication.objects.filter(id=leave.id).exists())

    def test_get_holidays_api(self):
        # Create non-Saturday holiday for current year
        current_year = date.today().year
        Holiday.objects.create(name="Republic Day", date=date(current_year, 1, 26))
        response = self.client.get('/get-holidays/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("holidays", data)
        self.assertTrue(any(h.get('name') == 'Republic Day' for h in data["holidays"]))
