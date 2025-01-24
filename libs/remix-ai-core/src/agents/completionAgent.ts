import lunr from 'lunr';

interface Document {
  id: number;
  filename: string;
  content: string;
  identifier: number;
}

enum SupportedFileExtensions {
  solidity = '.sol',
  vyper = '.vy',
  circom = '.circom',
}

export class CodeCompletionAgent {
  private workspacesIndexes = new Map<string, any>();
  props: any;
  indexer: any;
  Documents: Document[] = [];
  INDEX_THRESHOLD = 0.1;
  N_MATCHES = 1;

  constructor(props) {
    this.props = props;
    this.props.on('fileManager', 'fileAdded', (path) => { });
    this.props.on('filePanel', 'workspaceCreated', async () => { });
  }

  async getDcocuments() {
    const documents: Document[] = [];
    const dirs = await this.props.call('fileManager', 'dirList', '/');
    let c = 0;
    for (const dir of dirs) {
      const files = await this.props.call('fileManager', 'fileList', dir);
      for (const file of files) {
        const content = await this.props.call('fileManager', 'readFile', file);
        // filter out any  SupportedFileExtensions
        if (! Object.values(SupportedFileExtensions).some(ext => file.endsWith(ext))) continue;
        documents.push({
          id: ++c,
          filename: file,
          content: content,
          identifier: c-1,
        });
      }
    }
    console.log('Documents', documents);
    return documents;
  }

  indexWorkspace() {
    this.getDcocuments().then((documents) => {
      this.Documents = documents;
      this.indexer =lunr(function () {
        this.ref('id')
        this.field('filename')
        this.field('content')
        this.field('Identifier');

        documents.forEach(doc => {
          this.add(doc);
        });
      });
    });
  }

  async getContextFiles() {
    try {
      const currentFile = await this.props.call('fileManager', 'getCurrentFile');
      const content = await this.props.call('fileManager', 'readFile', currentFile);
      const searchResult = this.indexer.search(content);
      const fcps = await this.processResults(searchResult, currentFile);
      const resolvedFcps = await Promise.all(fcps);
      return resolvedFcps;
    } catch (error) {
      return [];
    }
  }

  async processResults(results: any, currentFile: string) {
    const rmResults = await results.filter(result => {
      const document = this.Documents.find(doc => doc.id === Number(result.ref));
      return document.filename !== currentFile;
    });
    const filteredResults = await rmResults.filter(result => result.score >= this.INDEX_THRESHOLD);
    const topResults = filteredResults.slice(0, this.N_MATCHES);

    const fileContentPairs = topResults.map(async result => {
      const document = this.Documents.find(doc => doc.id === Number(result.ref));
      const currentContent = await this.props.call('fileManager', 'readFile', document.filename);
      return { file: document.filename, content: currentContent };
    });
    return fileContentPairs;
  }

}
