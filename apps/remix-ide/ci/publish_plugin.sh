#!/usr/bin/env bash

set -e

HASH=$(sha1sum persist/plugin-$1.zip | cut -d " " -f 1)
unzip persist/plugin-$1.zip -d dist/
ls -la dist/
npx ts-node apps/remix-ide/ci/publish_plugin.ts $1 $HASH alpha

git clone git@github.com:ethereum/remix-plugins-directory.git