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

ENCRYPTED_KEY_VAR1="encrypted_${ENCRYPTION_LABEL1}_key"
ENCRYPTED_IV_VAR1="encrypted_${ENCRYPTION_LABEL1}_iv"
ENCRYPTED_KEY1=${!ENCRYPTED_KEY_VAR1}
ENCRYPTED_IV1=${!ENCRYPTED_IV_VAR1}
ENCRYPTED_KEY_VAR2="encrypted_${ENCRYPTION_LABEL2}_key"
ENCRYPTED_IV_VAR2="encrypted_${ENCRYPTION_LABEL2}_iv"
ENCRYPTED_KEY2=${!ENCRYPTED_KEY_VAR2}
ENCRYPTED_IV2=${!ENCRYPTED_IV_VAR2}

touch deploy_key
touch deploy_key_remix-live
chmod 600 deploy_key deploy_key_remix-live
openssl aes-256-cbc -K $ENCRYPTED_KEY1 -iv $ENCRYPTED_IV1 -in ci/deploy_key.enc -out deploy_key -d
openssl aes-256-cbc -K $ENCRYPTED_KEY2 -iv $ENCRYPTED_IV2 -in ci/deploy_key_remix-live.enc -out deploy_key_remix-live -d
eval `ssh-agent -s`
ssh-add deploy_key
git push -f git@github.com:ethereum/browser-solidity.git gh-pages
ssh-add -D

echo -n "remix.ethereum.org" > CNAME
git add CNAME
git commit --amend -m "Built website from {$SHA}."
ssh-add deploy_key_remix-live
git push -f git@github.com:ethereum/remix-live.git gh-pages
