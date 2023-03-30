# Release process 

This document includes the release instructions for:
 - Feature freeze phase
 - Publishing `remixd` to NPM
 - Publishing remix libraries to NPM
 - Updating Remix's live version on remix.ethereum.org
 - Updating Remix's alpha version on remix-alpha.ethereum.org
 - Updating Remix's beta version on remix-beta.ethereum.org

## Feature Freeze
Once feature freeze is done, `remix_beta` should be updated latest to the master which will automatically update `remix-beta.ethereum.org` through a CI job.

 - `git checkout remix_beta`
 - `git pull origin remix_beta`
 - `git reset --hard <master-commit-hash>` (`master-commit-hash` will be latest commit id from `master` branch)
 - `git push -f origin remix_beta`
 
## Testing
Testing is performed after the Feature Freeze on `remix-beta.ethereum.org`. `build-qa-doc.js` script can be used to generate the list of QA tasks. Instructions to use the file are given in the file itself: https://github.com/ethereum/remix-project/blob/master/build-qa-doc.js#L18 . 

Once ready to run, it can be run using the Node.js: `node build-qa-doc.js`

## remixd NPM release
Once testing is completed, release will start by publishing `remixd`.if required, `remixd` can be also released individually

 - Bump version for remixd in `./libs/remixd/package.json`
 - Run: `nx build remixd`
 - Move to build directory: `cd ./dist/libs/remixd`
 - Publish to NPM: `npm publish` (Make sure you are logged in to NPM)
 - create bump PR to master

## Remix libraries NPM release
 - Make sure you are on latest `master` branch
 - `git pull origin master`
 - `git checkout -b bumpLibsVersion`
 - `yarn run publish:libs `
 
This command uses `lerna` and is solely responsible for publishing all the remix libraries. It will ask for a new version of each library. Make sure you are logged in to NPM.

Once this command has been run, the versions for each remix library will be updated to latest in the libs' package.json file.
 - Create and merge bump PR to master
 
## Remix IDE Release 
### Part 1. Bump the version and update Beta

#### Make sure `remix_beta` is up-to-date with `master` branch:

 - `git checkout remix_beta`
 - `git pull origin remix_beta`
 - `git reset --hard <master-commit-hash>`
 - `git push -f origin remix_beta`

#### Create bump version PR:

 - Create a new branch from `remix_beta`: `git checkout -b bumpVersion`
 - Update package.json version. Usually, you need to remove `-dev` from the version string
 - Create a PR with base branch as `remix_beta`
 - Merge PR to **origin/remix_beta**

#### Create git tag from beta branch:

 - `git checkout remix_beta`
 - `git pull origin remix_beta`
 - Create tag: `git tag v<version-number>`, `<version-number>` should be same as in package.json of `remix_beta` branch
 - Push tag: `git push --tags`
 - Generate changelog using `build-changelog.js` script as described in the script itself
 - Publish a release in GitHub using the generated changelog

### Part 2. Update the Remix Live

Updating the `remix_live` branch latest to the `remix_beta` runs the CircleCI build which updates liver version of Remix IDE on `remix.ethereum.org`

 - `git checkout remix_live`
 - `git pull origin remix_live`
 - `git reset --hard <remix_beta-commit-hash>` or `<master-commit-hash>` sometimes
 - `git push -f origin remix_live`

 CircleCI will build automatically and remix.ethereum.org will be updated to the latest.

 ### Part 3. Upload zip file in GitHub release
 - Once CI is successful for `remix_live` branch, Go to https://github.com/ethereum/remix-live
 - Download the zip file with the name starting with `remix-`
 - Upload the zip file in GitHub assets by editing the release for this version
 
## Bump master branch 

 - `git checkout master`
 - `git pull origin master`
 - Create a new branch from `master`: `git checkout -b bumpDevVersion`
 - Bump the  package.json version, add the tag `-dev` if not already present.
 - Create and merge PR to `master`
 
 
## Remix IDE Beta Release
 - git fetch origin master
 - git checkout origin/master
 - git checkout -b bumpVersion
 - update package.json version to the new version "vx.x.x-beta.1"
 - merge PR
 - git fetch origin master
 - git checkout origin/master
 - git tag v(version-number) (with "vx.x.x-beta.1")
 - git push --tags
 - github-changes -o ethereum -r remix-project -a --only-pulls --use-commit-body --only-merges --between-tags previous_version...next_version
 - publish a beta release in github using the changelog
 - drop zip file to the beta release (from https://github.com/ethereum/remix-live-alpha)
 
## Remix IDE Alpha Release

remix-alpha.ethereum.org is automatically updated every time a commit is pushed to `master` branch
