import { EditorUIProps, monacoTypes } from '@remix-ui/editor';
const controller = new AbortController();
const { signal } = controller;
const result: string = ''

export class RemixInLineCompletionProvider implements monacoTypes.languages.InlineCompletionsProvider {
  props: EditorUIProps
  monaco: any
  constructor(props: any, monaco: any) {
    this.props = props
    this.monaco = monaco
  }
  async provideInlineCompletions(model: monacoTypes.editor.ITextModel, position: monacoTypes.Position, context: monacoTypes.languages.InlineCompletionContext, token: monacoTypes.CancellationToken): Promise<monacoTypes.languages.InlineCompletions<monacoTypes.languages.InlineCompletion>> {

    // get text before the position of the completion
    const word = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    });

    // abort if there is a signal
    

    const url = 'http://localhost:9090/infer'
    const data  = {'prefix': 'contract test', 'max_token': 20}

    const response = await fetch(url, {
      method: "POST", 
      mode: "no-cors", 
      cache: "no-cache", 
      headers: {
        "Content-Type": "application/json",
      },
      signal,
      redirect: "follow", 
      referrerPolicy: "no-referrer", 
      body: JSON.stringify(data), 
    });
  

 
    
    console.log(response.body)
    console.log('word', word)

   

    const item: monacoTypes.languages.InlineCompletion = {
      insertText: {
        snippet: 'hello world\nhuman readable',
      }      
    };
    
    return {
      items: [item],
    }

  }
  handleItemDidShow?(completions: monacoTypes.languages.InlineCompletions<monacoTypes.languages.InlineCompletion>, item: monacoTypes.languages.InlineCompletion, updatedInsertText: string): void {
   
  }
  handlePartialAccept?(completions: monacoTypes.languages.InlineCompletions<monacoTypes.languages.InlineCompletion>, item: monacoTypes.languages.InlineCompletion, acceptedCharacters: number): void {

  }
  freeInlineCompletions(completions: monacoTypes.languages.InlineCompletions<monacoTypes.languages.InlineCompletion>): void {
    
  }
  groupId?: string;
  yieldsToGroupIds?: string[];
  toString?(): string {
    throw new Error('Method not implemented.');
  }
}