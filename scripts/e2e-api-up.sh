#!/bin/sh
set -eu

# Auto-detect ARM64 (Apple Silicon) and use the correct image tag
if [ -z "${PIGGY_PULSE_API_IMAGE:-}" ]; then
  ARCH=$(uname -m)
  if [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ]; then
    export PIGGY_PULSE_API_IMAGE="ghcr.io/leocalm/piggy-pulse-api:latest-arm64"
  else
    export PIGGY_PULSE_API_IMAGE="ghcr.io/leocalm/piggy-pulse-api:latest"
  fi
fi

echo "Using API image: $PIGGY_PULSE_API_IMAGE"
docker-compose -f docker-compose.api.yml up -d --wait "$@"
