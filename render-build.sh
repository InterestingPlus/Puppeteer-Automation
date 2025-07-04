#!/usr/bin/env bash
set -e

# Step 1: Install dependencies
npm install

# Step 2: Set Puppeteer cache directory explicitly
export PUPPETEER_CACHE_DIR=/opt/render/project/src/.cache/puppeteer

# Step 3: Download Chromium
npx puppeteer browsers install chrome
