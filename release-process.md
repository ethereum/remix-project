# Release process
This document details steps for publishing packages and tag the code base accordingly:


# Case where we deploy a remix module that is a dependency for another remix module: 
**remix-lib** , **remix-simulator** , **remix-solidity**

1) publish (using lerna) all the modules that depends on one of the newly published module:

- checkout a new branch from master
- npm run publish (that command use lerna)
- commit

2) increment the root (repository scoped) package.json

- increment root package.json version
- commit
- merge the branch

3) create a tag (using the package.json version)

- checkout latest origin/master
- npm run tag
- github-changes -o ethereum -r remix -a --only-pulls --use-commit-body --only-merges --between-tags previous_version...next_version 
- create a new release out of the changelog.md
- in changelog put list of published packages with version


# Case where we deploy a top level library
**remix-debug** , **remix-tests** , **remix-url-resolver** , **remix-analyzer**

1) publish the module:

- checkout a new branch from master
- cd in the module folder
- increment package.json version
- npm run publish

2) create a tag (using the package.json version)

- checkout latest origin/master
- git tag <module-name>@<version>
- git push --tags
- github-changes -o ethereum -r remix -a --only-pulls --use-commit-body --only-merges --between-tags previous_version...next_version 
- keep only PRs related to changes in the published module
- create a new release out of the changelog.md
