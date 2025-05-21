

from .models import ProjectTacker

def pending_task_count(request):
    """
    Provides the number of pending tasks to all templates.
    """
    pending_count = ProjectTacker.objects.filter(status="Pending").count()
    return {
        'pending_count': pending_count
    }
