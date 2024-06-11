import { ElectronPlugin } from '@remixproject/engine-electron'
import axios from 'axios';
import fs from 'fs';
import { Model } from '@remix/remix-ai-core';

const desktop_profile = {
  name: 'remixAID',
  displayName: 'RemixAI Desktop',
  maintainedBy: 'Remix',
  description: 'RemixAI provides AI services to Remix IDE Desktop.',
  methods: ['downloadModel'],
}

export class remixAIDesktopPlugin extends ElectronPlugin {
  constructor() {
    console.log('remixAIDesktopPlugin')
    super(desktop_profile)
  }

  onActivation(): void {
    this.on('remixAI', 'enabled', () => {console.log('someone enable the remixAI desktop plugin')} )
  }

  async downloadModel(model: Model, outputLocationPath: string): Promise<void> {
    console.log(`Downloading model ${model.name}`)
  
    // Make a HEAD request to get the file size
    const { headers } = await axios.head(model.download_url);
    const totalSize = parseInt(headers['content-length'], 10);

    // Create a write stream to save the file
    const writer = fs.createWriteStream(outputLocationPath);

    // Start the file download
    const response = await axios({
      method: 'get',
      url: model.download_url,
      responseType: 'stream'
    });

    let downloadedSize = 0;

    response.data.on('data', (chunk: Buffer) => {
      downloadedSize += chunk.length;
      const progress = (downloadedSize / totalSize) * 100;
      this.emit('download_progress', progress);
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }
}