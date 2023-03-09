#!/bin/bash

set -e

cd dist

git init
git config user.name "$COMMIT_AUTHOR"
git config user.email "$COMMIT_AUTHOR_EMAIL"

zip -r remix-$1.zip .
git add .
git commit -m "Built website from {$1}."

ls -la
git status

