# CMS Monorepo

Monorepo scaffold for a CMS with:

- `apps/web`: Next.js App Router + Tailwind + pnpm
- `backend`: FastAPI + SQLAlchemy + Alembic + Poetry
- root `docker-compose.yml` + `Makefile` for local orchestration

## Structure

```text
apps/
  web/
backend/
  app/
  alembic/
docker-compose.yml
Makefile
pnpm-workspace.yaml
```

## Quick start

1. Copy `.env.example` to `.env`
2. Run `make install`
3. Run `make up`
4. Open `http://localhost:3001` for the web app
5. Open `http://localhost:8001/docs` for the API docs

## Useful commands

- `make install` installs both workspace and backend dependencies
- `make up` starts PostgreSQL, FastAPI, and Next.js via Docker Compose
- `make down` stops the stack
- `make logs` tails all service logs
- `make migrate` runs `alembic upgrade head` locally in `backend`
- `make migration name=create_pages_table` creates a new Alembic revision
- `make shell-api` opens a shell in the Poetry environment
- `make shell-web` opens a shell in `apps/web`

## Current scaffold

- Public landing page at `/`
- Admin placeholder at `/admin`
- API health endpoint at `/health`
- Pages router at `/api/pages`
- Initial Alembic migration for the `pages` table
