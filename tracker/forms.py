# tracker/forms.py

from .models import Attendance, Task
from django import forms
from django import forms
from datetime import timedelta

from datetime import timedelta
from django import forms


class AttendanceForm(forms.ModelForm):
    class Meta:
        model = Attendance
        fields = ['date', 'punch_in', 'punch_out', 'break_time']
        widgets = {
            'punch_in': forms.TimeInput(format='%H:%M'),
            'punch_out': forms.TimeInput(format='%H:%M'),
            'break_time': forms.TextInput(attrs={'placeholder': 'HH:MM:SS'}),  # Use TextInput for break_time
        }

    def clean_break_time(self):
        break_time = self.cleaned_data.get('break_time')
        print(f"Break time (type): {type(break_time)} - Value: {break_time}")  # Debugging line
        # If break_time is already a timedelta, return it as-is
        if isinstance(break_time, timedelta):
            return break_time

        # Otherwise, handle the case where break_time is a string in the format HH:MM:SS
        try:
            # Parse the break time string
            break_time_parts = break_time.split(':')
            if len(break_time_parts) != 3:
                raise ValueError

            hours, minutes, seconds = map(int, break_time_parts)

            # Validate that all parts are in correct ranges
            if not (0 <= hours <= 23) or not (0 <= minutes < 60) or not (0 <= seconds < 60):
                raise ValueError

            # Convert to timedelta
            return timedelta(hours=hours, minutes=minutes, seconds=seconds)

        except (ValueError, AttributeError):
            raise forms.ValidationError("Break time must be in the format HH:MM:SS.")


class TaskForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = ['date', 'description']

from django import forms
from .models import Tasks

class TaskForms(forms.ModelForm):
    class Meta:
        model = Tasks
        fields = ['project', 'scope', 'priority', 'assigned_to', 'checker', 'qc_3_checker', 'group', 'category', 'start_date', 'end_date', 'verification_status', 'task_status']
        widgets = {
            'start_date': forms.DateInput(attrs={'type': 'date'}),
            'end_date': forms.DateInput(attrs={'type': 'date'}),
        }


from django import forms
from .models import LeaveApplication

class LeaveApplicationForm(forms.ModelForm):
    LEAVE_CHOICES = (
        ('redeemed', 'Compensation Leaves'),
        ('balance', 'Balance Leaves'),
    )

    leave_option = forms.ChoiceField(choices=LEAVE_CHOICES, required=True)
    class Meta:
        model = LeaveApplication
        fields = ['start_date', 'end_date', 'reason', 'leave_type', 'approver', 'leave_option']
        widgets = {
            'leave_type': forms.Select(),
            'approver': forms.Select(),
            'start_date': forms.DateInput(attrs={'type': 'date'}),
            'end_date': forms.DateInput(attrs={'type': 'date'}),
            'reason': forms.Textarea(attrs={'rows': 3}),
        }


# # forms.py
# from django import forms
# from django.contrib.auth.forms import UserCreationForm
# from .models import CustomUser
#
# class CustomUserCreationForm(UserCreationForm):
#     email = forms.EmailField(required=True)  # Email field is required
#
#     class Meta:
#         model = CustomUser  # Use your custom user model
#         fields = ['username', 'email', 'role', 'date_of_joining', 'password1', 'password2']
#
#     def save(self, commit=True):
#         user = super(CustomUserCreationForm, self).save(commit=False)
#         user.email = self.cleaned_data['email']  # Set the email field from form data
#         if commit:
#             user.save()
#         return user
