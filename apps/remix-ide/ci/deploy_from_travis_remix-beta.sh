#!/bin/bash

set -e
SHA=`git rev-parse --short --verify HEAD`

cd dist/apps/remix-ide

git init
git config user.name "$COMMIT_AUTHOR"
git config user.email "$COMMIT_AUTHOR_EMAIL"
zip -r remix-$SHA.zip .
git add .
git commit -m "Built website from {$SHA}."

git push -f git@github.com:ethereum/remix-live-beta.git gh-pages
