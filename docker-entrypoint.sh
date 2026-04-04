#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma db push --accept-data-loss 2>/dev/null || echo "Migration warning (may be first run)"

echo "Starting application..."
exec node server.js
