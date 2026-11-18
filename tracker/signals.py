import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import LeaveApplication, TrackerTasks, AuditLog

logger = logging.getLogger("tracker.signals")


def record_audit_event(
    action: str,
    target_model: str,
    target_id: str | int | None,
    actor: str = "system",
    details: dict | None = None,
    ip_address: str | None = None,
) -> AuditLog:
    """
    Utility helper to create an AuditLog entry safely without breaking caller execution.
    """
    try:
        return AuditLog.objects.create(
            action=action,
            target_model=target_model,
            target_id=str(target_id) if target_id is not None else None,
            actor=actor,
            details=details or {},
            ip_address=ip_address,
        )
    except Exception as exc:
        logger.error(f"Failed to record audit event: {exc}", exc_info=True)
        return None


@receiver(post_save, sender=LeaveApplication)
def log_leave_application_change(sender, instance, created, **kwargs):
    action = "LEAVE_CREATED" if created else f"LEAVE_UPDATED_{instance.status.upper()}"
    details = {
        "username": instance.username,
        "status": instance.status,
        "leave_type": instance.leave_type,
        "start_date": str(instance.start_date),
        "end_date": str(instance.end_date),
        "approver": instance.approver,
    }
    record_audit_event(
        action=action,
        target_model="LeaveApplication",
        target_id=instance.id,
        actor=instance.approver if not created and instance.approver else instance.username,
        details=details,
    )


@receiver(post_save, sender=TrackerTasks)
def log_task_change(sender, instance, created, **kwargs):
    action = "TASK_CREATED" if created else "TASK_UPDATED"
    details = {
        "title": instance.title,
        "project": instance.projects,
        "assigned": instance.assigned,
        "task_status": instance.task_status,
        "priority": instance.priority,
    }
    record_audit_event(
        action=action,
        target_model="TrackerTasks",
        target_id=instance.id,
        actor=instance.assigned or "system",
        details=details,
    )
