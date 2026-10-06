from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from tracker.models import EmployeeDetails, TrackerTasks, ProjectTacker, Holiday


class Command(BaseCommand):
    help = 'Seeds initial demo data (employees, projects, tasks, holidays) for development'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Seeding demo data...'))

        # 1. Seed Admin Employee
        admin_user, created = EmployeeDetails.objects.get_or_create(
            name='Admin User',
            defaults={
                'designation': 'Engineering Lead',
                'date_joined': date.today() - timedelta(days=365),
                'email': 'admin@example.com',
                'phone_number': '1234567890',
                'department': 'Engineering',
                'status': 'Active',
                'password': make_password('Admin@123'),
                'authentication': 'Admin',
                'team_name': 'Core',
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created admin user: {admin_user.name}'))
        else:
            self.stdout.write(f'Admin user already exists: {admin_user.name}')

        # 2. Seed Developer Employee
        dev_user, created = EmployeeDetails.objects.get_or_create(
            name='Dev Engineer',
            defaults={
                'designation': 'Software Engineer',
                'date_joined': date.today() - timedelta(days=180),
                'email': 'dev@example.com',
                'phone_number': '0987654321',
                'department': 'Development',
                'status': 'Active',
                'password': make_password('Dev@123'),
                'authentication': 'Employee',
                'team_name': 'Frontend',
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created developer user: {dev_user.name}'))
        else:
            self.stdout.write(f'Developer user already exists: {dev_user.name}')

        # 3. Seed Sample Project
        project, created = ProjectTacker.objects.get_or_create(
            name='Trackr Platform',
            defaults={
                'status': 'Approved',
                'sender_name': 'Admin User',
                'to_aproove': ['Core', 'Engineering'],
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created project: {project.name}'))

        # 4. Seed Sample Task
        task, created = TrackerTasks.objects.get_or_create(
            title='Implement REST API Health Checks',
            projects='Trackr Platform',
            defaults={
                'scope': 'Backend Architecture',
                'priority': 'High',
                'category': 'Development',
                'task_status': 'In Progress',
                'start': date.today() - timedelta(days=2),
                'end': date.today() + timedelta(days=5),
                'assigned': 'Dev Engineer',
                'checker': 'Admin User',
                'task_benchmark': 8.0,
                'time': 4.5,
                'team': 'Frontend',
                'date1': date.today(),
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created sample task: {task.title}'))

        # 5. Seed Holidays
        today = date.today()
        holidays_data = [
            ('New Year Day', date(today.year, 1, 1)),
            ('Labor Day', date(today.year, 5, 1)),
            ('Independence Day', date(today.year, 8, 15)),
        ]
        for name, h_date in holidays_data:
            h, created = Holiday.objects.get_or_create(name=name, date=h_date)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created holiday: {h.name} ({h.date})'))

        self.stdout.write(self.style.SUCCESS('Successfully completed seeding demo data!'))
