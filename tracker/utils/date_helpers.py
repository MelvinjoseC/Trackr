"""
Date and calendar helper utilities for timesheet calculations,
leave quota evaluation, and report aggregation.
"""
from __future__ import annotations
from datetime import date, datetime, timedelta
import calendar
from typing import Iterable, Tuple, Optional
from django.utils import timezone


def parse_date_safe(date_val: str | date | datetime | None, fmt: str = "%Y-%m-%d") -> Optional[date]:
    """
    Safely parse a string or datetime-like value into a date object.
    Returns None if parsing fails.
    """
    if date_val is None:
        return None
    if isinstance(date_val, datetime):
        return date_val.date()
    if isinstance(date_val, date):
        return date_val
    if isinstance(date_val, str):
        date_val = date_val.strip()
        if not date_val:
            return None
        for format_pattern in (fmt, "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d"):
            try:
                return datetime.strptime(date_val, format_pattern).date()
            except ValueError:
                continue
    return None


def get_week_boundaries(target_date: Optional[date] = None) -> Tuple[date, date]:
    """
    Returns (start_of_week, end_of_week) for a given date.
    Start of week is Monday, end of week is Sunday.
    """
    if target_date is None:
        target_date = timezone.now().date()
    elif isinstance(target_date, datetime):
        target_date = target_date.date()

    # weekday(): Monday is 0 and Sunday is 6
    start_of_week = target_date - timedelta(days=target_date.weekday())
    end_of_week = start_of_week + timedelta(days=6)
    return start_of_week, end_of_week


def get_month_boundaries(year: Optional[int] = None, month: Optional[int] = None) -> Tuple[date, date]:
    """
    Returns (start_of_month, end_of_month) for the given year and month.
    Defaults to current year/month if not provided.
    """
    today = timezone.now().date()
    yr = year or today.year
    mo = month or today.month

    start_date = date(yr, mo, 1)
    _, last_day = calendar.monthrange(yr, mo)
    end_date = date(yr, mo, last_day)
    return start_date, end_date


def calculate_business_days(
    start_date: date,
    end_date: date,
    holidays: Optional[Iterable[date]] = None,
    include_saturday: bool = False,
) -> int:
    """
    Calculate the number of business working days between start_date and end_date (inclusive).
    Excludes Sundays (and Saturdays if include_saturday is False) and any listed holidays.
    """
    if start_date > end_date:
        return 0

    holiday_set = set(holidays or [])
    business_days = 0
    curr = start_date

    while curr <= end_date:
        weekday = curr.weekday()  # Mon 0 ... Sat 5, Sun 6
        is_weekend = (weekday == 6) or (not include_saturday and weekday == 5)
        if not is_weekend and curr not in holiday_set:
            business_days += 1
        curr += timedelta(days=1)

    return business_days
