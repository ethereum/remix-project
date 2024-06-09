import { ChildProcess, spawn } from "child_process"
import kill from 'tree-kill'
import init from "../helpers/init"
import { Nightwatch, NightwatchBrowser } from "nightwatch"
let gitserver: ChildProcess

/* 
/ uses the git-http-backend package to create a git server ( if needed kill the server: kill -9 $(sudo lsof -t -i:6868)  )
/ GROUP 1: file operations PUSH PULL COMMIT SYNC FETCH CLONE ADD
/ GROUP 2: branch operations CREATE & PUBLISH
*/

module.exports = {
    '@disabled': true,
    before: function (browser, done) {
        init(browser, done)
    },
    after: function (browser: NightwatchBrowser) {
        browser.perform((done) => {
            console.log('kill server', gitserver.pid)
            kill(gitserver.pid)
            done()
        })
    },

    'run server #group1 #group2': function (browser: NightwatchBrowser) {
        browser.perform(async (done) => {
            gitserver = await spawnGitServer('/tmp/')
            console.log('working directory', process.cwd())
            done()
        })
    },
    'Update settings for git #group1 #group2': function (browser: NightwatchBrowser) {
        browser.
            clickLaunchIcon('dgit')
            .waitForElementVisible('*[data-id="initgit-btn"]')
            .click('*[data-id="initgit-btn"]')
            .setValue('*[data-id="gitubUsername"]', 'git')
            .setValue('*[data-id="githubEmail"]', 'git@example.com')
            .click('*[data-id="saveGitHubCredentials"]')
            .modalFooterOKClick('github-credentials-error')
            .pause(2000)
    },
    'clone a repo #group1 #group2': function (browser: NightwatchBrowser) {
        browser
            .waitForElementVisible('*[data-id="clone-panel"]')
            .click('*[data-id="clone-panel"]')
            .waitForElementVisible('*[data-id="clone-url"]')
            .setValue('*[data-id="clone-url"]', 'http://localhost:6868/bare.git')
            .waitForElementVisible('*[data-id="clone-btn"]')
            .click('*[data-id="clone-btn"]')
            .clickLaunchIcon('filePanel')
            .waitForElementVisible('*[data-id="treeViewLitreeViewItemREADME.md"]')

    },

    // GROUP 1

    'check file added #group1': function (browser: NightwatchBrowser) {
        browser.
            addFile('test.txt', { content: 'hello world' }, 'README.md')
            .clickLaunchIcon('dgit')
            .click('*[data-id="sourcecontrol-panel"]')
            .waitForElementVisible({
                selector: "//*[@data-status='new-untracked' and @data-file='/test.txt']",
                locateStrategy: 'xpath'
            })
            .waitForElementVisible('*[data-id="addToGitChangestest.txt"]')
            .pause(1000)
            .click('*[data-id="addToGitChangestest.txt"]')
            .waitForElementVisible({
                selector: "//*[@data-status='added-staged' and @data-file='/test.txt']",
                locateStrategy: 'xpath'
            })
            .setValue('*[data-id="commitMessage"]', 'testcommit')
            .click('*[data-id="commitButton"]')
    },
    'look at the commit #group1': function (browser: NightwatchBrowser) {
        browser
            .click('*[data-id="commits-panel"]')
            .waitForElementPresent({
                selector: '//*[@data-id="commit-summary-testcommit-ahead"]',
                locateStrategy: 'xpath'
            })
    },
    'sync the commit #group1': function (browser: NightwatchBrowser) {
        browser
            .pause(1000)
            .waitForElementVisible('*[data-id="sourcecontrol-panel"]')
            .click('*[data-id="sourcecontrol-panel"]')
            .waitForElementVisible('*[data-id="syncButton"]')
            .click('*[data-id="syncButton"]')
            .pause(2000)
            .waitForElementVisible('*[data-id="commitButton"]')
            .click('*[data-id="commits-panel"]')
            .waitForElementPresent({
                selector: '//*[@data-id="commit-summary-testcommit-"]',
                locateStrategy: 'xpath'
            })
    },
    'check the log #group1': async function (browser: NightwatchBrowser) {
        const logs = await getGitLog('/tmp/git/bare.git')
        console.log(logs)
        browser.assert.ok(logs.includes('testcommit'))
    },
    'change a file #group1': function (browser: NightwatchBrowser) {
        browser.
            openFile('test.txt').
            pause(1000).
            setEditorValue('changes', null)
    },
    'stage changed file #group1': function (browser: NightwatchBrowser) {
        browser
            .clickLaunchIcon('dgit')
            .click('*[data-id="sourcecontrol-panel"]')
            .waitForElementVisible({
                selector: "//*[@data-status='modified-unstaged' and @data-file='/test.txt']",
                locateStrategy: 'xpath'
            })
            .waitForElementVisible('*[data-id="addToGitChangestest.txt"]')
            .click('*[data-id="addToGitChangestest.txt"]')
            .waitForElementVisible({
                selector: "//*[@data-status='modified-staged' and @data-file='/test.txt']",
                locateStrategy: 'xpath'
            })
            .setValue('*[data-id="commitMessage"]', 'testcommit2')
            .click('*[data-id="commitButton"]')
    },
    'push the commit #group1': function (browser: NightwatchBrowser) {
        browser
            .click('*[data-id="commands-panel"]')
            .waitForElementVisible('*[data-id="sourcecontrol-push"]')
            .click('*[data-id="sourcecontrol-push"]')
            .pause(2000)
            .click('*[data-id="commits-panel"]')
            .waitForElementPresent({
                selector: '//*[@data-id="commit-summary-testcommit2-"]',
                locateStrategy: 'xpath'
            }).pause(2000)
    },
    'check the log for testcommit2 #group1': async function (browser: NightwatchBrowser) {
        const logs = await getGitLog('/tmp/git/bare.git')
        console.log(logs)
        browser.assert.ok(logs.includes('testcommit2'))
    },
    'clone locally and add a file and push #group1': async function (browser: NightwatchBrowser) {
        await cloneOnServer('http://localhost:6868/bare.git', '/tmp/')
        await onLocalGitRepoAddFile('/tmp/bare/', 'test2.txt')
        await createCommitOnLocalServer('/tmp/bare/', 'testlocal')
        await onLocalGitRepoPush('/tmp/bare/', 'master')
    },
    'run a git fetch #group1': function (browser: NightwatchBrowser) {
        browser
            .pause(2000)
            .click('*[data-id="commands-panel"]')
            .waitForElementVisible('*[data-id="sourcecontrol-fetch-branch"]')
            .click('*[data-id="sourcecontrol-fetch-branch"]')
            .pause(2000)
            .click('*[data-id="commits-panel"]')
            .click('*[data-id="commits-panel-behind"]')
            .waitForElementPresent({
                selector: '//*[@data-id="commit-summary-testlocal-"]',
                locateStrategy: 'xpath'
            })
    },
    'run pull from the header #group1': function (browser: NightwatchBrowser) {
        browser.
        click('*[data-id="sourcecontrol-button-pull"]')
        .waitForElementNotPresent('*[data-id="commits-panel-behind"]')
    },
    'check if the file is added #group1': function (browser: NightwatchBrowser) {
        browser
            .clickLaunchIcon('filePanel')
            .waitForElementVisible('*[data-id="treeViewLitreeViewItemtest2.txt"]')
    },
    // GROUP 2 
    'create a branch #group2': function (browser: NightwatchBrowser) {
        browser
        .clickLaunchIcon('dgit')
        .click('*[data-id="branches-panel"]')
        .waitForElementVisible('*[data-id="newbranchname"]')
        .setValue('*[data-id="newbranchname"]', 'testbranch')
        .click('*[data-id="sourcecontrol-create-branch"]')
        .waitForElementVisible('*[data-id="branches-current-branch-testbranch"]')
    }
}

async function getGitLog(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const git = spawn('git', ['log'], { cwd: path })
        let logs = ''
        git.stdout.on('data', function (data) {
            logs += data.toString()
        })
        git.stderr.on('err', function (data) {
            reject(data.toString())
        })
        git.on('close', function () {
            resolve(logs)
        })
    })
}

async function cloneOnServer(repo: string, path: string) {
    console.log('cloning', repo, path)
    return new Promise((resolve, reject) => {
        const git = spawn('rm -rf bare && git', ['clone', repo], { cwd: path, shell: true, detached: true });

        git.stdout.on('data', function (data) {
            console.log('stdout data cloning', data.toString());
            if (data.toString().includes('done')) {
                resolve(git);
            }
        });

        git.stderr.on('data', function (data) {
            console.log('stderr data cloning', data.toString());
            if (data.toString().includes('into')) {
                setTimeout(() => {
                    resolve(git);
                }, 5000)
            }
        });

        git.on('error', (error) => {
            reject(`Process error: ${error.message}`);
        });

        git.on('exit', (code, signal) => {
            if (code !== 0) {
                reject(`Process exited with code: ${code} and signal: ${signal}`);
            }
        });
    });
}

async function onLocalGitRepoAddFile(path: string, file: string) {
    console.log('adding file', file)
    return new Promise((resolve, reject) => {
        const git = spawn('touch', [file], { cwd: path });

        git.stdout.on('data', function (data) {
            console.log('stdout data adding file', data.toString());
            if (data.toString().includes('done')) {
                resolve(git);
            }
        });

        git.stderr.on('data', function (data) {
            console.error('stderr adding file', data.toString());
            reject(data.toString());
        });

        git.on('error', (error) => {
            reject(`Process error: ${error.message}`);
        });

        git.on('exit', (code, signal) => {
            if (code !== 0) {
                reject(`Process exited with code: ${code} and signal: ${signal}`);
            } else {
                resolve(git);
            }
        });
    });
}

async function onLocalGitRepoPush(path: string, branch: string = 'master') {
    console.log('pushing', path)
    return new Promise((resolve, reject) => {
        const git = spawn('git', ['push', 'origin', branch], { cwd: path, shell: true, detached: true });

        git.stdout.on('data', function (data) {
            console.log('stdout data pushing', data.toString());
            if (data.toString().includes('done')) {
                resolve(git);
            }
        });

        git.stderr.on('data', function (data) {
            console.error('stderr data pushing', data.toString());
            if (data.toString().includes(branch)) {
                resolve(git);
            }
        });

        git.on('error', (error) => {
            reject(`Process error: ${error.message}`);
        });

        git.on('exit', (code, signal) => {
            if (code !== 0) {
                reject(`Process exited with code: ${code} and signal: ${signal}`);
            } else {
                resolve(git);
            }
        });
    });
}


async function createCommitOnLocalServer(path: string, message: string) {
    console.log('committing', message, path)
    return new Promise((resolve, reject) => {
        const git = spawn('git add . && git', ['commit', '-m', message], { cwd: path, shell: true, detached: true });

        git.stdout.on('data', function (data) {
            console.log('data stdout committing', data.toString());
            if (data.toString().includes(message)) {
                setTimeout(() => {
                    resolve(git);
                }, 1000)
            }
        });

        git.stderr.on('data', function (data) {
            console.error('data commiting', data.toString());
            reject(data.toString());
        });

        git.on('error', (error) => {
            console.error('error', error);
            reject(`Process error: ${error.message}`);
        });

        git.on('exit', (code, signal) => {
            if (code !== 0) {
                console.error('exit', code, signal);
                reject(`Process exited with code: ${code} and signal: ${signal}`);
            } else {
                resolve(git);
            }
        });
    });
}


async function spawnGitServer(path: string): Promise<ChildProcess> {
    console.log(process.cwd())
    try {
        const server = spawn('yarn && sh setup.sh && npx ts-node server.ts', [`${path}`], { cwd: process.cwd() + '/apps/remix-ide-e2e/src/githttpbackend/', shell: true, detached: true })
        console.log('spawned', server.stdout.closed, server.stderr.closed)
        return new Promise((resolve, reject) => {
            server.stdout.on('data', function (data) {
                console.log(data.toString())
                if (
                    data.toString().includes('is listening')
                    || data.toString().includes('address already in use')
                ) {
                    console.log('resolving')
                    resolve(server)
                }
            })
            server.stderr.on('err', function (data) {
                console.log(data.toString())
                reject(data.toString())
            })
        })
    } catch (e) {
        console.log(e)
    }
}