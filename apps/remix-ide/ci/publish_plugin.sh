#!/usr/bin/env bash

set -e


HASH=$(sha1sum persist/plugin-$1.zip | cut -d " " -f 1)
# unzip persist/plugin-$1.zip
# ls -la dist/apps/plugin-$1

git clone git@github.com:ethereum/remix-plugins-directory.git
npx ts-node apps/remix-ide/ci/publish_plugin.ts $1 $HASH alpha

cd remix-plugins-directory
git checkout -b plugin-$1-$HASH
git config user.name "$COMMIT_AUTHOR"
git config user.email "$COMMIT_AUTHOR_EMAIL"
git status
git add .
git commit -m "Publish plugin $1"
git status

