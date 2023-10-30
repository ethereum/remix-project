import { EditorUIProps, monacoTypes } from '@remix-ui/editor';
import { SuggestionService } from '../suggestion-service/suggestion-service'
const controller = new AbortController();
const { signal } = controller;
const result: string = ''

export class RemixInLineCompletionProvider implements monacoTypes.languages.InlineCompletionsProvider {
  props: EditorUIProps
  monaco: any
  suggestionService: SuggestionService
  constructor(props: any, monaco: any) {
    this.props = props
    this.monaco = monaco
    this.suggestionService = new SuggestionService()
    this.suggestionService.events.on('progress', (data) => {
      this.props.plugin.call('terminal', 'log', {type: 'info', value: `loading Solidity copilot: ${(data.loaded / data.total) * 100}% done.` })
    })
    this.suggestionService.events.on('done', (data) => {
      this.props.plugin.call('terminal', 'log', { type: 'info', value: `Solidity copilot loaded.`})
    })
    this.suggestionService.events.on('ready', (data) => {
      this.props.plugin.call('terminal', 'log', { type: 'info', value: `Solidity copilot ready to use.`})
    })
  }

  async provideInlineCompletions(model: monacoTypes.editor.ITextModel, position: monacoTypes.Position, context: monacoTypes.languages.InlineCompletionContext, token: monacoTypes.CancellationToken): Promise<monacoTypes.languages.InlineCompletions<monacoTypes.languages.InlineCompletion>> {
    // get text before the position of the completion
    const word = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    });

    const result = await this.suggestionService.suggest(word, 3, 0.5, 5, false)
    const generatedText = (result as any).output[0].generated_text as string
    console.log(word, result)
    
    const clean = generatedText.replace(word, '')
    console.log(clean)
    const item: monacoTypes.languages.InlineCompletion = {
      insertText: {
        snippet: clean
      }
    };

    // abort if there is a signal
    if (token.isCancellationRequested) {
      console.log('aborted')
      return { items: [] };
    }    
    return {
      items: [item]
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