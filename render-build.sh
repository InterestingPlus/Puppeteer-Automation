#!/usr/bin/env bash
set -e

echo "Installing dependencies..."
npm install

echo "Setting Puppeteer cache path..."
export PUPPETEER_CACHE_DIR=/opt/render/project/src/.cache/puppeteer

echo "Manually installing Chrome using Puppeteer script..."
node node_modules/puppeteer/install.mjs
