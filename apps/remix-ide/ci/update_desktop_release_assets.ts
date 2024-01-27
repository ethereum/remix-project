import {Octokit} from 'octokit'
import * as fs from 'fs'
import * as path from 'path'

const owner = 'bunsenstraat'
const repo = 'remix-desktop'
const headers = {
  'X-GitHub-Api-Version': '2022-11-28',
}

const octokit = new Octokit({
  auth: process.env.GH_TOKEN,
})

async function getAllReleases() {
  const releases = await octokit.request('GET /repos/{owner}/{repo}/releases', {
    owner: owner,
    repo: repo,
    headers: headers,
  })
  return releases.data
}

async function uploadReleaseAsset(release, name, file) {
  const upload_url = release.upload_url
  console.log(`Uploading ${name} to ${upload_url}`)
  octokit.request({
    method: "POST",
    url: upload_url,
    headers: {
      "content-type": "text/plain",
    },
    data: fs.readFileSync(file),
    name,
    label: name
  });
}

async function getVersionFromPackageJson() {
  // ignore ts error
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const packageJson = require(__dirname + '/../../../apps/remixdesktop/package.json')
  return packageJson.version
}

async function readReleaseFilesFromLocalDirectory() {
  const directoryPath = path.join(__dirname, '../../../release')
  const files = fs.readdirSync(directoryPath)
  return files
}

async function removeAsset(asset) {
  await octokit.request('DELETE /repos/{owner}/{repo}/releases/assets/{asset_id}', {
    owner: owner,
    repo: repo,
    asset_id: asset.id,
    headers: headers,
  })
}

async function main() {
  const allReleases = await getAllReleases()
  const version = await getVersionFromPackageJson()
  console.log(`preparing release version: ${version}`)
  let release
  allReleases.find((r) => {
    if (r.tag_name === `v${version}`) {
      release = r
    }
  })
  if (!release) {
    console.log('No release found.')
    return
  }

  let files = await readReleaseFilesFromLocalDirectory()

  files = files.filter((file) => file.endsWith('.dmg') || file.endsWith('.exe') || file.endsWith('.AppImage') || file.endsWith('.snap') || file.endsWith('.deb') || file.startsWith('latest'))
  console.log(`Found ${files.length} files to upload`)
  console.log(files)
  if (!release.draft) {
    console.log(`Release ${version} is not a draft. Aborting...`)
    return
  }
  // upload files
  for (const file of files) {
    // check if it is already uploaded
    const asset = release.assets.find((a) => a.label === file)
    if (asset) {
      console.log(`Asset ${file} already uploaded... replacing it`)
      // remove it first
      await removeAsset(asset)
    }
    await uploadReleaseAsset(release, file, path.join(__dirname, '../../../release', file))
  }
}

main()

