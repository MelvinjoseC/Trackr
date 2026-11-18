"""
Database maintenance command to prune expired user sessions.
"""
from django.core.management.base import BaseCommand
from django.contrib.sessions.models import Session
from django.utils import timezone


class Command(BaseCommand):
    help = "Cleans up expired Django sessions from the database."

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate deletion and show count of expired sessions without deleting them.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        now = timezone.now()

        expired_qs = Session.objects.filter(expire_date__lt=now)
        count = expired_qs.count()

        if dry_run:
            self.stdout.write(self.style.WARNING(f"[DRY-RUN] Found {count} expired sessions eligible for cleanup."))
        else:
            deleted_count, _ = expired_qs.delete()
            self.stdout.write(self.style.SUCCESS(f"Successfully pruned {deleted_count} expired session(s)."))
