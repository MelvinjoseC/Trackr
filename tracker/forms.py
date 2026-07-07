# tracker/forms.py
from django.contrib.auth.models import User

# forms.py
from django import forms
from .models import TrackerTasks

class ProjectStatusUpdateForm(forms.Form):
    projects = forms.ChoiceField(choices=[])
    project_status = forms.ChoiceField(choices=[('Completed', 'Completed'), ('In Progress', 'In Progress'), ('Paused', 'Paused')])

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        try:
            distinct_projects = TrackerTasks.objects.values_list('projects', flat=True).distinct()
            self.fields['projects'].choices = [(p, p) for p in distinct_projects if p]
        except Exception:
            self.fields['projects'].choices = []

