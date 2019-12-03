#!/usr/bin/env node

'use strict';
var { task } = require('gulp');
var fs = require('fs');
const util = require('util');
const promisifyExec = util.promisify(require('child_process').exec);

var packageJSON = require('./package.json');

task('publishTag', async function () {
    await promisifyExec("git tag v"+ packageJSON.version +"; git push --tags");
});

task('updateChangelog', async function () {
    let previous_version = process.argv[4];
    let next_version = "v" + packageJSON.version;
    await promisifyExec("github-changes -o ethereum -r remix -a --file changes.md --only-pulls --use-commit-body --only-merges --between-tags " + previous_version + "..." + next_version);
    let data = fs.readFileSync(__dirname + '/changes.md', 'utf8') + '\n\n' + fs.readFileSync(__dirname + '/CHANGELOG.md', 'utf8')
    fs.unlinkSync(__dirname + '/CHANGELOG.md');
    fs.unlinkSync(__dirname + '/changes.md');
    fs.writeFileSync(__dirname + '/CHANGELOG.md', data); 
    await Promise.resolve();
});