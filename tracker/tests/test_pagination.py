import json
from django.test import SimpleTestCase
from tracker.utils.pagination import paginate_queryset, paginated_api_response


class PaginationTestCase(SimpleTestCase):
    def setUp(self):
        self.sample_items = list(range(1, 55))  # 54 items

    def test_paginate_first_page(self):
        result = paginate_queryset(self.sample_items, page=1, page_size=10)
        self.assertEqual(len(result["items"]), 10)
        self.assertEqual(result["items"], list(range(1, 11)))
        self.assertEqual(result["pagination"]["total_items"], 54)
        self.assertEqual(result["pagination"]["total_pages"], 6)
        self.assertEqual(result["pagination"]["current_page"], 1)
        self.assertTrue(result["pagination"]["has_next"])
        self.assertFalse(result["pagination"]["has_previous"])

    def test_paginate_last_page(self):
        result = paginate_queryset(self.sample_items, page=6, page_size=10)
        self.assertEqual(len(result["items"]), 4)
        self.assertEqual(result["items"], [51, 52, 53, 54])
        self.assertFalse(result["pagination"]["has_next"])
        self.assertTrue(result["pagination"]["has_previous"])

    def test_paginate_page_size_capping(self):
        result = paginate_queryset(self.sample_items, page=1, page_size=500, max_page_size=50)
        self.assertEqual(result["pagination"]["page_size"], 50)
        self.assertEqual(len(result["items"]), 50)

    def test_paginate_invalid_page_inputs(self):
        # String and non-numeric fall back gracefully
        result = paginate_queryset(self.sample_items, page="invalid", page_size="bad")
        self.assertEqual(result["pagination"]["current_page"], 1)
        self.assertEqual(result["pagination"]["page_size"], 20)

    def test_paginate_out_of_bounds_page(self):
        # Request page 99 when there are only 3 pages
        result = paginate_queryset(self.sample_items, page=99, page_size=20)
        self.assertEqual(result["pagination"]["current_page"], 3)
        self.assertEqual(len(result["items"]), 14)

    def test_paginated_api_response_formatting(self):
        data = paginate_queryset([{"id": 1, "name": "Task A"}], page=1, page_size=10)
        response = paginated_api_response(data, item_transform=lambda x: {"key": x["id"]})
        self.assertEqual(response.status_code, 200)

        content = json.loads(response.content.decode("utf-8"))
        self.assertTrue(content["success"])
        self.assertEqual(content["results"], [{"key": 1}])
        self.assertEqual(content["pagination"]["total_items"], 1)
