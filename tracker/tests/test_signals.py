from datetime import date
from django.test import TestCase
from tracker.models import LeaveApplication, TrackerTasks, AuditLog
from tracker.signals import record_audit_event


class AuditSignalsTestCase(TestCase):
    def test_leave_creation_creates_audit_log(self):
        leave = LeaveApplication.objects.create(
            username="john_doe",
            approver="manager_smith",
            start_date=date(2026, 12, 1),
            end_date=date(2026, 12, 5),
            reason="Vacation",
            leave_type="Annual",
            status="Pending",
        )
        log = AuditLog.objects.filter(target_model="LeaveApplication", target_id=str(leave.id)).first()
        self.assertIsNotNone(log)
        self.assertEqual(log.action, "LEAVE_CREATED")
        self.assertEqual(log.actor, "john_doe")
        self.assertEqual(log.details.get("status"), "Pending")

    def test_leave_update_creates_audit_log(self):
        leave = LeaveApplication.objects.create(
            username="john_doe",
            approver="manager_smith",
            start_date=date(2026, 12, 1),
            end_date=date(2026, 12, 5),
            reason="Vacation",
            leave_type="Annual",
            status="Pending",
        )
        leave.status = "Approved"
        leave.save()

        updated_log = AuditLog.objects.filter(
            target_model="LeaveApplication",
            target_id=str(leave.id),
            action="LEAVE_UPDATED_APPROVED",
        ).first()
        self.assertIsNotNone(updated_log)
        self.assertEqual(updated_log.actor, "manager_smith")

    def test_task_creation_and_update_creates_audit_log(self):
        task = TrackerTasks.objects.create(
            title="Design system audit",
            projects="Core Platform",
            assigned="architect",
            task_status="In Progress",
        )
        create_log = AuditLog.objects.filter(target_model="TrackerTasks", target_id=str(task.id)).first()
        self.assertIsNotNone(create_log)
        self.assertEqual(create_log.action, "TASK_CREATED")
        self.assertEqual(create_log.actor, "architect")

        task.task_status = "Completed"
        task.save()

        update_log = AuditLog.objects.filter(
            target_model="TrackerTasks",
            target_id=str(task.id),
            action="TASK_UPDATED",
        ).first()
        self.assertIsNotNone(update_log)

    def test_manual_record_audit_event_helper(self):
        record = record_audit_event(
            action="AUTH_LOGIN",
            target_model="User",
            target_id=42,
            actor="admin",
            details={"ip": "127.0.0.1"},
            ip_address="127.0.0.1",
        )
        self.assertIsNotNone(record)
        self.assertEqual(record.action, "AUTH_LOGIN")
        self.assertEqual(record.actor, "admin")
