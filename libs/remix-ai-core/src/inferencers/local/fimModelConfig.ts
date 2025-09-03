export interface FIMTokens {
  prefix: string;
  suffix: string;
  middle: string;
}

export interface FIMModelConfig {
  name: string;
  patterns: string[];
  supportsNativeFIM: boolean; // Uses direct prompt/suffix parameters
  fimTokens?: FIMTokens; // For token-based FIM models
  description?: string;
}

// Comprehensive list of FIM-supported models
export const FIM_MODEL_CONFIGS: FIMModelConfig[] = [
  // Models with native FIM support (use prompt/suffix directly)
  {
    name: "Codestral",
    patterns: ["codestral"],
    supportsNativeFIM: true,
    description: "Mistral's code model with native FIM support"
  }
];

export class FIMModelManager {
  private static instance: FIMModelManager;
  private modelConfigs: FIMModelConfig[];
  private userSelectedModels: Set<string> = new Set();

  private constructor() {
    this.modelConfigs = [...FIM_MODEL_CONFIGS];
  }

  public static getInstance(): FIMModelManager {
    if (!FIMModelManager.instance) {
      FIMModelManager.instance = new FIMModelManager();
    }
    return FIMModelManager.instance;
  }

  public supportsFIM(modelName: string): boolean {
    const config = this.findModelConfig(modelName);
    if (!config) return false;

    // Check if user has explicitly selected this model for FIM
    return this.userSelectedModels.has(config.name) || this.isAutoDetected(modelName);
  }

  public usesNativeFIM(modelName: string): boolean {
    const config = this.findModelConfig(modelName);
    return config?.supportsNativeFIM || false;
  }

  public getFIMTokens(modelName: string): FIMTokens | null {
    const config = this.findModelConfig(modelName);
    return config?.fimTokens || null;
  }

  public buildFIMPrompt(prefix: string, suffix: string, modelName: string): string {
    const tokens = this.getFIMTokens(modelName);
    if (!tokens) {
      throw new Error(`Model ${modelName} does not support token-based FIM`);
    }

    return `${tokens.prefix}${prefix}${tokens.suffix}${suffix}${tokens.middle}`;
  }

  private isAutoDetected(modelName: string): boolean {
    const lowerModelName = modelName.toLowerCase();
    const autoDetectPatterns = ['codestral', 'codellama', 'deepseek-coder'];

    return autoDetectPatterns.some(pattern =>
      lowerModelName.includes(pattern.toLowerCase())
    );
  }

  private findModelConfig(modelName: string): FIMModelConfig | null {
    const lowerModelName = modelName.toLowerCase();
    return this.modelConfigs.find(config =>
      config.patterns.some(pattern =>
        lowerModelName.includes(pattern.toLowerCase())
      )
    ) || null;
  }

}