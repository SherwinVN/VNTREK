#!/bin/sh
set -e

npm run build --workspace=shared

./node_modules/.bin/concurrently \
  --names shared,server,client \
  "npm run build:watch --workspace=shared" \
  "npm run dev --workspace=server" \
  "npm run dev --workspace=client -- --host"
