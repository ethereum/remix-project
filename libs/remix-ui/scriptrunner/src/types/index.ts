export interface Dependency {
    version: string;
    name: string;
    alias?: string;
    import: boolean;
    require?: boolean;
    windowImport?: boolean;
  }
  
  export interface Replacements {
    [key: string]: string;
  }
  
  export interface ProjectConfiguration {
    name: string;
    publish: boolean;
    description: string;
    dependencies: Dependency[];
    replacements: Replacements;
  }

  export interface customScriptRunnerConfig {
    baseConfiguration: string;
    dependencies: Dependency[];
  }