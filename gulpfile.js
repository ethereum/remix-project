#!/usr/bin/env node

'use strict';
var gulp = require('gulp');
var exec = require('child_process').exec;

var packageJSON = require('./package.json');

gulp.task('publishTag', function () {
    exec("git tag v"+ packageJSON.version +"; git push --tags");
});
