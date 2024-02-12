/* eslint-disable no-control-regex */
import { EditorUIProps, monacoTypes } from '@remix-ui/editor';
import axios, {AxiosResponse} from 'axios'
import { slice } from 'lodash';
const _paq = (window._paq = window._paq || [])

const controller = new AbortController();
const { signal } = controller;
const result: string = ''

export class RemixInLineCompletionProvider implements monacoTypes.languages.InlineCompletionsProvider {
  props: EditorUIProps
  monaco: any
  running:boolean
  constructor(props: any, monaco: any) {
    this.props = props
    this.monaco = monaco
    this.running = false
  }

  async provideInlineCompletions(model: monacoTypes.editor.ITextModel, position: monacoTypes.Position, context: monacoTypes.languages.InlineCompletionContext, token: monacoTypes.CancellationToken): Promise<monacoTypes.languages.InlineCompletions<monacoTypes.languages.InlineCompletion>> {
    if (context.selectedSuggestionInfo) {
      return;
    }
    // get text before the position of the completion
    const word = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    });

    
    if (!word.endsWith(' ') &&
      !word.endsWith('\n') &&
      !word.endsWith(';') && 
      !word.endsWith('.') && 
      !word.endsWith('(')) {
      return;
    }

    try {
      const isActivate = await this.props.plugin.call('copilot-suggestion', 'isActivate')
      if (!isActivate) return
    } catch (err) {
      return;
    }

    try {
      const split = word.split('\n')
      if (split.length < 2) return
      const ask = split[split.length - 2].trimStart()
      if (split[split.length - 1].trim() === '' && ask.startsWith('///') && (!this.running)) {
        // use the code generation model, only take max 1000 word as context 
        this.running = true
        const data = await this.props.plugin.call('solcoder', 'code_completion', word)
        console.log("solcoder completion data", data)
        const parsedData = data[0].trimStart() //JSON.parse(data).trimStart()
        const item: monacoTypes.languages.InlineCompletion = {
          insertText: parsedData
        };
        this.running =false
        return {
          items: [item],
          enableForwardStability: true
        }
      }
    } catch (e) {
      console.error(e)
    }   

    if (word.split('\n').at(-1).trimStart().startsWith('//') || 
        word.split('\n').at(-1).trimStart().startsWith('/*') ||
        word.split('\n').at(-1).trimStart().startsWith('*') ||
        word.split('\n').at(-1).trimStart().startsWith('*/')
        ){
      return; // do not do completion on single and multiline comment
    }

    
    // abort if there is a signal
    if (token.isCancellationRequested) {
      return
    }

    let result
    try {
      if (!this.running){
        result = await this.props.plugin.call('copilot-suggestion', 'suggest', word)
        this.running = true
      }
    } catch (err) {
      this.running=false
      return
    }

    const generatedText = (result as any).output[0].generated_text as string
    const clean = generatedText
    console.log('solcoder inline data:\n', clean)

    const item: monacoTypes.languages.InlineCompletion = {
      insertText: clean
    };
    this.running=false

    // abort if there is a signal
    if (token.isCancellationRequested) {
      return
    }
    return {
      items: [item],
      enableForwardStability: true
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
