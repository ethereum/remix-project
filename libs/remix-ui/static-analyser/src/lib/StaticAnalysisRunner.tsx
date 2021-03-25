import { AnalysisReport, CompilationResult } from './types/types';

export interface staticAnalysisRunner {
  run(
    compilationResult: CompilationResult,
    toRun: number[],
    callback: (reports: AnalysisReport[]) => void
  ): void;
  modules(): any[];
}
