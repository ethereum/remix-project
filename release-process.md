# Release process
This document details steps for publishing packages and tag the code base accordingly:


1) Publish (using lerna) all the modules that depends on one of the newly published module

- checkout a new branch from master
- npm run publish (that command use lerna)
- commit

2) Increment the root (repository scoped) package.json

- increment root package.json version
- commit
- merge the branch

3) Create a tag (using the package.json version)

- checkout latest origin/master
- npm run tag
- previousVersion=[previous_version] npm run updateChangelog 
- create a new release out of the changes of CHANGELOG.md

4) Commit new updated CHANGELOG.md


