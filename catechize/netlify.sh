#!/bin/bash

# Install pnpm
npm install -g pnpm

# Install dependencies
pnpm install

# Build the application
pnpm run build
