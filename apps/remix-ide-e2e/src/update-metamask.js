const axios = require('axios');
const fs = require('fs');
const AdmZip = require('adm-zip');
const path = require('path');

const GITHUB_RELEASES = 'https://api.github.com/repos/MetaMask/metamask-extension/releases/latest';
const DOWNLOAD_DIR = './apps/remix-ide-e2e/src/extensions/chrome/metamask';

async function downloadLatestRelease() {
  const res = await axios.get(GITHUB_RELEASES, {
    headers: { 'User-Agent': 'MetaMask CRX Updater' },
  });
  const zipAsset = res.data.assets.find(a => a.name.endsWith('.zip'));
  if (!zipAsset) throw new Error('No zip asset found in latest release');

  const latestVersion = res.data.tag_name;
  const versionFile = path.join(DOWNLOAD_DIR, '.version');

  if (fs.existsSync(versionFile)) {
    const currentVersion = fs.readFileSync(versionFile, 'utf-8').trim();
    if (currentVersion === latestVersion) {
      console.log(`✅ Already at latest MetaMask version: ${latestVersion}`);
      return null;
    }
  }

  console.log(`⬇️ Downloading MetaMask ${latestVersion}: ${zipAsset.name}`);

  if (fs.existsSync(DOWNLOAD_DIR)) {
    fs.rmSync(DOWNLOAD_DIR, { recursive: true, force: true });
  }

  const zipRes = await axios.get(zipAsset.browser_download_url, { responseType: 'arraybuffer' });
  const zipPath = path.join(DOWNLOAD_DIR, 'metamask.zip');
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  fs.writeFileSync(zipPath, zipRes.data);
  fs.writeFileSync(versionFile, latestVersion);

  return zipPath;
}

function unzipExtension(zipPath) {
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(DOWNLOAD_DIR, true);
  
    return DOWNLOAD_DIR;
  }

(async () => {
  try {
    const zipPath = await downloadLatestRelease();
    if (zipPath) {
      const extensionDir = unzipExtension(zipPath);
    }
  } catch (err) {
    console.error('❌ Failed to update MetaMask CRX:', err);
    process.exit(1);
  }
})();