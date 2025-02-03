import lunr from 'lunr';

interface Document {
  id: number;
  filename: string;
  content: string;
  identifier: number;
}

interface indexT{
  isIndexed: boolean;
  lastIndexedTime?: number;
  reason?: string;
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
  indexed: indexT = {
    isIndexed: false,
    lastIndexedTime: 0,
    reason: 'Init',
  };

  constructor(props) {
    this.props = props;
    this.listenForChanges();
    this.indexer =lunr(function () {
      this.ref('id')
      this.field('filename')
      this.field('content')
      this.field('Identifier');
    });

    // listen for file changes
    this.props.on('fileManager', 'fileRemoved', (path) => { this.indexed.isIndexed = false; });

    setInterval(() => {
      this.indexWorkspace()
    }, 60000)
  }

  listenForChanges() {
    this.props.on('fileManager', 'fileAdded', (path) => { this.indexed = { isIndexed: false, reason:"fileAdded" } });
    this.props.on('fileManager', 'fileRemoved', (path) => { this.indexed = { isIndexed: false, reason:"fileRemoved" } });
    this.props.on('filePanel', 'workspaceCreated', () => { this.indexed = { isIndexed: false, reason:"workspaceCreated" } });
    this.props.on('filePanel', 'workspaceRenamed', () => { this.indexed = { isIndexed: false, reason:"workspaceRenamed" }});
    this.props.on('filePanel', 'workspaceDeleted', () => { this.indexed = { isIndexed: false, reason:"workspaceDeleted" } });
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
    return documents;
  }

  indexWorkspace() {
    this.getDcocuments().then((documents) => {
      this.indexer =lunr(function () {
        this.ref('id')
        this.field('filename')
        this.field('content')
        this.field('Identifier');

        documents.forEach(doc => {
          this.add(doc);
        });
      });
      this.Documents = documents;
    });

    this.indexed = { isIndexed: true, lastIndexedTime: Date.now(), reason: 'init Indexing' };
  }

  async getContextFiles(prompt) {
    try {
      if (!this.indexed.isIndexed) {
        this.indexWorkspace();
      }
      const currentFile = await this.props.call('fileManager', 'getCurrentFile');
      const content = prompt;
      const searchResult = this.indexer.search(content)
      const fcps = await this.processResults(searchResult, currentFile);
      const resolvedFcps = await Promise.all(fcps);
      return resolvedFcps;
    } catch (error) {
      return [];
    }
  }

  async processResults(results: any, currentFile: string) {
    const rmResults = await results.filter(result => {
      return this.Documents.find(doc => doc.id === Number(result.ref)).filename !== currentFile;
    });
    const extResults = await rmResults.filter(result => {
      return this.Documents.find(doc => doc.id === Number(result.ref)).filename.split('.').pop() === currentFile.split('.').pop();
    });
    const topResults = await extResults.filter(result => result.score >= this.INDEX_THRESHOLD).slice(0, this.N_MATCHES);

    const fileContentPairs = topResults.map(async result => {
      const document = this.Documents.find(doc => doc.id === Number(result.ref));
      const currentContent = await this.props.call('fileManager', 'readFile', document.filename);
      return { file: document.filename, content: currentContent };
    });
    return fileContentPairs;
  }

  // TODO rm context files length
  static refineContext(words1: string, words2: string, maxWords: number=6500) {
    // Avoid model out of context
    const totalWords = words1.length + words2.length;
    if (totalWords <= maxWords) {
      console.log('total words less than max words', totalWords);
      return [words1, words2];
    }
    const halfMaxWords = Math.floor(maxWords / 2);

    let takeFromText1 = words1.length < halfMaxWords ? words1.length : halfMaxWords;
    let takeFromText2 = words2.length < halfMaxWords ? words2.length : halfMaxWords;

    // Adjust if one text is taking more than half, we balance by limiting the other text
    if (words1.length < halfMaxWords && words2.length + words1.length <= maxWords) {
      takeFromText2 = Math.min(words2.length, maxWords - words1.length);
    } else if (words2.length < halfMaxWords && words1.length + words2.length <= maxWords) {
      takeFromText1 = Math.min(words1.length, maxWords - words2.length);
    } else if (words1.length < halfMaxWords && words2.length + words1.length >= maxWords) {
      takeFromText2 = Math.min(words2.length, maxWords - words1.length);
    } else if (words2.length > halfMaxWords && words1.length + words2.length <= maxWords) {
      takeFromText1 = Math.min(words1.length, maxWords - words2.length);
    }

    const splicedText1 = words1.slice(words1.length - takeFromText1);
    const splicedText2 = words2.slice(words2.length - takeFromText2);
    console.log('take from text 1', takeFromText1)
    console.log('take from text 2', takeFromText2)

    console.log('Spliced text 1 length:', splicedText1.length);
    console.log('Spliced text 2 length:', splicedText2.length);
    console.log('initial word 1 length:', words1.length);
    console.log('initial word 2 length:', words2.length);
    console.log('text 1:', splicedText1);
    console.log('text 2:', splicedText2);

    return [splicedText1 , splicedText2]
  }

}
