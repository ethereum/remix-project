import { CompilationResult, SourceWithTarget } from '@remixproject/plugin-api'

import { ViewPlugin } from '@remixproject/engine-web';
import { EventEmitter } from 'events';
import Registry from '../state/registry';
export declare class AnalysisTab extends ViewPlugin {
  event: EventManager;
  events: EventEmitter;
  hints: {
    formattedMessage: string;
    type: any;
    column: number;
    line: number;
  }[]
  internalCount: number
  registry: Registry;
  element: HTMLDivElement;
  _components: any;
  _deps: {
    offsetToLineColumnConverter: any;
  };
  dispatch: any;
  constructor();
  onActivation(): Promise<void>;
  changedStatus(payload: any[]): Promise<void>;
  setDispatch(dispatch: any): void;
  render(): JSX.Element;
  updateComponent(state: any): JSX.Element;
  renderComponent(): void;
}

type RemixUiStaticAnalyserState = {
  file: string,
  source: SourceWithTarget,
  languageVersion: string,
  data: CompilationResult
  input?: string
  version?: string
}

type SolHintReport = {
  column: number,
  line: number,
  type: 'warning' | 'error',
  formattedMessage: string,
  options?: ErrorRendererOptions
}

type SolHintTabChildProps = {
  analysisModule: AnalysisTab
  currentFile: string
  hints: SolHintReport[]
}

type RemixUiStaticAnalyserReducerActionType = {
  type: 'compilationFinished' | '' | any,
  payload: RemixUiStaticAnalyserState
}

interface ErrorRendererProps {
  message: any;
  options: ErrorRendererOptions,
  hasWarning: boolean,
  editor: any,
  warningModuleName: string,
}

type ErrorRendererOptions = {
  "type": "warning" | "error",
  "useSpan": true,
  "errFile": string
  "fileName": string,
  "isLibrary": boolean,
  "errLine": number,
  "errCol": number,
  "item": {
      "warning": string,
      "location": string
  },
  "name": string,
  "locationString": string,
  "location": {
      "start": {
          "line": number,
          "column": number
      },
      "end": {
          "line": number,
          "column": number
      }
  }
}


type SlitherAnalysisResultType = {
description: string,
  title: string,
  confidence: string,
  severity: string,
  more?: any,
  sourceMap: [
      {
          type: string,
          name: string,
          source_mapping: {
            start: number,
            length: number,
            filename_relative: string,
            filename_absolute: string,
            filename_short: string,
            is_dependency: false,
            lines: number[],
            starting_column: number,
            ending_column: number
        },
          type_specific_fields: {
              parent: {
                  type: string,
                  name: string,
                  source_mapping: {
                      start: number,
                      length: number,
                      filename_relative: string,
                      filename_absolute: string,
                      filename_short: string,
                      is_dependency: false,
                      lines: number[],
                      starting_column: number,
                      ending_column: number
                  }
              },
              signature: string
          },
          additional_fields: {
              target: string,
              convention: string
          }
      }
  ]
}

export type SlitherAnalysisResults = {
  count: number,
  data: SlitherAnalysisResultType[]
  status: boolean
}
