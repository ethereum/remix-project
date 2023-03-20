#!/usr/bin/env bash

set -e
sha1sum persist/plugin-$1.zip
npx ts-node apps/remix-ide/ci/publish_plugin.ts 328782397 alpha

git clone git@github.com:ethereum/remix-plugins-directory.git