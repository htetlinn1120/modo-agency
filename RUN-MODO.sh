#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "Installing dependencies..."
npm install
echo "Starting MODO..."
npm run dev
