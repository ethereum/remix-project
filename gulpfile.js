#!/usr/bin/env node

'use strict';
const { task } = require('gulp');
const fs = require('fs');
const util = require('util');
const promisifyExec = util.promisify(require('child_process').exec);

var packageJSON = require('./package.json');

/**
 * @dev Task to create git tag using version from package.json and pushing this specific tag
 */
task('publishTag', async function () {
    const tag = "v" + packageJSON.version
    await promisifyExec(`git tag ${tag}; git push origin ${tag}`);
});

/**
 * @dev Task to update changelog for latest release
 */
task('updateChangelog', async function () {
    const previous_version = process.argv[4];
    const next_version = "v" + packageJSON.version;

    // Create changes.md with latest release changelog temporarily
    await promisifyExec(`github-changes -o ethereum -r remix -a --file changes.md --only-pulls --use-commit-body --only-merges --between-tags ${previous_version} ... ${next_version}`);
    const latestChangelog = fs.readFileSync(__dirname + '/changes.md', 'utf8')
    const oldChangelog = fs.readFileSync(__dirname + '/CHANGELOG.md', 'utf8')
    // Concatenate latest changelog content to the top of old changelog file content
    const data = latestChangelog + '\n\n' + oldChangelog
    // Delete current changelog file CHANGELOG.md
    fs.unlinkSync(__dirname + '/CHANGELOG.md');
    // Delete changes.md
    fs.unlinkSync(__dirname + '/changes.md');
    // Write the concatenated content to CHANGELOG.md (We delete and create file to place the new data on top)
    fs.writeFileSync(__dirname + '/CHANGELOG.md', data); 
    await Promise.resolve();
});

/**
 * @dev Task to sync libs version from 'dist' folder as lerna published from there
 */
task('syncLibVersions', async function () {
    const libs = [
        'remix-analyzer',
        'remix-astwalker',
        'remix-debug',
        'remix-lib',
        'remix-simulator',
        'remix-solidity',
        'remix-tests',
        'remix-url-resolver',
        'remix-ws-templates',
        'remixd'
    ]

    libs.forEach(lib => {
        const distPackageJSON = require(__dirname + '/dist/libs/' + lib + '/package.json')
        fs.writeFileSync(__dirname + '/libs/' + lib + '/package.json', JSON.stringify(distPackageJSON, null, 2), 'utf8')
    })
    await Promise.resolve();
});