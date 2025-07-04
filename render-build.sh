# render-build.sh
#!/usr/bin/env bash
set -e

npm install
PUPPETEER_CACHE_DIR=/opt/render/project/src/.cache/puppeteer
export PUPPETEER_CACHE_DIR

npm run build  # if applicable
npx puppeteer browsers install chrome
