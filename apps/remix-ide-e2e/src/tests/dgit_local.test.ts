import { ChildProcess, spawn } from "child_process"
import kill from 'tree-kill'
import init from "../helpers/init"
let gitserver: ChildProcess
// if needed kill the server: kill -9 $(sudo lsof -t -i:6868)
module.exports = {
    '@disabled': true,
    before: function (browser, done) {
        init(browser, done)
    },
    after: function (browser) {
        browser.perform((done) => {
            console.log('kill server', gitserver.pid)
            kill(gitserver.pid)
            done()
        })
    },

    'run server #group1': function (browser) {
        browser.perform(async (done) => {
            gitserver = await spawnGitServer('/tmp/')
            console.log('working directory', process.cwd())
            done()
        })
    },
    'Update settings for git': function (browser) {
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
    'clone a repo': function (browser) {
        browser
        .waitForElementVisible('*[data-id="clone-panel"]')
        .click('*[data-id="clone-panel"]')
        .waitForElementVisible('*[data-id="clone-url"]')
        .setValue('*[data-id="clone-url"]', 'http://localhost:6868/bare.git')
        .waitForElementVisible('*[data-id="clone-btn"]')
        .click('*[data-id="clone-btn"]')
        .clickLaunchIcon('filePanel')
        .waitForElementVisible('*[data-id="treeViewLitreeViewItemREADME.md"]')
        .addFile('testFile.text', { content: 'hello world' }, 'README.md')
        .pause(10000)
    }
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