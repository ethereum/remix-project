#!/bin/bash

TEST_SCRIPT='node_modules/.bin/nightwatch --config dist/apps/remix-ide-e2e/nightwatch.js';

if [ {$1} != undefined ]
then 
    TEST_SCRIPT=${TEST_SCRIPT}' --env '$1;
else 
    TEST_SCRIPT=${TEST_SCRIPT}' --env chrome';
fi

if [ {$2} != undefined ]
then
    TEST_SCRIPT=${TEST_SCRIPT}' '$2;
fi

eval $TEST_SCRIPT || TEST_EXITCODE=1;

echo $TEST_EXITCODE;
if [ "$TEST_EXITCODE" -eq "1" ]
then
  exit 1
fi