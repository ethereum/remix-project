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
  },

  // Token-based FIM models
  {
    name: "CodeLlama",
    patterns: ["codellama", "code-llama"],
    supportsNativeFIM: false,
    fimTokens: {
      prefix: "<PRE>",
      suffix: "<SUF>",
      middle: "<MID>"
    },
    description: "Meta's CodeLlama with FIM tokens"
  },
  {
    name: "DeepSeek Coder",
    patterns: ["deepseek-coder", "deepseek"],
    supportsNativeFIM: false,
    fimTokens: {
      prefix: "<｜fim▁begin｜>",
      suffix: "<｜fim▁hole｜>",
      middle: "<｜fim▁end｜>"
    },
    description: "DeepSeek's code model with FIM support"
  },
  {
    name: "StarCoder",
    patterns: ["starcoder", "star-coder"],
    supportsNativeFIM: false,
    fimTokens: {
      prefix: "<fim_prefix>",
      suffix: "<fim_suffix>",
      middle: "<fim_middle>"
    },
    description: "BigCode's StarCoder with FIM tokens"
  },
  {
    name: "Code Gemma",
    patterns: ["codegemma", "code-gemma"],
    supportsNativeFIM: false,
    fimTokens: {
      prefix: "<|fim_prefix|>",
      suffix: "<|fim_suffix|>",
      middle: "<|fim_middle|>"
    },
    description: "Google's Code Gemma with FIM support"
  },
  {
    name: "Qwen Coder",
    patterns: ["qwen", "qwencoder", "qwen2.5-coder"],
    supportsNativeFIM: false,
    fimTokens: {
      prefix: "<fim_prefix>",
      suffix: "<fim_suffix>",
      middle: "<fim_middle>"
    },
    description: "Alibaba's Qwen Coder with FIM tokens"
  },
  {
    name: "CodeT5+",
    patterns: ["codet5", "codet5+", "codet5-plus"],
    supportsNativeFIM: false,
    fimTokens: {
      prefix: "<extra_id_0>",
      suffix: "<extra_id_1>",
      middle: "<extra_id_2>"
    },
    description: "Salesforce's CodeT5+ with FIM support"
  },
  {
    name: "WizardCoder",
    patterns: ["wizardcoder", "wizard-coder"],
    supportsNativeFIM: false,
    fimTokens: {
      prefix: "<fim_prefix>",
      suffix: "<fim_suffix>",
      middle: "<fim_middle>"
    },
    description: "WizardLM's coding model with FIM"
  },
  {
    name: "Phind CodeLlama",
    patterns: ["phind-codellama", "phind"],
    supportsNativeFIM: false,
    fimTokens: {
      prefix: "<PRE>",
      suffix: "<SUF>",
      middle: "<MID>"
    },
    description: "Phind's fine-tuned CodeLlama"
  },
  {
    name: "InCoder",
    patterns: ["incoder", "in-coder"],
    supportsNativeFIM: false,
    fimTokens: {
      prefix: "<|fim▁begin|>",
      suffix: "<|fim▁hole|>",
      middle: "<|fim▁end|>"
    },
    description: "Facebook's InCoder model"
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