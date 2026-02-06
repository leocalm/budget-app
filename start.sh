#!/bin/bash
set -e

echo "==================================="
echo "Budget App - Docker Setup"
echo "==================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.docker .env

    # Generate a random secret key
    if command -v openssl >/dev/null 2>&1; then
        SECRET_KEY=$(openssl rand -base64 32)
        # Replace the placeholder in .env
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/ROCKET_SECRET_KEY=.*/ROCKET_SECRET_KEY=$SECRET_KEY/" .env
        else
            # Linux
            sed -i "s/ROCKET_SECRET_KEY=.*/ROCKET_SECRET_KEY=$SECRET_KEY/" .env
        fi
        echo "✓ Generated ROCKET_SECRET_KEY"
    else
        echo "⚠ Warning: openssl not found. Please manually set ROCKET_SECRET_KEY in .env"
    fi
    echo ""
fi

# Build and start containers
echo "Building and starting containers..."
docker compose up -d --build

echo ""
echo "Waiting for services to be healthy..."
sleep 5

# Check if services are running
if docker compose ps | grep -q "Up"; then
    echo "✓ Services are running"
else
    echo "✗ Some services failed to start. Check logs with: docker compose logs"
    exit 1
fi

echo ""
echo "==================================="
echo "Setup complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Run database migrations:"
echo "   cd ../budget && sqlx migrate run"
echo ""
echo "2. Access the application:"
echo "   - App: http://localhost"
echo "   - API: http://localhost/api/v1"
echo "   - Health: http://localhost/health"
echo ""
echo "Useful commands:"
echo "- View logs: docker compose logs -f"
echo "- Stop: docker compose down"
echo "- Debug with Adminer: docker compose --profile debug up -d"
echo ""
