import { Octokit } from 'octokit'
import * as fs from 'fs'
import * as path from 'path'
import YAML from 'yaml'
import crypto from 'crypto'

const owner = 'remix-project-org'
let repo = 'remix-desktop'
const headers = {
  'X-GitHub-Api-Version': '2022-11-28',
}

const version = getVersionFromPackageJson()
let channel = 'latest'

if (version.includes('beta')) {
  channel = 'beta'
}
if (version.includes('alpha')) {
  channel = 'alpha'
}
if (version.includes('insiders')) {
  channel = 'insiders'
}

if (channel !== 'latest') repo = `remix-desktop-${channel}`

const octokit = new Octokit({
  auth: process.env.GH_TOKEN_DESKTOP_PUBLISH,
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
  if (fs.existsSync(file)) {
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
  } else {
    console.log(`File ${file} does not exist. Skipping...`)
  }
}

function getVersionFromPackageJson() {
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

async function hashFile(file): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha512').setEncoding('base64');
    // hash.on('error', reject).setEncoding(encoding);
    fs.createReadStream(
      file,
      Object.assign({}, {}, {
        highWaterMark: 1024 * 1024,
        /* better to use more memory but hash faster */
      })
    )
      .on('error', reject)
      .on('end', () => {
        hash.end();
        console.log('hash done');
        console.log(hash.read());
        resolve(hash.digest('base64'));
      })
      .pipe(
        hash,
        {
          end: false,
        }
      );
  });
}

async function main() {

  const allReleases = await getAllReleases()

  console.log(`preparing release version: ${version}`)
  let release
  allReleases.find((r) => {
    if (r.tag_name === `v${version}`) {
      release = r
    }
  })
  if (!release) {
    console.log('No release found.')
    // create release
    console.log(`Creating release ${version}`)
    const r = await octokit.request('POST /repos/{owner}/{repo}/releases', {
      owner: owner,
      repo: repo,
      tag_name: `v${version}`,
      name: `${version}`,
      draft: true,
      prerelease: true,
      headers: headers,
    })
    release = r.data
  }

  let ymlFiles = await readReleaseFilesFromLocalDirectory()
  ymlFiles = ymlFiles.filter((file) => file.endsWith('.yml') && file.startsWith('latest'))

  console.log(`Found ${ymlFiles.length} yml files to upload`)

  // read and parse yml latest files
  // the yml files contain the sha512 hash and file size of the executable
  // we need to recalculate the hash and file size of the executable
  // and update the yml files
  // this is because the executable is resigned after the yml files are created
  for (const file of ymlFiles) {
    const content = fs.readFileSync(path.join(__dirname, '../../../release', file), 'utf8')
    const parsed = YAML.parse(content)
    const hashes: {
      url: string,
      sha512: string,
      size: number
    }[] = []
    if (parsed.files) {
      console.log(`Found`, parsed.files)
      for (const f of parsed.files) {
        const executable = f.url
        const exists = fs.existsSync(path.join(__dirname, '../../../release', executable))
        if (!exists) {
          console.log(`File ${executable} does not exist on local fs. Skipping...`)
          continue
        } else {
          console.log(`File ${executable} exists on local fs. Recalculating hash...`)
          // calculate sha512 hash of executable
          const hash: string = await hashFile(path.join(__dirname, '../../../release', executable))
          console.log(hash)
          // calculate file size of executable
          const stats = fs.statSync(path.join(__dirname, '../../../release', executable))
          const fileSizeInBytes = stats.size
          console.log(fileSizeInBytes)
          hashes.push({
            url: executable,
            sha512: hash,
            size: fileSizeInBytes
          })
          if (parsed.path === executable) {
            parsed.sha512 = hash
            parsed.size = fileSizeInBytes
          }
        }
      }
    }
    console.log(hashes)
    parsed.files = hashes
    const newYml = YAML.stringify(parsed)
    fs.writeFileSync(path.join(__dirname, '../../../release', file), newYml)
  }

  let files = await readReleaseFilesFromLocalDirectory()

  try {
    if (fs.existsSync(path.join(__dirname, '../../../release', `latest-mac-arm64.yml`)) && fs.existsSync(path.join(__dirname, '../../../release', `latest-mac-x64.yml`))) {
      // combine the two files
      const macArm64 = fs.readFileSync(path.join(__dirname, '../../../release', `latest-mac-arm64.yml`), 'utf8')
      const mac = fs.readFileSync(path.join(__dirname, '../../../release', `latest-mac-x64.yml`), 'utf8')
      const parsedMacArm64 = YAML.parse(macArm64)
      const parsedMac = YAML.parse(mac)
      console.log(parsedMacArm64)
      console.log(parsedMac)
      const combined = {
        ...parsedMac,
        files: [
          ...parsedMac.files,
          ...parsedMacArm64.files
        ]
      }
      console.log(combined)
      const newYml = YAML.stringify(combined)
      fs.writeFileSync(path.join(__dirname, '../../../release', `latest-mac.yml`), newYml)
      // remove the arm64 file
      fs.unlinkSync(path.join(__dirname, '../../../release', `latest-mac-arm64.yml`))
      fs.unlinkSync(path.join(__dirname, '../../../release', `latest-mac-x64.yml`))
    }
  } catch (e) {
    console.log(e)
  }

  files = await readReleaseFilesFromLocalDirectory()
  files = files.
    filter((file) => file.endsWith('.zip') || file.endsWith('.dmg') || file.endsWith('.exe') || file.endsWith('.AppImage') || file.endsWith('.snap') || file.endsWith('.deb') || file.startsWith(`latest`))
    .filter((file) => !file.startsWith('._'))
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

