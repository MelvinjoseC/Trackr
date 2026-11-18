"""
CLI management command to generate aggregated monthly workload and project reports.
"""
import csv
import json
import sys
from datetime import datetime
from django.core.management.base import BaseCommand
from tracker.services.task_service import TaskService


class Command(BaseCommand):
    help = "Generates and exports aggregated monthly workload and project reports in CSV or JSON format."

    def add_arguments(self, parser):
        now = datetime.now()
        parser.add_argument(
            '--year',
            type=int,
            default=now.year,
            help='Report target year (default: current year)',
        )
        parser.add_argument(
            '--month',
            type=int,
            default=now.month,
            help='Report target month (1-12, default: current month)',
        )
        parser.add_argument(
            '--format',
            choices=['csv', 'json'],
            default='json',
            help='Output format (csv or json, default: json)',
        )
        parser.add_argument(
            '--output',
            type=str,
            default=None,
            help='Destination file path. If omitted, outputs to stdout.',
        )

    def handle(self, *args, **options):
        year = options['year']
        month = options['month']
        fmt = options['format']
        output_path = options['output']

        self.stdout.write(f"Compiling project report for {year}-{month:02d}...")
        breakdown = TaskService.get_project_hour_breakdown(year=year, month=month)

        if fmt == 'json':
            content = json.dumps(
                {
                    "year": year,
                    "month": month,
                    "projects": breakdown,
                    "total_hours": round(sum(p['total_hours'] for p in breakdown), 2),
                },
                indent=2,
            )
        else:
            # CSV format
            import io
            str_io = io.StringIO()
            writer = csv.DictWriter(str_io, fieldnames=["project", "total_hours", "task_count"])
            writer.writeheader()
            for row in breakdown:
                writer.writerow(row)
            content = str_io.getvalue()

        if output_path:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(content)
            self.stdout.write(self.style.SUCCESS(f"Successfully saved monthly report to: {output_path}"))
        else:
            self.stdout.write(content)
