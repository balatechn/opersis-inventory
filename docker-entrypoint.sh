#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma db push --accept-data-loss || { echo "ERROR: Migration failed!"; exit 1; }

echo "Starting application..."
exec node server.js
