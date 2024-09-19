import { Profile } from "@remixproject/plugin-utils";
import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import chokidar from 'chokidar'
import { ElectronBasePluginRemixdClient } from "../lib/remixd"
import fs from 'fs'
import * as utils from '../lib/utils'

import { basename, join } from "path";
import { spawn } from "child_process";
const profile: Profile = {
    name: 'foundry',
    displayName: 'electron foundry',
    description: 'electron foundry',
}

export class FoundryPlugin extends ElectronBasePlugin {
    clients: any[]
    constructor() {
        super(profile, clientProfile, FoundryPluginClient)
        this.methods = [...super.methods]
    }
}

const clientProfile: Profile = {
    name: 'foundry',
    displayName: 'electron foundry',
    description: 'electron foundry',
    methods: ['sync', 'compile']
}


class FoundryPluginClient extends ElectronBasePluginRemixdClient {

    watcher: chokidar.FSWatcher
    warnlog: boolean
    buildPath: string
    cachePath: string
    logTimeout: NodeJS.Timeout
    processingTimeout: NodeJS.Timeout

    async onActivation(): Promise<void> {
        console.log('Foundry plugin activated')
        this.call('terminal', 'log', { type: 'log', value: 'Foundry plugin activated' })
        this.on('fs' as any, 'workingDirChanged', async (path: string) => {
            console.log('workingDirChanged foundry', path)
            this.currentSharedFolder = path
            this.startListening()
        })
        this.currentSharedFolder = await this.call('fs' as any, 'getWorkingDir')
        if(this.currentSharedFolder) this.startListening()
    }

    startListening() {
        this.buildPath = utils.absolutePath('out', this.currentSharedFolder)
        this.cachePath = utils.absolutePath('cache', this.currentSharedFolder)
        console.log('Foundry plugin checking for', this.buildPath, this.cachePath)
        if (fs.existsSync(this.buildPath) && fs.existsSync(this.cachePath)) {
            this.listenOnFoundryCompilation()
        } else {
            this.listenOnFoundryFolder()
        }
    }

    listenOnFoundryFolder() {
        console.log('Foundry out folder doesn\'t exist... waiting for the compilation.')
        try {
            if (this.watcher) this.watcher.close()
            this.watcher = chokidar.watch(this.currentSharedFolder, { depth: 1, ignorePermissionErrors: true, ignoreInitial: true })
            // watch for new folders
            this.watcher.on('addDir', (path: string) => {
                console.log('add dir foundry', path)
                if (fs.existsSync(this.buildPath) && fs.existsSync(this.cachePath)) {
                    this.listenOnFoundryCompilation()
                }
            })
        } catch (e) {
            console.log(e)
        }
    }

    compile() {
        return new Promise((resolve, reject) => {
            const cmd = `forge build`
            const options = { cwd: this.currentSharedFolder, shell: true }
            const child = spawn(cmd, options)
            let result = ''
            let error = ''
            child.stdout.on('data', (data) => {
                const msg = `[Foundry Compilation]: ${data.toString()}`
                console.log('\x1b[32m%s\x1b[0m', msg)
                result += msg + '\n'
            })
            child.stderr.on('data', (err) => {
                error += `[Foundry Compilation]: ${err.toString()} \n`
            })
            child.on('close', () => {
                if (error && result) resolve(error + result)
                else if (error) reject(error)
                else resolve(result)
            })
        })
    }

    checkPath() {
        if (!fs.existsSync(this.buildPath) || !fs.existsSync(this.cachePath)) {
            this.listenOnFoundryFolder()
            return false
        }
        if (!fs.existsSync(join(this.cachePath, 'solidity-files-cache.json'))) return false
        return true
    }

    private async processArtifact() {
        if (!this.checkPath()) return
        const folderFiles = await fs.promises.readdir(this.buildPath) // "out" folder
        try {
            const cache = JSON.parse(await fs.promises.readFile(join(this.cachePath, 'solidity-files-cache.json'), { encoding: 'utf-8' }))
            // name of folders are file names
            for (const file of folderFiles) {
                const path = join(this.buildPath, file) // out/Counter.sol/
                const compilationResult = {
                    input: {},
                    output: {
                        contracts: {},
                        sources: {}
                    },
                    inputSources: { sources: {}, target: '' },
                    solcVersion: null,
                    compilationTarget: null
                }
                compilationResult.inputSources.target = file
                await this.readContract(path, compilationResult, cache)
                this.emit('compilationFinished', compilationResult.compilationTarget, { sources: compilationResult.input }, 'soljson', compilationResult.output, compilationResult.solcVersion)
            }

            clearTimeout(this.logTimeout)
            this.logTimeout = setTimeout(() => {
                // @ts-ignore
                this.call('terminal', 'log', { type: 'log', value: `receiving compilation result from Foundry. Select a file to populate the contract interaction interface.` })
                console.log('Syncing compilation result from Foundry')
            }, 1000)

        } catch (e) {
            console.log(e)
        }
    }

    async triggerProcessArtifact() {
        // prevent multiple calls
        clearTimeout(this.processingTimeout)
        this.processingTimeout = setTimeout(async () => await this.processArtifact(), 1000)
    }

    listenOnFoundryCompilation() {
        try {
            console.log('Foundry out folder exists... processing the artifact.')
            if (this.watcher) this.watcher.close()
            this.watcher = chokidar.watch(this.cachePath, { depth: 0, ignorePermissionErrors: true, ignoreInitial: true })
            this.watcher.on('change', async () => await this.triggerProcessArtifact())
            this.watcher.on('add', async () => await this.triggerProcessArtifact())
            this.watcher.on('unlink', async () => await this.triggerProcessArtifact())
            // process the artifact on activation
            this.triggerProcessArtifact()
        } catch (e) {
            console.log(e)
        }
    }

    async readContract(contractFolder, compilationResultPart, cache) {
        const files = await fs.promises.readdir(contractFolder)
        for (const file of files) {
            const path = join(contractFolder, file)
            const content = await fs.promises.readFile(path, { encoding: 'utf-8' })
            compilationResultPart.inputSources.sources[file] = { content }
            await this.feedContractArtifactFile(file, content, compilationResultPart, cache)
        }
    }

    async feedContractArtifactFile(path, content, compilationResultPart, cache) {
        const contentJSON = JSON.parse(content)
        const contractName = basename(path).replace('.json', '')

        let sourcePath = ''
        if (contentJSON?.metadata?.settings?.compilationTarget) {
            for (const key in contentJSON.metadata.settings.compilationTarget) {
                if (contentJSON.metadata.settings.compilationTarget[key] === contractName) {
                    sourcePath = key
                    break
                }
            }
        }

        if (!sourcePath) return

        const currentCache = cache.files[sourcePath]
        if (!currentCache.artifacts[contractName]) return

        // extract source and version
        const metadata = contentJSON.metadata
        if (metadata.compiler && metadata.compiler.version) {
            compilationResultPart.solcVersion = metadata.compiler.version
        } else {
            compilationResultPart.solcVersion = ''
            console.log('\x1b[32m%s\x1b[0m', 'compiler version not found, please update Foundry to the latest version.')
        }

        if (metadata.sources) {
            for (const path in metadata.sources) {
                const absPath = utils.absolutePath(path, this.currentSharedFolder)
                try {
                    const content = await fs.promises.readFile(absPath, { encoding: 'utf-8' })
                    compilationResultPart.input[path] = { content }
                } catch (e) {
                    compilationResultPart.input[path] = { content: '' }
                }
            }
        } else {
            console.log('\x1b[32m%s\x1b[0m', 'sources input not found, please update Foundry to the latest version.')
        }

        compilationResultPart.compilationTarget = sourcePath
        // extract data
        if (!compilationResultPart.output['sources'][sourcePath]) compilationResultPart.output['sources'][sourcePath] = {}
        compilationResultPart.output['sources'][sourcePath] = {
            ast: contentJSON['ast'],
            id: contentJSON['id']
        }
        if (!compilationResultPart.output['contracts'][sourcePath]) compilationResultPart.output['contracts'][sourcePath] = {}

        contentJSON.bytecode.object = contentJSON.bytecode.object.replace('0x', '')
        contentJSON.deployedBytecode.object = contentJSON.deployedBytecode.object.replace('0x', '')
        compilationResultPart.output['contracts'][sourcePath][contractName] = {
            abi: contentJSON.abi,
            evm: {
                bytecode: contentJSON.bytecode,
                deployedBytecode: contentJSON.deployedBytecode,
                methodIdentifiers: contentJSON.methodIdentifiers
            }
        }
    }

    async sync() {
        console.log('syncing Foundry with Remix...')
        this.processArtifact()
    }
}


