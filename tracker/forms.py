from django import forms
from django.core.exceptions import ValidationError
from .models import TrackerTasks, EmployeeDetails, LeaveApplication, Attendance


class ProjectStatusUpdateForm(forms.Form):
    projects = forms.ChoiceField(choices=[])
    project_status = forms.ChoiceField(
        choices=[
            ('Completed', 'Completed'),
            ('In Progress', 'In Progress'),
            ('Paused', 'Paused'),
        ]
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        try:
            distinct_projects = TrackerTasks.objects.values_list('projects', flat=True).distinct()
            self.fields['projects'].choices = [(p, p) for p in distinct_projects if p]
        except Exception:
            self.fields['projects'].choices = []


class EmployeeSignUpForm(forms.ModelForm):
    confirm_password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = EmployeeDetails
        fields = [
            'name',
            'designation',
            'email',
            'phone_number',
            'department',
            'team_name',
            'password',
            'authentication',
        ]
        widgets = {
            'password': forms.PasswordInput(),
        }

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        confirm_password = cleaned_data.get('confirm_password')

        if password and confirm_password and password != confirm_password:
            raise forms.ValidationError("Passwords do not match.")
        return cleaned_data


class LeaveApplicationForm(forms.ModelForm):
    class Meta:
        model = LeaveApplication
        fields = ['start_date', 'end_date', 'leave_type', 'reason', 'approver']
        widgets = {
            'start_date': forms.DateInput(attrs={'type': 'date'}),
            'end_date': forms.DateInput(attrs={'type': 'date'}),
            'reason': forms.Textarea(attrs={'rows': 3}),
        }

    def clean(self):
        cleaned_data = super().clean()
        start_date = cleaned_data.get('start_date')
        end_date = cleaned_data.get('end_date')

        if start_date and end_date and end_date < start_date:
            raise forms.ValidationError("End date cannot be prior to start date.")
        return cleaned_data


class TrackerTaskForm(forms.ModelForm):
    class Meta:
        model = TrackerTasks
        fields = [
            'title',
            'projects',
            'scope',
            'priority',
            'category',
            'task_status',
            'start',
            'end',
            'assigned',
            'checker',
            'task_benchmark',
            'time',
            'comments',
        ]
        widgets = {
            'start': forms.DateInput(attrs={'type': 'date'}),
            'end': forms.DateInput(attrs={'type': 'date'}),
        }

    def clean_time(self):
        hours = self.cleaned_data.get('time')
        if hours is not None and hours < 0:
            raise ValidationError("Logged time cannot be negative.")
        return hours

    def clean(self):
        cleaned = super().clean()
        start = cleaned.get('start')
        end = cleaned.get('end')
        if start and end and end < start:
            raise ValidationError("Task end date cannot precede start date.")
        return cleaned


class AttendanceRecordForm(forms.ModelForm):
    class Meta:
        model = Attendance
        fields = ['date', 'punch_in', 'punch_out', 'break_time']
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date'}),
            'punch_in': forms.TimeInput(attrs={'type': 'time'}),
            'punch_out': forms.TimeInput(attrs={'type': 'time'}),
        }

    def clean_break_time(self):
        break_sec = self.cleaned_data.get('break_time')
        if break_sec is not None and break_sec < 0:
            raise ValidationError("Break time cannot be negative.")
        return break_sec


class TaskFilterForm(forms.Form):
    """
    Search and filter validation form for tasks dashboard and project queries.
    """
    project = forms.CharField(required=False, max_length=100)
    assigned = forms.CharField(required=False, max_length=100)
    status = forms.CharField(required=False, max_length=50)
    start_date = forms.DateField(required=False, widget=forms.DateInput(attrs={'type': 'date'}))
    end_date = forms.DateField(required=False, widget=forms.DateInput(attrs={'type': 'date'}))

    def clean(self):
        cleaned = super().clean()
        start = cleaned.get('start_date')
        end = cleaned.get('end_date')
        if start and end and end < start:
            raise forms.ValidationError("Filter start date must precede end date.")
        return cleaned
