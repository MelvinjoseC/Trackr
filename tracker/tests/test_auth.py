from datetime import date
from django.test import TestCase, Client
from django.contrib.auth.hashers import make_password, check_password
from tracker.models import EmployeeDetails


class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.hashed_password = make_password("Secret123")
        self.admin_user = EmployeeDetails.objects.create(
            name="JohnAdmin",
            designation="Manager",
            date_joined=date.today(),
            email="admin@test.com",
            phone_number="1234567890",
            department="Operations",
            status="Active",
            password=self.hashed_password,
            authentication="Admin",
            team_name="Mgmt",
        )

        self.legacy_user = EmployeeDetails.objects.create(
            name="LegacyBob",
            designation="Associate",
            date_joined=date.today(),
            email="bob@test.com",
            phone_number="9876543210",
            department="Operations",
            status="Active",
            password="LegacyPlainPassword",
            authentication="Employee",
            team_name="Ops",
        )

    def test_health_check_endpoint(self):
        response = self.client.get('/health/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get('status'), 'healthy')
        self.assertEqual(data.get('database'), 'ok')

    def test_login_page_renders(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)

    def test_login_invalid_credentials(self):
        response = self.client.post('/', {
            'username': 'JohnAdmin',
            'password': 'WrongPassword',
        })
        self.assertEqual(response.status_code, 200)
        # Login failed, session should be empty
        self.assertNotIn('user_id', self.client.session)

    def test_login_success_hashed_user(self):
        response = self.client.post('/', {
            'username': 'JohnAdmin',
            'password': 'Secret123',
        })
        self.assertEqual(response.status_code, 302)
        session = self.client.session
        self.assertEqual(session.get('user_id'), self.admin_user.employee_id)
        self.assertEqual(session.get('username'), 'JohnAdmin')
        self.assertEqual(session.get('authentication'), 'Admin')

    def test_legacy_plain_text_login_migrates_to_hashed(self):
        response = self.client.post('/', {
            'username': 'LegacyBob',
            'password': 'LegacyPlainPassword',
        })
        self.assertEqual(response.status_code, 302)
        self.legacy_user.refresh_from_db()
        self.assertTrue(check_password('LegacyPlainPassword', self.legacy_user.password))

    def test_check_admin_status_logged_in(self):
        # Set session
        session = self.client.session
        session['user_id'] = self.admin_user.employee_id
        session['username'] = 'JohnAdmin'
        session['authentication'] = 'Admin'
        session.save()

        response = self.client.get('/api/check-admin-status/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get('is_admin'))
        self.assertFalse(data.get('is_md'))
