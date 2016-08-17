#!/bin/bash

set -e

git config user.name "$COMMIT_AUTHOR"
git config user.email "$COMMIT_AUTHOR_EMAIL"
git checkout --orphan gh-pages
git rm --cached -r .
echo "# Automatic build" > README.md
echo "Built website from {$TRAVIS_COMMIT}. See https://github.com/ethereum/browser-solidity/ for details." >> README.md
echo "To use an offline copy, download browser-solidity-$TRAVIS_COMMIT.zip." >> README.md
# ZIP the whole directory
zip -r browser-solidity-$TRAVIS_COMMIT.zip $FILES_TO_PACKAGE
# -f is needed because "build" is part of .gitignore
git add -f $FILES_TO_PACKAGE browser-solidity-$TRAVIS_COMMIT.zip
git commit -m "Built website from {$TRAVIS_COMMIT}."

ENCRYPTED_KEY_VAR="encrypted_${ENCRYPTION_LABEL}_key"
ENCRYPTED_IV_VAR="encrypted_${ENCRYPTION_LABEL}_iv"
ENCRYPTED_KEY=${!ENCRYPTED_KEY_VAR}
ENCRYPTED_IV=${!ENCRYPTED_IV_VAR}
openssl aes-256-cbc -K $ENCRYPTED_KEY -iv $ENCRYPTED_IV -in ci/deploy_key.enc -out deploy_key -d
chmod 600 deploy_key
eval `ssh-agent -s`
ssh-add deploy_key

git push -f "$PUSH_REPO" gh-pages
