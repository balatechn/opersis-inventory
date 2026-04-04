#!/bin/sh

echo "Running database migrations..."
npx prisma db push --accept-data-loss 2>&1 || echo "WARNING: Migration failed, continuing..."

echo "Starting application..."
exec node server.js
