"""
Reusable pagination and metadata serialization utilities.
"""
from __future__ import annotations
from typing import Any, Callable, Dict, List, Optional
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.http import JsonResponse


def paginate_queryset(
    queryset: Any,
    page: int | str = 1,
    page_size: int | str = 20,
    max_page_size: int = 100,
) -> Dict[str, Any]:
    """
    Paginates a queryset or iterable and returns an enriched dict with
    page items and full pagination metadata.
    """
    try:
        page_size_int = min(max(1, int(page_size)), max_page_size)
    except (ValueError, TypeError):
        page_size_int = 20

    try:
        page_int = max(1, int(page))
    except (ValueError, TypeError):
        page_int = 1

    paginator = Paginator(queryset, page_size_int)

    try:
        page_obj = paginator.page(page_int)
    except PageNotAnInteger:
        page_obj = paginator.page(1)
    except EmptyPage:
        # If requested page is past the end, return the last page
        page_obj = paginator.page(paginator.num_pages) if paginator.num_pages > 0 else []

    items = list(page_obj.object_list) if hasattr(page_obj, "object_list") else []

    return {
        "items": items,
        "pagination": {
            "total_items": paginator.count,
            "total_pages": paginator.num_pages,
            "current_page": page_obj.number if hasattr(page_obj, "number") else 1,
            "page_size": page_size_int,
            "has_next": page_obj.has_next() if hasattr(page_obj, "has_next") else False,
            "has_previous": page_obj.has_previous() if hasattr(page_obj, "has_previous") else False,
        },
    }


def paginated_api_response(
    paginated_data: Dict[str, Any],
    item_transform: Optional[Callable[[Any], Dict[str, Any]]] = None,
    extra_meta: Optional[Dict[str, Any]] = None,
) -> JsonResponse:
    """
    Returns a standardized JsonResponse wrapping paginated results.
    """
    items = paginated_data.get("items", [])
    if item_transform:
        serialized_items = [item_transform(item) for item in items]
    else:
        serialized_items = [
            item.to_dict() if hasattr(item, "to_dict") else item
            for item in items
        ]

    response_payload = {
        "success": True,
        "results": serialized_items,
        "pagination": paginated_data.get("pagination", {}),
    }

    if extra_meta:
        response_payload["meta"] = extra_meta

    return JsonResponse(response_payload)
