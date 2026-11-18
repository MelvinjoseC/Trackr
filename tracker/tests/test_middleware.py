import json
from django.test import SimpleTestCase, RequestFactory
from django.http import HttpResponse
from tracker.middleware import RequestMetricsMiddleware, GlobalExceptionMiddleware


class MiddlewareTestCase(SimpleTestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_request_metrics_middleware_header(self):
        def sample_view(request):
            return HttpResponse("OK")

        middleware = RequestMetricsMiddleware(sample_view)
        request = self.factory.get("/test/")
        response = middleware(request)

        self.assertEqual(response.status_code, 200)
        self.assertIn("X-Response-Time-ms", response)
        # Header should be numeric float string
        duration = float(response["X-Response-Time-ms"])
        self.assertGreaterEqual(duration, 0.0)

    def test_global_exception_middleware_json_response(self):
        def failing_view(request):
            raise ValueError("Something blew up inside view")

        middleware = GlobalExceptionMiddleware(failing_view)
        request = self.factory.get("/api/data/", HTTP_ACCEPT="application/json")

        try:
            response = middleware(request)
        except ValueError as exc:
            response = middleware.process_exception(request, exc)

        self.assertIsNotNone(response)
        self.assertEqual(response.status_code, 500)

        data = json.loads(response.content.decode("utf-8"))
        self.assertFalse(data["success"])
        self.assertEqual(data["code"], 500)

    def test_global_exception_middleware_html_request_passthrough(self):
        def failing_view(request):
            raise RuntimeError("Database connection timed out")

        middleware = GlobalExceptionMiddleware(failing_view)
        request = self.factory.get("/dashboard/", HTTP_ACCEPT="text/html")

        try:
            response = middleware(request)
        except RuntimeError as exc:
            response = middleware.process_exception(request, exc)

        # For normal HTML requests, process_exception returns None to allow Django 500 handler
        self.assertIsNone(response)
