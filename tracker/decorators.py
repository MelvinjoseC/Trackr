from functools import wraps
from django.http import JsonResponse
from django.shortcuts import redirect


def is_ajax_or_api(request):
    """Detect whether a request is an API or AJAX request."""
    return (
        request.headers.get('x-requested-with') == 'XMLHttpRequest'
        or request.path.startswith('/api/')
        or 'application/json' in request.headers.get('accept', '')
        or request.content_type == 'application/json'
    )


def login_required_session(redirect_url='login'):
    """
    Decorator to ensure user has an active session.
    Returns 401 JSON error for API requests or redirects to login for HTML views.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.session.get('user_id'):
                if is_ajax_or_api(request):
                    return JsonResponse({"error": "User not logged in."}, status=401)
                return redirect(redirect_url)
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator


def role_required_session(allowed_roles, redirect_url='login'):
    """
    Decorator to restrict access to specific session roles (e.g. ['admin', 'md']).
    """
    if isinstance(allowed_roles, str):
        allowed_roles = [allowed_roles]
    allowed_roles = [role.lower() for role in allowed_roles]

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            user_id = request.session.get('user_id')
            if not user_id:
                if is_ajax_or_api(request):
                    return JsonResponse({"error": "User not logged in."}, status=401)
                return redirect(redirect_url)

            role = (request.session.get('authentication') or '').strip().lower()
            if role not in allowed_roles:
                if is_ajax_or_api(request):
                    return JsonResponse({"error": "Permission denied. Insufficient privileges."}, status=403)
                return redirect(redirect_url)

            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator


def admin_required_session(view_func):
    """Shortcut decorator for admin and MD roles."""
    return role_required_session(['admin', 'md'])(view_func)
