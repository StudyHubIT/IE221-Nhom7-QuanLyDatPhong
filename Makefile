SHELL := /bin/bash

.PHONY: install run up down logs migrate migration shell-api shell-web

install:
	pnpm install
	cd backend && poetry install

run:
	docker compose up --build

up:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f

migrate:
	cd backend && poetry run alembic upgrade head

migration:
	@if [ -z "$(name)" ]; then echo "Usage: make migration name=create_pages_table"; exit 1; fi
	cd backend && poetry run alembic revision --autogenerate -m "$(name)"

shell-api:
	cd backend && poetry run bash

shell-web:
	cd apps/web && /bin/sh
