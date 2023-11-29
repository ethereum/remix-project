/* eslint-disable no-control-regex */
import { EditorUIProps, monacoTypes } from '@remix-ui/editor';
import axios, {AxiosResponse} from 'axios'
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
    if (context.selectedSuggestionInfo) {
    	console.log('return empty from provideInlineCompletions')
      return;
    }
    // get text before the position of the completion
    const word = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    });

    if (!word.endsWith(' ') && !word.endsWith('\n') && !word.endsWith(';') && !word.endsWith('.')) {
      console.log('not a trigger char')
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
      if (!split.length) return
      const ask = split[split.length - 2].trimStart()
      if (split[split.length - 1].trim() === '' && ask.startsWith('///')) {
        // use the code generation model
        const {data} = await axios.post('https://gpt-chat.remixproject.org/infer', {comment: ask.replace('///', '')})
        const parsedData = JSON.parse(data).trimStart()
        console.log('parsedData', parsedData)
        const item: monacoTypes.languages.InlineCompletion = {
          insertText: parsedData
        };
        return {
          items: [item],
          enableForwardStability: true
        }
      }
    } catch (e) {
      console.error(e)
    }   
    
    // abort if there is a signal
    if (token.isCancellationRequested) {
      console.log('aborted')
      return
    }

    let result
    try {
      result = await this.props.plugin.call('copilot-suggestion', 'suggest', word)
    } catch (err) {
      return
    }

    const generatedText = (result as any).output[0].generated_text as string
    // the generated text remove a space from the context...
    const clean = generatedText.replace('@custom:dev-run-script', '@custom:dev-run-script ').replace(word, '')
    const item: monacoTypes.languages.InlineCompletion = {
      insertText: clean
    };

    // abort if there is a signal
    if (token.isCancellationRequested) {
      console.log('aborted')
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
