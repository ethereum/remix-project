#!/bin/bash

set -e

SHA=`git rev-parse --verify HEAD`

git config user.name "Travis CI"
git config user.email "builds@ethereum.org"
git checkout --orphan gh-pages
git rm --cached -r .
echo "# Automatic build" > README.md
echo "Built website from {$SHA}. See https://github.com/ethereum/remix/ for details." >> README.md
# -f is needed because "build" is part of .gitignore

# copying file to the root folder
cp remix-debugger/index.html index.html
mkdir build
cp remix-debugger/build/app.js build/app.js
mkdir assets
cp -R remix-debugger/assets/. assets/

git add -f README.md index.html build/app.js assets
git commit -m "Built website from {$SHA}."

ENCRYPTION_LABEL=fade88419824
ENCRYPTED_KEY_VAR="encrypted_${ENCRYPTION_LABEL}_key"
ENCRYPTED_IV_VAR="encrypted_${ENCRYPTION_LABEL}_iv"
ENCRYPTED_KEY=${!ENCRYPTED_KEY_VAR}
ENCRYPTED_IV=${!ENCRYPTED_IV_VAR}
openssl aes-256-cbc -K $ENCRYPTED_KEY -iv $ENCRYPTED_IV -in ci/deploy_key.enc -out deploy_key -d
chmod 600 deploy_key
eval `ssh-agent -s`
ssh-add deploy_key

git push -f git@github.com:ethereum/remix.git gh-pages
