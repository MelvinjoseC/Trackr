# tracker/forms.py
from django.contrib.auth.models import User

# forms.py
from django import forms
from .models import TrackerTasks

class ProjectStatusUpdateForm(forms.Form):
    projects = forms.ChoiceField(choices=[(project, project) for project in TrackerTasks.objects.values_list('projects', flat=True).distinct()])
    project_status = forms.ChoiceField(choices=[('Completed', 'Completed'), ('In Progress', 'In Progress'), ('Paused', 'Paused')])

