#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "Building CallText..."
bun run build
echo "Starting server..."
bun run serve.ts
