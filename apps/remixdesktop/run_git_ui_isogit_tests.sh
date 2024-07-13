#!/bin/bash

for testfile in build-e2e/remixdesktop/test/tests/app/git*.js
do
  yarn test:isogit --test $testfile
done