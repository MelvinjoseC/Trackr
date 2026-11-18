"""
Observability and performance monitoring middlewares.
"""
from __future__ import annotations
import time
import logging
from typing import Callable
from django.conf import settings
from django.http import HttpRequest, HttpResponse, JsonResponse

logger = logging.getLogger("tracker.middleware.metrics")
error_logger = logging.getLogger("tracker.middleware.exceptions")

SLOW_REQUEST_THRESHOLD_MS = 500.0


class RequestMetricsMiddleware:
    """
    Measures HTTP request execution duration and appends `X-Response-Time-ms`
    header to the response. Warns when processing latency exceeds threshold.
    """
    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        start_time = time.perf_counter()

        response = self.get_response(request)

        duration_ms = (time.perf_counter() - start_time) * 1000.0
        response["X-Response-Time-ms"] = f"{duration_ms:.2f}"

        if duration_ms > SLOW_REQUEST_THRESHOLD_MS:
            logger.warning(
                f"Slow request detected: {request.method} {request.path} "
                f"took {duration_ms:.2f}ms"
            )

        return response


class GlobalExceptionMiddleware:
    """
    Intercepts unhandled server exceptions, logs structured error context,
    and formats JSON responses for AJAX/API consumers.
    """
    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        return self.get_response(request)

    def process_exception(self, request: HttpRequest, exception: Exception) -> HttpResponse | None:
        error_logger.exception(f"Unhandled exception in {request.method} {request.path}: {exception}")

        is_json_request = (
            request.headers.get("x-requested-with") == "XMLHttpRequest"
            or "application/json" in request.headers.get("Accept", "")
            or request.path.startswith("/api/")
        )

        if is_json_request:
            message = str(exception) if settings.DEBUG else "An unexpected internal server error occurred."
            return JsonResponse(
                {
                    "success": False,
                    "error": message,
                    "code": 500,
                },
                status=500,
            )

        return None  # Let standard Django 500 handler render HTML template
