# Docker Setup - Budget App Full Stack

This directory contains Docker configuration for running the complete Budget application stack with Caddy reverse proxy.

## Stack Components

- **Caddy**: Reverse proxy handling routing (port 80/443)
- **Frontend**: React/Vite application served via Nginx
- **Backend**: Rust/Rocket API server
- **PostgreSQL**: Database
- **Adminer**: Database admin interface (optional, debug profile only)

## Quick Start

1. **Set up environment variables:**
   ```bash
   cp .env.docker .env
   # Edit .env and set ROCKET_SECRET_KEY
   # Generate with: openssl rand -base64 32
   ```

2. **Start the stack:**
   ```bash
   docker compose up -d
   ```

3. **Run database migrations:**

   Migrations need to be run manually. You have two options:

   **Option A: Run migrations from your host machine (recommended for development)**
   ```bash
   # Install sqlx-cli if you haven't already
   cargo install sqlx-cli --no-default-features --features rustls,postgres

   # Set DATABASE_URL and run migrations
   export DATABASE_URL=postgres://postgres:example@localhost:5432/budget_db
   cd ../budget
   sqlx migrate run
   ```

   **Option B: Use a temporary container with sqlx-cli**
   ```bash
   # Create a temporary container with sqlx-cli
   docker run --rm --network budget-app_budget-network \
     -v "$(pwd)/../budget/migrations:/migrations" \
     -e DATABASE_URL=postgres://postgres:example@db:5432/budget_db \
     rust:1.84-slim \
     sh -c "apt-get update && apt-get install -y pkg-config libssl-dev && \
            cargo install sqlx-cli --no-default-features --features rustls,postgres && \
            sqlx migrate run --source /migrations"
   ```

4. **Access the application:**
   - Application: http://localhost
   - API: http://localhost/api/v1
   - Health check: http://localhost/health

## Development with Debug Tools

To start the stack with Adminer (database admin):

```bash
docker compose --profile debug up -d
```

Access Adminer at http://localhost:8080

## Architecture

```
                   ┌─────────────┐
                   │    Caddy    │  :80, :443
                   │   (Proxy)   │
                   └──────┬──────┘
                          │
              ┌───────────┴───────────┐
              │                       │
         /api/*                  /* (default)
              │                       │
              ▼                       ▼
     ┌────────────────┐      ┌────────────────┐
     │    Backend     │      │    Frontend    │
     │ Rust/Rocket    │      │  React/Nginx   │
     │     :8000      │      │      :80       │
     └────────┬───────┘      └────────────────┘
              │
              ▼
     ┌────────────────┐
     │   PostgreSQL   │
     │     :5432      │
     └────────────────┘
```

## Commands

### Build and start all services
```bash
docker compose up -d --build
```

### Stop all services
```bash
docker compose down
```

### Stop and remove volumes (WARNING: deletes database data)
```bash
docker compose down -v
```

### View logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f caddy
```

### Restart a service
```bash
docker compose restart backend
```

### Rebuild a specific service
```bash
docker compose up -d --build backend
```

### Execute commands in a container
```bash
# Backend shell
docker compose exec backend sh

# Database shell
docker compose exec db psql -U postgres -d budget_db
```

## Configuration

### Backend Configuration
Backend configuration is done via environment variables in the `docker-compose.yaml` file. Key settings:

- `DATABASE_URL`: PostgreSQL connection string
- `BUDGET_CORS__ALLOWED_ORIGINS`: Frontend origin for CORS
- `ROCKET_SECRET_KEY`: Required for sessions (set in .env)

### Frontend Build-Time Configuration
If your frontend needs build-time environment variables (API URL, etc.), add them to the frontend service in `docker-compose.yaml`:

```yaml
frontend:
  build:
    context: .
    dockerfile: Dockerfile
    args:
      VITE_API_URL: http://localhost/api/v1
```

And update the Dockerfile to use them during build.

### Caddy Configuration
Edit `Caddyfile` to customize routing, add HTTPS with automatic certificates, or configure additional domains:

```caddyfile
example.com {
    reverse_proxy frontend:80
}

api.example.com {
    reverse_proxy backend:8000
}
```

## Production Considerations

1. **HTTPS/TLS**: Caddy can automatically obtain Let's Encrypt certificates. Update the Caddyfile with your domain:
   ```caddyfile
   example.com {
       # Caddy will automatically handle HTTPS
       handle /api/* {
           reverse_proxy backend:8000
       }
       handle {
           reverse_proxy frontend:80
       }
   }
   ```

2. **Secrets**: Use Docker secrets or external secret management instead of .env files:
   ```bash
   echo "my-secret-key" | docker secret create rocket_secret -
   ```

3. **Resource Limits**: Add resource limits to services in docker-compose.yaml:
   ```yaml
   backend:
     deploy:
       resources:
         limits:
           cpus: '1'
           memory: 512M
   ```

4. **Monitoring**: Add health check endpoints and integrate with monitoring tools.

5. **Backups**: Set up automated PostgreSQL backups:
   ```bash
   docker compose exec db pg_dump -U postgres budget_db > backup.sql
   ```

6. **Security**:
   - Change default passwords in `.env`
   - Keep images updated
   - Use non-root users in Dockerfiles
   - Scan images for vulnerabilities: `docker scan budget-backend`

## Troubleshooting

### Services not starting
```bash
# Check service status
docker compose ps

# Check logs for errors
docker compose logs
```

### Database connection issues
```bash
# Verify database is running and healthy
docker compose ps db

# Check database logs
docker compose logs db

# Test connection
docker compose exec backend sh -c 'echo $DATABASE_URL'
```

### Frontend not loading
```bash
# Check if frontend built successfully
docker compose logs frontend

# Verify nginx is serving files
docker compose exec frontend ls -la /usr/share/nginx/html
```

### Permission issues
```bash
# Ensure proper ownership of volumes
docker compose down
docker volume rm budget-app_postgres_data
docker compose up -d
```

## Updating

To update to the latest code:

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose up -d --build
```

## Cleanup

Remove all containers, volumes, and images:

```bash
docker compose down -v --rmi all
```
