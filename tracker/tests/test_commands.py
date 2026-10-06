from datetime import date
from io import StringIO
from django.core.management import call_command
from django.contrib.auth.hashers import check_password, make_password
from django.test import TestCase
from tracker.models import EmployeeDetails, ProjectTacker, Holiday


class ManagementCommandsTests(TestCase):
    def test_hash_legacy_passwords_command(self):
        # Plain text password user
        plain_user = EmployeeDetails.objects.create(
            name="Legacy User",
            designation="Tester",
            date_joined=date.today(),
            email="legacy@example.com",
            phone_number="1112223334",
            department="QA",
            status="Active",
            password="my_plain_text_password",
            authentication="Employee",
            team_name="Testing",
        )

        # Pre-hashed password user
        hashed_password = make_password("secure_pass_456")
        prehashed_user = EmployeeDetails.objects.create(
            name="Modern User",
            designation="Developer",
            date_joined=date.today(),
            email="modern@example.com",
            phone_number="5556667778",
            department="Dev",
            status="Active",
            password=hashed_password,
            authentication="Employee",
            team_name="Dev",
        )

        out = StringIO()
        call_command("hash_legacy_passwords", stdout=out)
        output = out.getvalue()

        plain_user.refresh_from_db()
        prehashed_user.refresh_from_db()

        self.assertTrue(check_password("my_plain_text_password", plain_user.password))
        self.assertTrue(check_password("secure_pass_456", prehashed_user.password))
        self.assertIn("Migrated 1 legacy passwords", output)

    def test_seed_demo_data_command(self):
        out = StringIO()
        call_command("seed_demo_data", stdout=out)
        output = out.getvalue()

        self.assertIn("Successfully completed seeding demo data", output)
        self.assertTrue(EmployeeDetails.objects.filter(name="Admin User").exists())
        self.assertTrue(ProjectTacker.objects.filter(name="Trackr Platform").exists())
        self.assertTrue(Holiday.objects.filter(name="New Year Day").exists())
