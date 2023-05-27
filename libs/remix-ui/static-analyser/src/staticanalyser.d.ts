import { CompilationResult, SourceWithTarget } from '@remixproject/plugin-api'

import { ViewPlugin } from '@remixproject/engine-web';
import { EventEmitter } from 'events';
import Registry from '../state/registry';
export declare class AnalysisTab extends ViewPlugin {
    event: any;
    events: EventEmitter;
    registry: Registry;
    element: HTMLDivElement;
    _components: any;
    _deps: {
        offsetToLineColumnConverter: any;
    };
    dispatch: any;
    constructor();
    onActivation(): Promise<void>;
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

type RemixUiStaticAnalyserReducerActionType = {
  type: 'compilationFinished' | '' | any,
  payload: RemixUiStaticAnalyserState
}

