from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password, identify_hasher
from tracker.models import EmployeeDetails

class Command(BaseCommand):
    help = 'Hashes all legacy plain text passwords in employee_details table'

    def handle(self, *args, **options):
        employees = EmployeeDetails.objects.all()
        migrated_count = 0

        for employee in employees:
            password = employee.password
            if not password:
                continue

            # Check if password is already hashed
            # Django hashed passwords usually have format: <algorithm>$<iterations>$<salt>$<hash>
            is_hashed = False
            try:
                identify_hasher(password)
                is_hashed = True
            except ValueError:
                # If ValueError is raised, it's not a recognized hash format, so it's legacy plain text
                is_hashed = False

            if not is_hashed:
                hashed_pw = make_password(password)
                employee.password = hashed_pw
                employee.save(update_fields=['password'])
                self.stdout.write(self.style.SUCCESS(f"Successfully migrated password for user: {employee.name}"))
                migrated_count += 1

        self.stdout.write(self.style.SUCCESS(f"Migration completed. Migrated {migrated_count} legacy passwords."))
