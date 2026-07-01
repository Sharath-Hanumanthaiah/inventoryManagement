#!/bin/sh
# entrypoint.sh
# Starts the mock API backend, waits for it to be ready,
# then delegates to the Playwright CLI with all provided arguments.

set -e

MOCK_PORT="${MOCK_PORT:-5001}"

echo "[entrypoint] Starting mock API server on port ${MOCK_PORT}..."
node /app/.codevalid/ui/mock/mock-server.js &
MOCK_PID=$!

# Wait up to 15 seconds for the mock server to accept connections
MAX_WAIT=15
WAITED=0
until wget -q -O /dev/null "http://localhost:${MOCK_PORT}/health" 2>/dev/null; do
  if [ "$WAITED" -ge "$MAX_WAIT" ]; then
    echo "[entrypoint] ERROR: Mock server did not start within ${MAX_WAIT}s" >&2
    kill "$MOCK_PID" 2>/dev/null || true
    exit 1
  fi
  sleep 1
  WAITED=$((WAITED + 1))
done

echo "[entrypoint] Mock API server is ready."

# Run Playwright; pass through any extra arguments from Docker CMD / runtime flags.
exec npx playwright test --config .codevalid/ui/playwright.config.js "$@"
