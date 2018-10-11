#!/usr/bin/env node

'use strict';
var gulp = require('gulp');

var lernaJSON = require('./lerna.json');

gulp.task('publishTag', function () {
    exec("git tag v"+ lernaJSON.version +"; git push --tags");
});
