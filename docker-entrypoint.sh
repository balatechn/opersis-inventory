#!/bin/sh

echo "Running database migrations..."
node ./node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss 2>&1 || echo "WARNING: Migration failed, continuing..."

echo "Starting application..."
exec node server.js
