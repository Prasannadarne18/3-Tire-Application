# Deployment Guide

## Docker Compose (single server)

```bash
cp .env.example .env
# Set strong POSTGRES_PASSWORD before deploying!
docker compose up -d --build
docker compose logs -f          # tail logs
docker compose down             # stop
```

## Health Checks

- Backend:  http://localhost:8080/actuator/health
- Frontend: http://localhost:3000
- Database: `docker compose exec db pg_isready`

## Scaling (optional)

To run multiple backend instances behind the frontend Nginx:

```yaml
# docker-compose.yml
backend:
  deploy:
    replicas: 2
```

The frontend Nginx will round-robin across them automatically.

## Environment Variables Reference

| Variable            | Default          | Description                  |
|---------------------|------------------|------------------------------|
| POSTGRES_DB         | vanraj_hotel     | Database name                |
| POSTGRES_USER       | vanraj           | Database user                |
| POSTGRES_PASSWORD   | (required)       | Database password            |
| VITE_API_BASE_URL   | /api             | Frontend → backend base path |

## Backup & Restore

```bash
# Backup
docker compose exec db pg_dump -U vanraj vanraj_hotel > backup.sql

# Restore
docker compose exec -T db psql -U vanraj vanraj_hotel < backup.sql
```
