/* eslint-disable no-control-regex */
import { EditorUIProps, monacoTypes } from '@remix-ui/editor';
import { JsonStreamParser, CompletionParams } from '@remix/remix-ai-core';
import * as monaco from 'monaco-editor';
import {
  AdaptiveRateLimiter,
  SmartContextDetector,
  CompletionCache,
} from '../inlineCompetionsLibs';

const _paq = (window._paq = window._paq || [])

export class RemixInLineCompletionProvider implements monacoTypes.languages.InlineCompletionsProvider {
  props: EditorUIProps
  monaco: any
  completionEnabled: boolean
  task: string = 'code_completion'
  currentCompletion: any

  private rateLimiter: AdaptiveRateLimiter;
  private contextDetector: SmartContextDetector;
  private cache: CompletionCache;

  constructor(props: any, monaco: any) {
    this.props = props
    this.monaco = monaco
    this.completionEnabled = true
    this.currentCompletion = {
      text: '',
      item: [],
      task: this.task,
      displayed: false,
      accepted: false,
      onAccepted: () => {
        this.rateLimiter.trackCompletionAccepted()
      }
    }

    this.rateLimiter = new AdaptiveRateLimiter();
    this.contextDetector = new SmartContextDetector();
    this.cache = new CompletionCache();
  }

  async provideInlineCompletions(
    model: monacoTypes.editor.ITextModel,
    position: monacoTypes.Position,
    context: monacoTypes.languages.InlineCompletionContext,
    token: monacoTypes.CancellationToken
  ): Promise<monacoTypes.languages.InlineCompletions<monacoTypes.languages.InlineCompletion>> {
    // Check if completion is enabled
    const isActivate = await this.props.plugin.call('settings', 'get', 'settings/copilot/suggest/activate')
    if (!isActivate) return { items: []}

    const currentTime = Date.now();

    // Check rate limiting
    if (!this.rateLimiter.shouldAllowRequest(currentTime)) {
      return { items: []};
    }

    // Check context appropriateness
    if (!this.contextDetector.shouldShowCompletion(model, position, currentTime)) {
      return { items: []};
    }

    // Record request
    this.rateLimiter.recordRequest(currentTime);

    try {
      const result = await this.executeCompletion(model, position, context, token);
      this.rateLimiter.recordCompletion();
      return result;
    } catch (error) {
      this.rateLimiter.recordCompletion();
      console.warn("rate limit error")
    }
  }

  private async executeCompletion(
    model: monacoTypes.editor.ITextModel,
    position: monacoTypes.Position,
    context: monacoTypes.languages.InlineCompletionContext,
    token: monacoTypes.CancellationToken
  ): Promise<monacoTypes.languages.InlineCompletions<monacoTypes.languages.InlineCompletion>> {
    const getTextAtLine = (lineNumber: number) => {
      const lineRange = model.getFullModelRange().setStartPosition(lineNumber, 1).setEndPosition(lineNumber + 1, 1);
      return model.getValueInRange(lineRange);
    }

    // Get text before and after cursor
    const word = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    });

    const word_after = model.getValueInRange({
      startLineNumber: position.lineNumber,
      startColumn: position.column,
      endLineNumber: model.getLineCount(),
      endColumn: getTextAtLine(model.getLineCount()).length + 1,
    });

    // Create cache key and check cache
    const cacheKey = this.cache.createCacheKey(word, word_after, position, this.task);
    this.currentCompletion.accepted = false

    return await this.cache.handleRequest(cacheKey, async () => {
      return await this.performCompletion(word, word_after, position);
    });
  }

  private async performCompletion(
    word: string,
    word_after: string,
    position: monacoTypes.Position
  ): Promise<monacoTypes.languages.InlineCompletions<monacoTypes.languages.InlineCompletion>> {
    // Check if we should trigger completion based on context

    // Code generation (triple slash comment)
    try {
      const split = word.split('\n')
      if (split.length >= 2) {
        const ask = split[split.length - 2].trimStart()
        if (split[split.length - 1].trim() === '' && ask.startsWith('///')) {
          return await this.handleCodeGeneration(word, word_after, position, ask);
        }
      }
    } catch (e) {
      console.warn(e)
      return { items: []}
    }

    // Code insertion (newline)
    if (word.replace(/ +$/, '').endsWith('\n')) {
      return await this.handleCodeInsertion(word, word_after, position);
    }

    // Regular code completion
    return await this.handleCodeCompletion(word, word_after, position);
  }

  private async handleCodeGeneration(
    word: string,
    word_after: string,
    position: monacoTypes.Position,
    ask: string
  ): Promise<monacoTypes.languages.InlineCompletions<monacoTypes.languages.InlineCompletion>> {
    this.props.plugin.call('terminal', 'log', {
      type: 'aitypewriterwarning',
      value: 'RemixAI - generating code for following comment: ' + ask.replace('///', '')
    })

    const data = await this.props.plugin.call('remixAI', 'code_insertion', word, word_after)
    _paq.push(['trackEvent', 'ai', 'remixAI', 'code_generation'])
    this.task = 'code_generation'

    const parsedData = data.trimStart()
    const item: monacoTypes.languages.InlineCompletion = {
      insertText: parsedData,
      range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column)
    };

    this.currentCompletion.text = parsedData
    this.currentCompletion.item = item

    return {
      items: [item],
      enableForwardStability: true
    }
  }

  private async handleCodeInsertion(
    word: string,
    word_after: string,
    position: monacoTypes.Position
  ): Promise<monacoTypes.languages.InlineCompletions<monacoTypes.languages.InlineCompletion>> {
    try {
      CompletionParams.stop = ['\n\n', '```']
      const output = await this.props.plugin.call('remixAI', 'code_insertion', word, word_after, CompletionParams)
      _paq.push(['trackEvent', 'ai', 'remixAI', 'code_insertion'])
      const generatedText = output

      this.task = 'code_insertion'
      const item: monacoTypes.languages.InlineCompletion = {
        insertText: generatedText,
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column)
      };

      this.currentCompletion.text = generatedText
      this.currentCompletion.item = item

      return {
        items: [item],
        enableForwardStability: true,
      }
    } catch (err) {
      console.log("err: " + err)
      return { items: []}
    }
  }

  private async handleCodeCompletion(
    word: string,
    word_after: string,
    position: monacoTypes.Position
  ): Promise<monacoTypes.languages.InlineCompletions<monacoTypes.languages.InlineCompletion>> {
    try {
      CompletionParams.stop = ['\n', '```']
      this.task = 'code_completion'
      const output = await this.props.plugin.call('remixAI', 'code_completion', word, word_after, CompletionParams)
      _paq.push(['trackEvent', 'ai', 'remixAI', 'code_completion'])
      const generatedText = output
      let clean = generatedText

      if (generatedText.indexOf('@custom:dev-run-script./') !== -1) {
        clean = generatedText.replace('@custom:dev-run-script', '@custom:dev-run-script ')
      }
      clean = clean.replace(word, '')
      clean = this.process_completion(clean, word_after)

      const item: monacoTypes.languages.InlineCompletion = {
        insertText: clean,
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column)
      };

      this.currentCompletion.text = clean
      this.currentCompletion.item = item
      return {
        items: [item],
        enableForwardStability: true,
      }
    } catch (err) {
      const item: monacoTypes.languages.InlineCompletion = { insertText: " " }
      return {
        items: [item],
        enableForwardStability: true,
      }
    }
  }

  process_completion(data: any, word_after: any) {
    const clean = data
    // if clean starts with a comment, remove it
    if (clean.startsWith('//') || clean.startsWith('/*') || clean.startsWith('*') || clean.startsWith('*/')) {
      return ""
    }
    return clean
  }

  handleItemDidShow?(
    completions: monacoTypes.languages.InlineCompletions<monacoTypes.languages.InlineCompletion>,
    item: monacoTypes.languages.InlineCompletion,
    updatedInsertText: string
  ): void {
    this.currentCompletion.displayed = true
    this.currentCompletion.task = this.task

    this.rateLimiter.trackCompletionShown()
    _paq.push(['trackEvent', 'ai', 'remixAI', this.task + '_did_show'])
  }

  handlePartialAccept?(
    completions: monacoTypes.languages.InlineCompletions<monacoTypes.languages.InlineCompletion>,
    item: monacoTypes.languages.InlineCompletion,
    acceptedCharacters: number
  ): void {
    this.currentCompletion.accepted = true
    this.currentCompletion.task = this.task

    this.rateLimiter.trackCompletionAccepted()
    _paq.push(['trackEvent', 'ai', 'remixAI', this.task + '_partial_accept'])
  }

  freeInlineCompletions(
    completions: monacoTypes.languages.InlineCompletions<monacoTypes.languages.InlineCompletion>
  ): void {
    // If completion was shown but not accepted, consider it rejected
    if (this.currentCompletion.displayed && !this.currentCompletion.accepted) {
      this.rateLimiter.trackCompletionRejected()
    }
  }

  // collect stats for debugging
  getStats() {
    return {
      rateLimiter: this.rateLimiter.getStats(),
      contextDetector: this.contextDetector.getStats(),
      cache: this.cache.getStats(),
    };
  }

  groupId?: string;
  yieldsToGroupIds?: string[];
  toString?(): string {
    throw new Error('Method not implemented.');
  }
}