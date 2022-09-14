# Release process 

This document includes:
 - how to release the remixd
 - how to publish remix libs to NPM
 - how to update remix.ethereum.org
 - how to update remix-alpha.ethereum.org
 - how to update remix-beta.ethereum.org
 - how to release remix IDE

## RemixD release
 - update new version number in remixd libs/remixd/package.json
 - nx build remixd
 - cd into ./dist/libs/remixd
 - npm publish
 - create bump PR to master.

## Remix libs release
(remove dist and login to npm)
 - git fetch origin master
 - git checkout origin/master
 - git checkout -b bumpLibsVersion
 - yarn run publish:libs (this command uses lerna)
 - commit

## Remix IDE release Part 1. First push master to beta. Feature Freeze
 - git co -b remix_beta origin/remix_beta
 - git reset --hard -master-commit-hash-
 - git push -f origin remix_beta
 
## Testing phase
## In case of fixing bugs push PR's also to beta to include in Release
 
## Remix IDE release Part 2. Bump the version in beta and release

 - git fetch origin remix_beta
 - git checkout origin/remix_beta
 - git checkout -b bumpVersion
 - update package.json version
 - update version in yarn.lock
 - merge PR to **origin/remix_beta**
 - git fetch origin remix_beta
 - git checkout origin/remix_beta
 - git tag v(version-number)
 - git push --tags
 - github-changes -o ethereum -r remix-project -a --only-pulls --use-commit-body --branch remix_beta --only-merges --between-tags previous_version...next_version
 - publish a release in github using the changelog
 
## Remix IDE release Part 3. Bump dev branch (master)

 - git fetch origin master
 - git checkout origin/master
 - git checkout -b bumpDevVersion
 - update package.json version: bump the version and add the tag `dev` if not already present.
 - update version in yarn.lock
 - create a PR and merge it to origin/master
 
## Remix IDE release Part 4. remix.ethereum.org update

This is not strictly speaking a release. Updating the remix site is done through the Travis build:

 - git co -b remix_live origin/remix_live
 - git reset --hard -master-commit-hash- (or remix_beta-commit-hash-)
 - git push -f origin remix_live

 CircleCI will build automaticaly and remix.ethereum.org will be updated

##  Remix IDE release Part 5. Update Zip in release
 - after remix_live is updated, drop the zip (from https://github.com/ethereum/remix-live/) to the release.
 
## Remix-ide beta release
 - git fetch origin master
 - git checkout origin/master
 - git checkout -b bumpVersion
 - update package.json version to the new version "vx.x.x-beta.1"
 - update version in yarn.lock
 - merge PR
 - git fetch origin master
 - git checkout origin/master
 - git tag v(version-number) (with "vx.x.x-beta.1")
 - git push --tags
 - github-changes -o ethereum -r remix-project -a --only-pulls --use-commit-body --only-merges --between-tags previous_version...next_version
 - publish a beta release in github using the changelog
 - drop zip file to the beta release (from https://github.com/ethereum/remix-live-alpha)
 
## remix-alpha.ethereum.org update

remix-alpha.ethereum.org is automaticaly updated every time commits are pushed to master
