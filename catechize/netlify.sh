#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Generate Nuxt types
echo "Generating Nuxt types..."
pnpm nuxt prepare

# Build the application
echo "Building the application..."
NODE_OPTIONS="--max-old-space-size=4096" pnpm run build
