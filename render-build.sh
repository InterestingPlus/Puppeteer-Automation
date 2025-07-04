#!/usr/bin/env bash
set -e

echo "Installing dependencies..."
npm install

echo "Setting Puppeteer cache path..."
export PUPPETEER_CACHE_DIR=/opt/render/project/src/.cache/puppeteer

echo "Installing Chrome via Puppeteer..."
npx puppeteer browsers install chrome
