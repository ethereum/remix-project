#!/usr/bin/env bash

set -e
HASH=sha1sum persist/plugin-$1.zip
npx ts-node apps/remix-ide/ci/publish_plugin.ts $1 $HASH alpha

git clone git@github.com:ethereum/remix-plugins-directory.git