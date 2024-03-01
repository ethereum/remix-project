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
  constructor(props: any, monaco: any) {
    this.props = props
    this.monaco = monaco
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
      if (split[split.length - 1].trim() === '' && ask.startsWith('///')) {
        // use the code generation model, only take max 1000 word as context 
        this.props.plugin.call('terminal', 'log', {type: 'typewriterwarning', value: 'Solcoder - generating code for following comment: ' + ask.replace('///', '')})

        const data = await this.props.plugin.call('solcoder', 'code_completion', word)
        if ("error" in data) return

        console.log("solcoder completion data", data)
        const parsedData = data[0].trimStart() //JSON.parse(data).trimStart()
        const item: monacoTypes.languages.InlineCompletion = {
          insertText: parsedData
        };
        return {
          items: [item],
          enableForwardStability: true
        }
      }
    } catch (e) {
      return
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
      result = await this.props.plugin.call('copilot-suggestion', 'suggest', word)
      const generatedText = (result as any).output[0].generated_text as string
      let clean = generatedText
      if (generatedText.indexOf('@custom:dev-run-script./') !== -1) {
        clean = generatedText.replace('@custom:dev-run-script', '@custom:dev-run-script ')
      }
      clean = clean.replace(word, '')
      clean = this.process_completion(clean)

      const item: monacoTypes.languages.InlineCompletion = {
        insertText: clean
      };
      return {
        items: [item],
        enableForwardStability: true
      }
    } catch (err) {
      return
    }
  }

  process_completion(data: any) {
    const lines = data.split('\n') 
    const result = []
    let incode = 0
    for (const line of lines){
      if (line.includes('{')) incode += 1
      if (line.includes('}')) incode -= 1

      if (!line.includes('//') || !line.endsWith('}')) result.push(line)
      if (incode === 0) {
        return result.join('\n').trimStart()
      }

      if (incode <= 0 && line.includes('}')) {
        return result.join('\n').trimStart()
      }
    }
    return result.join('\n').trimStart()
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
