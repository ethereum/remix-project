# Release process
This document details steps for publishing packages and tag the code base accordingly:

- checkout a new branch
- npm run publish
- commit
- increment root package.json version
- commit
- merge the branch
- fetch origin/master
- checkout origin/master
- npm run tag
- github-changes -o ethereum -r remix -a --only-pulls --use-commit-body --only-merges --between-tags <previous>...<next> 
- create a new release out of the changelog.md
- in changelog put list of published packages with version
