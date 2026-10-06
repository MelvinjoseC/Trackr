from django.test import TestCase, RequestFactory
from tracker.context_processors import pending_task_count
from tracker.models import ProjectTacker


class ContextProcessorTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_pending_task_count_empty(self):
        request = self.factory.get('/')
        context = pending_task_count(request)
        self.assertEqual(context, {'pending_count': 0})

    def test_pending_task_count_with_mixed_projects(self):
        ProjectTacker.objects.create(name='P1', status='Pending')
        ProjectTacker.objects.create(name='P2', status='Pending')
        ProjectTacker.objects.create(name='P3', status='Approved')
        ProjectTacker.objects.create(name='P4', status='Rejected')

        request = self.factory.get('/')
        context = pending_task_count(request)
        self.assertEqual(context, {'pending_count': 2})
