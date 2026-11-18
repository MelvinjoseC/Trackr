"""
Observability and performance monitoring middlewares.
"""
from __future__ import annotations
import time
import logging
from typing import Callable
from django.http import HttpRequest, HttpResponse

logger = logging.getLogger("tracker.middleware.metrics")

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
