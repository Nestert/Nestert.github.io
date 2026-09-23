#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

: "${AWS_ACCESS_KEY_ID:?Set the Yandex Object Storage access key}"
: "${AWS_SECRET_ACCESS_KEY:?Set the Yandex Object Storage secret key}"
: "${GITHUB_SHA:?Set the commit being published}"

# Refuse an incomplete build before uploading or removing any remote files.
for required in index.html 404.html projects/index.html paintings/index.html drawings/index.html objects/index.html cv/index.html press/index.html assets/css/main.css; do
  if [[ ! -s "_site/$required" ]]; then
    echo "Missing build output: _site/$required" >&2
    exit 1
  fi
done

node -e 'const fs = require("node:fs"); fs.writeFileSync("_site/deployment.json", JSON.stringify({ commit: process.env.GITHUB_SHA, publishedAt: new Date().toISOString() }) + "\n");'

aws_s3=(aws --endpoint-url=https://storage.yandexcloud.net s3)
destination=s3://omanovar.ru/
cache_control='no-cache'

# Upload assets before pages that reference them. Keep the previous files until
# every page is uploaded, so a failed build/upload cannot trigger cleanup.
"${aws_s3[@]}" sync _site/ "$destination" \
  --exclude '*.html' --exclude deployment.json \
  --cache-control "$cache_control" --only-show-errors

"${aws_s3[@]}" cp _site/ "$destination" --recursive \
  --exclude '*' --include '*.html' \
  --cache-control "$cache_control" --only-show-errors

# The bucket contains only this site's generated files. Synchronizing deletions
# also removes pages and images deleted or renamed through Pages CMS.
"${aws_s3[@]}" sync _site/ "$destination" --delete \
  --exclude deployment.json \
  --cache-control "$cache_control" --only-show-errors

# Publish the revision marker only after the entire synchronization succeeds.
"${aws_s3[@]}" cp _site/deployment.json "${destination}deployment.json" \
  --content-type application/json --cache-control "$cache_control" --only-show-errors
