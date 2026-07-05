#!/usr/bin/env bash
# docker-entrypoint.sh
#
# Starts the mock API server in the background then executes the Playwright
# test command passed as arguments (or the default ENTRYPOINT args).
#
# Usage (called automatically by Docker ENTRYPOINT):
#   docker run <image>
#   docker run <image> npx playwright test --config .codevalid/ui/playwright.config.js

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="${APP_ROOT:-/app}"

echo "[entrypoint] Starting mock API server on port 5001..."
node "${APP_ROOT}/.codevalid/ui/mock/mock-server.js" &
MOCK_PID=$!

# Give the mock server a moment to bind to its port
sleep 1

# Verify the mock server is reachable
RETRIES=10
until curl -sf "http://localhost:5001/api/items" > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo "[entrypoint] Waiting for mock server... ($RETRIES retries left)"
  sleep 1
  RETRIES=$((RETRIES - 1))
done

if [ $RETRIES -eq 0 ]; then
  echo "[entrypoint] WARNING: Mock server did not respond in time; continuing anyway."
fi

echo "[entrypoint] Mock server is up (pid $MOCK_PID)."

# Execute the main command (Playwright test run)
exec "$@"
