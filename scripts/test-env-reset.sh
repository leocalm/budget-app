#!/usr/bin/env bash
set -euo pipefail

docker compose -f docker-compose.test.yml down -v

docker compose -f docker-compose.test.yml up -d --build
