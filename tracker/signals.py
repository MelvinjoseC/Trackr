from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import Profile
import logging
from .models import Attendance, Holiday  # Assuming you have a Holiday model
logger = logging.getLogger(__name__)
@receiver(post_save, sender=Attendance)
def update_compensation_status(sender, instance, created, **kwargs):
    logger.debug(f"Processing attendance for {instance.date}: Weekend={instance.date.weekday() >= 5}")
    if created:
        is_weekend = instance.date.weekday() >= 5  # Check if it is Saturday (5) or Sunday (6)
        is_holiday = Holiday.objects.filter(date=instance.date).exists()  # Check if it is a holiday
            # Check if it's not a holiday
            # if not Holiday.objects.filter(date=instance.date).exists():
                # Check the worktime criteria for full or half day compensation
        if is_weekend or is_holiday:
                if instance.worktime >= 9:
                    instance.is_compensated = True
                    instance.save()
                elif instance.worktime >= 4.5:
                    instance.is_compensated = True
                    instance.save()
@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_profile(sender, instance, **kwargs):
    instance.profile.save()

