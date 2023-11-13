import { expect } from 'chai'
import { deploy } from '../helpers/deploy'
import { ISemaphoreDeploymentData, SemaphoreProof } from '../types/types'
import { createProofForIdendity } from '../helpers/createProofForIdendity'
import { ethers } from 'ethers'
import { BigNumberToSignal } from '../helpers/convertsignal'

// to use this test you should first setup the contracts using
// 1. deploy_sempahore
// 2. create groups
// 3. store groups

let hackergroup
let hackerclient
let semaphoreAddress
let CCIPBNM
let proof: SemaphoreProof
let _paymentChainSelector = '16015286601757825753'
let _receiver
let cid
const router = ethers.Wallet.createRandom() // some random address uses instead of the CCIP router

describe('Hackerclient', function () {
    it('Deploys token', async function () {
        await remix.call('udapp', 'clearAllInstances' as any)
        CCIPBNM = await deploy('CCIPBNM', [])
        console.log('deploy CCIPBNM done ', CCIPBNM.address)
        expect(CCIPBNM.address).to.not.null
    })
    it('Set Receiver', async function () {
        const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()
        _receiver = await signer.getAddress()
        console.log('receiver', _receiver)
    })
    it('Deploys hackergroup', async function () {
        const semaphore_deployment = await remix.call('fileManager', 'readFile', 'data/semaphore_deployment.json')
        const semaphore_deployment_data: ISemaphoreDeploymentData = JSON.parse(semaphore_deployment)
        semaphoreAddress = semaphore_deployment_data.semaphoreAddress
        hackergroup = await deploy('HackerGroup', [semaphore_deployment_data.semaphoreAddress, router.address, CCIPBNM.address])
        console.log('deploy done ', hackergroup.address)
        expect(hackergroup.address).to.not.null
    })

    it('Mints token to hackergroup', async function () {
        await CCIPBNM.mint(hackergroup.address, 100)
        expect(await CCIPBNM.balanceOf(hackergroup.address)).to.equal(100)
    })
    it('Deploys hackerclient', async function () {
        const semaphore_deployment = await remix.call('fileManager', 'readFile', 'data/semaphore_deployment.json')
        const semaphore_deployment_data: ISemaphoreDeploymentData = JSON.parse(semaphore_deployment)
        semaphoreAddress = semaphore_deployment_data.semaphoreAddress
        // here we will simulate going between chains
        const destChain = 2
        const sourceChain = 1
        hackerclient = await deploy('HackerClient', [destChain, sourceChain, hackergroup.address])
        console.log('deploy done ', hackerclient.address)
        expect(hackerclient.address).to.not.null
    })
    it('Submit a new valid proof for onchain validating with hackergroup', async function () {
        // get the first group from the file
        const groups = JSON.parse(await remix.call('fileManager', 'readFile', './build/groups.json'))
        const group_id = groups[0].group_id

        const n = ethers.BigNumber.from(ethers.utils.randomBytes(32))
        cid = BigNumberToSignal(n)
        // signal is 0, meaning we create a new bug
        proof = await await createProofForIdendity(cid, '0', true, null, groups[0].members[0])

        console.log('using proof ...')
        const result = await hackerclient.submit(group_id, proof.merkleTreeRoot, proof.signal, proof.nullifierHash, proof.externalNullifier, proof.proof, _paymentChainSelector, _receiver)
        console.log('verification by hackerclient...')
        console.log(result)
        expect(result.hash).to.not.null
    })
    it('Fetches the bug associated with the cid', async function () {
        console.log('fetching ....', proof.externalNullifier)
        const result = await hackergroup.bugs(proof.externalNullifier)
        console.log(result)
        expect(result[0]).to.equal(proof.externalNullifier)
    })
    it('Reads the events from the contract', async function () {
        const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()
        const contract = await ethers.getContractAt('HackerGroup', hackergroup.address, signer)

        let eventFilter = contract.filters.bugCreated()
        let bugs = await contract.queryFilter(eventFilter)
        expect(bugs.length).to.equal(1)

        console.log('bugs created')
        console.log(JSON.stringify(bugs, null, '\t'))
    })

    it('Submit a new valid approval proof by the second member of the group', async function () {
        // get the first group from the file
        const groups = JSON.parse(await remix.call('fileManager', 'readFile', './build/groups.json'))
        const group_id = groups[0].group_id

        // signal is 1, meaning we approve the bug
        proof = await createProofForIdendity(cid, '1', true, null, groups[0].members[1])
        // get the first group from the file

        console.log('using proof ...')
        const result = await hackerclient.submit(group_id, proof.merkleTreeRoot, proof.signal, proof.nullifierHash, proof.externalNullifier, proof.proof, _paymentChainSelector, _receiver)
        console.log('verification by hackerclient...')
        console.log(result)
        expect(result.hash).to.not.null
    })

    it('Fetches the bug associated with the cid', async function () {
        const result = await hackergroup.approvals(proof.externalNullifier)
        console.log(result)
        expect(result).to.equal(1)
    })

    it('Reads the events from the contract', async function () {
        const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()
        const contract = await ethers.getContractAt('HackerGroup', hackergroup.address, signer)

        let eventFilter = contract.filters.TokensTransferred(null)
        const tokens = await contract.queryFilter(eventFilter)
        expect(tokens.length).to.equal(1)

        console.log('tokens transferred')
        console.log(JSON.stringify(tokens, null, '\t'))
    })
    it('Check balance of hackergroup', async function () {
        expect(await CCIPBNM.balanceOf(hackergroup.address)).to.equal(99)
    })
    it('gets the cids from the verified proofs', async () => {

        const signer = new ethers.providers.Web3Provider(web3Provider).getSigner()
        const semaphore_deployment = await remix.call('fileManager', 'readFile', 'data/semaphore_deployment.json')
        const semaphore_deployment_data: ISemaphoreDeploymentData = JSON.parse(semaphore_deployment)

        const contract = await ethers.getContractAt('Semaphore', semaphore_deployment_data.semaphoreAddress, signer)

        //console.log(contract.filters)

        let eventFilter = contract.filters.ProofVerified()
        let proofs_verified = await contract.queryFilter(eventFilter)

        // write it to the filesystem
        await remix.call('fileManager', 'setFile', './build/proofs_verified.json', JSON.stringify(proofs_verified, null, '\t'))

        // build cids from it

        const cids = []

        const verified_proofs = JSON.parse(await remix.call('fileManager', 'readFile', './build/proofs_verified.json'))
        for (let proof of verified_proofs) {
            const cid = BigNumberToSignal(proof.args[3].hex)
            const signal = proof.args[4].hex
            cids.push({
                date: Date.now(),
                cid: cid,
                signal
            })

            console.log(cids)
            console.log('finding ', cid)
            const index = cids.findIndex((x) => x.cid === cid)
            expect(index).to.greaterThan(-1)

        }

    })
    it('writes bugs to file', async () => {
        let bugs = []
        const verified_proofs = JSON.parse(await remix.call('fileManager', 'readFile', './build/proofs_verified.json'))
        for (let proof of verified_proofs) {
            const cid = BigNumberToSignal(proof.args[3].hex)
            const externalNullifier = proof.args[3].hex
            console.log(externalNullifier)
            // query the contract 
            console.log('fetching ....', externalNullifier)
            const result = await hackergroup.bugs(externalNullifier)
            console.log(result)
            bugs.push({
               cid,
               approved: result[4].toNumber(),
               rejected: result[5].toNumber() 
            })
        }
        await remix.call('fileManager', 'setFile', './build/bugs.json', JSON.stringify(bugs, null, '\t'))

    })
})
