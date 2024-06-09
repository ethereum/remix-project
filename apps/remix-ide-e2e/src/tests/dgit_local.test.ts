import { ChildProcess, spawn } from "child_process"
import kill from 'tree-kill'
import init from "../helpers/init"
let gitserver: ChildProcess
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
    'clone a repository': function (browser) {
        console.log('cloning')
    }
}

async function spawnGitServer(path: string): Promise<ChildProcess> {
    console.log(process.cwd())
    try {
        const server = spawn('yarn && npx ts-node server.ts', [`${path}`], { cwd: process.cwd() + '/apps/remix-ide-e2e/src/githttpbackend/', shell: true, detached: true })
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