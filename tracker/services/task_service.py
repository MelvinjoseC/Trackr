"""
Task service layer encapsulating timesheet aggregations, project workload,
and task lifecycle operations.
"""
from __future__ import annotations
from typing import Dict, Any, Optional
from datetime import date
from django.db.models import Sum, Count, Avg
from tracker.models import TrackerTasks
from tracker.utils.date_helpers import get_month_boundaries


class TaskService:
    @staticmethod
    def get_employee_summary(
        username: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> Dict[str, Any]:
        """
        Calculates task metrics, total spent hours, and completion rates
        for a designated employee within a date range.
        """
        tasks = TrackerTasks.objects.for_employee(username)
        if start_date:
            tasks = tasks.filter(date1__gte=start_date)
        if end_date:
            tasks = tasks.filter(date1__lte=end_date)

        total_tasks = tasks.count()
        completed_tasks = tasks.completed().count()
        pending_tasks = tasks.pending().count()
        
        aggregates = tasks.aggregate(
            total_hours=Sum('time'),
            avg_benchmark=Avg('task_benchmark'),
        )
        total_hours = aggregates['total_hours'] or 0.0
        avg_benchmark = aggregates['avg_benchmark'] or 0.0

        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0.0

        return {
            "employee": username,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_tasks,
            "completion_rate": round(completion_rate, 2),
            "total_hours": round(float(total_hours), 2),
            "avg_benchmark": round(float(avg_benchmark), 2),
        }

    @staticmethod
    def get_project_hour_breakdown(
        year: Optional[int] = None,
        month: Optional[int] = None,
    ) -> list[Dict[str, Any]]:
        """
        Returns total recorded hours and task counts per project for a given month.
        """
        start_date, end_date = get_month_boundaries(year, month)
        qs = (
            TrackerTasks.objects
            .filter(date1__range=(start_date, end_date))
            .values('projects')
            .annotate(
                total_hours=Sum('time'),
                task_count=Count('id'),
            )
            .order_by('-total_hours')
        )

        results = []
        for row in qs:
            project_name = row['projects'] or "(Unassigned Project)"
            hours = float(row['total_hours'] or 0.0)
            results.append({
                "project": project_name,
                "total_hours": round(hours, 2),
                "task_count": row['task_count'],
            })
        return results

    @staticmethod
    def create_task(data: Dict[str, Any], created_by: Optional[str] = None) -> TrackerTasks:
        """
        Encapsulates task creation with input sanitization and defaults.
        """
        task = TrackerTasks(
            title=data.get('title', '').strip(),
            projects=data.get('projects', '').strip(),
            scope=data.get('scope'),
            category=data.get('category'),
            priority=data.get('priority', 'Medium'),
            assigned=data.get('assigned', created_by or ''),
            checker=data.get('checker', ''),
            task_status=data.get('task_status', 'Pending'),
            date1=data.get('date1') or date.today(),
            time=float(data.get('time', 0.0) or 0.0),
            task_benchmark=float(data.get('task_benchmark', 0.0) or 0.0) if data.get('task_benchmark') else None,
            comments=data.get('comments', ''),
            team=data.get('team', ''),
        )
        task.save()
        return task

    @staticmethod
    def update_task_status(task_id: int, new_status: str, comments: Optional[str] = None) -> TrackerTasks:
        """
        Updates task lifecycle status and appends audit remarks.
        """
        task = TrackerTasks.objects.get(id=task_id)
        task.task_status = new_status
        if comments:
            task.comments = f"{task.comments}\n{comments}".strip() if task.comments else comments
        task.save()
        return task
