from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver



from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ProjectTacker

@receiver(post_save, sender=ProjectTacker)
def update_project_tracker_status(sender, instance, created, **kwargs):
    if created and instance.status == "Pending":
        instance.is_pending = True
        instance.save()
