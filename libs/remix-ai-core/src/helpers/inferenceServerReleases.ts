import axios from 'axios';
import fs from 'fs';
import path from 'path';

interface Asset {
  name: string;
  browser_download_url: string;
}

interface Release {
  assets: Asset[];
}

const owner = 'remix-project-org'
const repo = 'remix_ai_tools'
async function getLatestRelease(owner: string, repo: string): Promise<Release> {
  const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  const response = await axios.get(url);
  return response.data;
}

async function downloadFile(url: string, filePath: string): Promise<void> {
  const writer = fs.createWriteStream(filePath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

export async function downloadLatestReleaseExecutable(platform: string, outputDir: string): Promise<void> {
  try {
    const release = await getLatestRelease(owner, repo);
    const executables = release.assets.filter(asset =>
      asset.name.includes(platform)
    );

    console.log(`Downloading executables for ${platform}..., ${executables} `);

    for (const executable of executables) {
      const filePath = path.join(outputDir, executable.name);
      console.log(`Downloading ${executable.name}...`);
      await downloadFile(executable.browser_download_url, filePath);
      console.log(`Downloaded ${executable.name}`);
    }
  } catch (error) {
    console.error('Error downloading executables:', error);
  }
}
