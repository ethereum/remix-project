import { Octokit } from 'octokit'

const owner = 'bunsenstraat'
const repo = 'remix-desktop'
const headers = {
    'X-GitHub-Api-Version': '2022-11-28'
}

const octokit = new Octokit({
    auth: process.env.GH_TOKEN
})


async function getAllReleases() {
    const releases = await octokit.request('GET /repos/{owner}/{repo}/releases', {
        owner: owner,
        repo: repo,
        headers: headers
    })
    return releases.data
}

async function getVersionFromPackageJson() {
    const packageJson = require(__dirname + '/../../../apps/remixdesktop/package.json')
    return packageJson.version
}

async function getReleaseByTag(tag_name: string) {
    const releases = await octokit.request('GET /repos/{owner}/{repo}/releases/tags/{tag}', {
        owner: owner,
        repo: repo,
        tag: tag_name,
        headers: headers
    })
    return releases.data
}

async function getReleaseAssets(release_id: number) {
    const assets = await octokit.request('GET /repos/{owner}/{repo}/releases/{release_id}/assets', {
        owner: owner,
        repo: repo,
        release_id: release_id,
        headers: headers
    })

    for (const asset of assets.data) {
        console.log(asset.name)
    }

}

async function main() {
    const version = await getVersionFromPackageJson()
    console.log(version)
    const release = await getReleaseByTag('v' + version)
    console.log(release)
    if(!release.draft) {
        console.log('Release is not a draft')
        return
    }
}

main()
console.log(process.env.GH_TOKEN)
//getReleaseAssets()