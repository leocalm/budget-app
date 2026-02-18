# Docker Setup - PiggyPulse Full Stack

This directory contains Docker configuration for running the complete PiggyPulse application stack with Caddy reverse proxy.

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
   export DATABASE_URL=postgres://postgres:example@localhost:5432/piggy_pulse_db
   cd ../piggy-pulse-api
   sqlx migrate run
   ```

   **Option B: Use a temporary container with sqlx-cli**
   ```bash
   # Create a temporary container with sqlx-cli
   docker run --rm --network piggy-pulse-app_piggy-pulse-network \
     -v "$(pwd)/../piggy-pulse-api/migrations:/migrations" \
     -e DATABASE_URL=postgres://postgres:example@db:5432/piggy_pulse_db \
     rust:1.84-slim \
     sh -c "apt-get update && apt-get install -y pkg-config libssl-dev && \
            cargo install sqlx-cli --no-default-features --features rustls,postgres && \
            sqlx migrate run --source /migrations"
   ```

4. **Access the application:**
    - Application: https://localhost (accepts self-signed cert on first visit)
    - API: https://localhost/api/v1
    - Health check: https://localhost/health
    - Note: HTTP URLs redirect to HTTPS automatically

## HTTPS Setup

The application uses HTTPS by default with self-signed certificates for local development.

### First-Time Access

On first visit to https://localhost, your browser will show a certificate warning. This is expected and safe for local
development.

**To proceed:**

- **Chrome/Edge**: Click "Advanced" → "Proceed to localhost (unsafe)"
- **Firefox**: Click "Advanced" → "Accept the Risk and Continue"
- **Safari**: Click "Show Details" → "visit this website"

### Access URLs

After accepting the certificate:

- Application: https://localhost
- API: https://localhost/api/v1
- Health check: https://localhost/health
- Local network: https://192.168.1.34

HTTP access on port 80 automatically redirects to HTTPS.

### Optional: Trust Caddy's Certificate (Eliminate Browser Warnings)

To eliminate browser warnings, trust Caddy's root CA certificate:

```bash
# 1. Start the stack first
docker compose up -d

# 2. Wait for Caddy to generate certificates
sleep 5

# 3. Extract Caddy's root CA certificate
docker compose cp caddy:/data/caddy/pki/authorities/local/root.crt ./caddy-root-ca.crt

# 4. Trust the certificate on your system

# macOS:
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ./caddy-root-ca.crt

# Linux:
sudo cp ./caddy-root-ca.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates

# Windows (PowerShell as Administrator):
Import-Certificate -FilePath .\caddy-root-ca.crt -CertStoreLocation Cert:\LocalMachine\Root

# 5. Restart your browser

# 6. Clean up
rm ./caddy-root-ca.crt
```

### Disable HTTPS (If Needed)

If you need to revert to HTTP only:

1. Edit `Caddyfile` - add `auto_https off` in global options and change `:443` to `:80`
2. Edit `docker-compose.yaml`:
    - Change CORS origins from `https://` to `http://`
    - Change `PIGGY_PULSE_SESSION__COOKIE_SECURE: "false"`
3. Restart: `docker compose down && docker compose up -d`

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
docker compose exec db psql -U postgres -d piggy_pulse_db
```

## Configuration

### Backend Configuration

Backend configuration is done via environment variables in the `docker-compose.yaml` file. Key settings:

- `DATABASE_URL`: PostgreSQL connection string
- `PIGGY_PULSE_CORS__ALLOWED_ORIGINS`: Frontend origin for CORS
- `ROCKET_SECRET_KEY`: Required for sessions (set in .env)

### Frontend Build-Time Configuration

If your frontend needs build-time environment variables (API URL, etc.), add them to the frontend service in
`docker-compose.yaml`:

```yaml
frontend:
  build:
    context: .
    dockerfile: Dockerfile
    args:
      VITE_API_URL: https://localhost/api/v1
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
   docker compose exec db pg_dump -U postgres piggy_pulse_db > backup.sql
   ```

6. **Security**:
    - Change default passwords in `.env`
    - Keep images updated
    - Use non-root users in Dockerfiles
    - Scan images for vulnerabilities: `docker scan piggy-pulse-backend`

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
docker volume rm piggy-pulse-app_postgres_data
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
