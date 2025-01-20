import FlexSearch from 'flexsearch';
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
          identifier: c*34,
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

  async searchIndex(query: string) {
    try {
      const searchResult = this.indexer.search(query);
      console.log('Search result', searchResult);
      return searchResult[0];
    } catch (error) {
      console.log('Error searching index', error);
      return null;
    }
  }

}
