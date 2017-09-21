#!/bin/bash

set -e

SHA=`git rev-parse --short --verify HEAD`

git config user.name "$COMMIT_AUTHOR"
git config user.email "$COMMIT_AUTHOR_EMAIL"
git checkout --orphan gh-pages
git rm --cached -r .
echo "# Automatic build" > README.md
echo "Built website from \`$SHA\`. See https://github.com/ethereum/browser-solidity/ for details." >> README.md
echo "To use an offline copy, download \`remix-$SHA.zip\`." >> README.md
# ZIP the whole directory
zip -r remix-$SHA.zip $FILES_TO_PACKAGE
# -f is needed because "build" is part of .gitignore
git add -f $FILES_TO_PACKAGE remix-$SHA.zip
git commit -m "Built website from {$SHA}."

# deploy yann300 gh-pages
ENCRYPTED_KEY_VAR3="encrypted_${ENCRYPTION_LABEL3}_key"
ENCRYPTED_IV_VAR3="encrypted_${ENCRYPTION_LABEL3}_iv"
ENCRYPTED_KEY3=${!ENCRYPTED_KEY_VAR3}
ENCRYPTED_IV3=${!ENCRYPTED_IV_VAR3}

touch deploy_key_yann300_remix
chmod 600 deploy_key_yann300_remix
openssl aes-256-cbc -K $ENCRYPTED_KEY3 -iv $ENCRYPTED_IV3 -in ci/deploy_key_yann300_remix.enc -out deploy_key_yann300_remix -d
eval `ssh-agent -s`
ssh-add deploy_key_yann300_remix
git push -f git@github.com:yann300/remix.git gh-pages
