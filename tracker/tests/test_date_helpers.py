from datetime import date, datetime
from django.test import SimpleTestCase
from tracker.utils.date_helpers import (
    parse_date_safe,
    get_week_boundaries,
    get_month_boundaries,
    calculate_business_days,
)


class DateHelpersTestCase(SimpleTestCase):
    def test_parse_date_safe_valid_iso(self):
        result = parse_date_safe("2026-11-18")
        self.assertEqual(result, date(2026, 11, 18))

    def test_parse_date_safe_various_formats(self):
        self.assertEqual(parse_date_safe("18-11-2026"), date(2026, 11, 18))
        self.assertEqual(parse_date_safe("18/11/2026"), date(2026, 11, 18))
        self.assertEqual(parse_date_safe("2026/11/18"), date(2026, 11, 18))

    def test_parse_date_safe_datetime_and_date(self):
        now = datetime(2026, 5, 10, 14, 30, 0)
        d = date(2026, 5, 10)
        self.assertEqual(parse_date_safe(now), d)
        self.assertEqual(parse_date_safe(d), d)

    def test_parse_date_safe_invalid_and_none(self):
        self.assertIsNone(parse_date_safe(None))
        self.assertIsNone(parse_date_safe(""))
        self.assertIsNone(parse_date_safe("invalid-date-string"))

    def test_get_week_boundaries(self):
        # 2026-11-18 is a Wednesday
        target = date(2026, 11, 18)
        start, end = get_week_boundaries(target)
        self.assertEqual(start, date(2026, 11, 16))  # Monday
        self.assertEqual(end, date(2026, 11, 22))    # Sunday
        self.assertEqual((end - start).days, 6)

    def test_get_month_boundaries(self):
        # February 2024 (leap year)
        start, end = get_month_boundaries(2024, 2)
        self.assertEqual(start, date(2024, 2, 1))
        self.assertEqual(end, date(2024, 2, 29))

        # November 2026
        start, end = get_month_boundaries(2026, 11)
        self.assertEqual(start, date(2026, 11, 1))
        self.assertEqual(end, date(2026, 11, 30))

    def test_calculate_business_days_standard(self):
        # Monday to Friday (5 business days)
        start = date(2026, 11, 16)
        end = date(2026, 11, 20)
        self.assertEqual(calculate_business_days(start, end), 5)

        # Full week including weekend: Mon 16 to Sun 22 (still 5 days)
        full_week = date(2026, 11, 22)
        self.assertEqual(calculate_business_days(start, full_week), 5)

    def test_calculate_business_days_with_holidays(self):
        start = date(2026, 11, 16)
        end = date(2026, 11, 20)
        holidays = [date(2026, 11, 17), date(2026, 11, 19)]
        # 5 - 2 = 3
        self.assertEqual(calculate_business_days(start, end, holidays=holidays), 3)

    def test_calculate_business_days_with_saturdays_included(self):
        start = date(2026, 11, 16)
        end = date(2026, 11, 21)  # Monday through Saturday
        self.assertEqual(calculate_business_days(start, end, include_saturday=True), 6)

    def test_calculate_business_days_inverted_dates(self):
        start = date(2026, 11, 25)
        end = date(2026, 11, 20)
        self.assertEqual(calculate_business_days(start, end), 0)
