.PHONY: help install run migrate test lint format clean seed docker-up docker-down

help:
	@echo "Available commands:"
	@echo "  make install     Install production dependencies"
	@echo "  make install-dev Install dev dependencies"
	@echo "  make run         Run development server"
	@echo "  make migrate     Apply database migrations"
	@echo "  make makemigrations Generate migration files"
	@echo "  make test        Execute test suite"
	@echo "  make lint        Run ruff linter"
	@echo "  make format      Format code with ruff/black"
	@echo "  make clean       Remove bytecode and cache files"
	@echo "  make seed        Populate development database"
	@echo "  make docker-up   Start containerized environment"
	@echo "  make docker-down Stop containerized environment"

install:
	pip install -r requirements.txt

install-dev:
	pip install -r requirements.txt -r requirements-dev.txt

run:
	python manage.py runserver

migrate:
	python manage.py migrate

makemigrations:
	python manage.py makemigrations

test:
	python manage.py test tracker

lint:
	ruff check .

format:
	ruff format .

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

seed:
	python manage.py seed_demo_data

docker-up:
	docker compose up -d

docker-down:
	docker compose down
