export interface Dependency {
    version: string
    name: string
    alias?: string
    import?: boolean
    require: boolean
    windowImport?: boolean
  }

export interface Replacements {
    [key: string]: string
  }

export interface ProjectConfiguration {
    name: string
    publish: boolean
    description: string
    dependencies: Dependency[]
    replacements: Replacements
    title: string
    errorStatus: boolean
    error: string
    isLoading: boolean
  }

export interface customScriptRunnerConfig {
    baseConfiguration: string
    dependencies: Dependency[]
  }

export interface ScriptRunnerConfig {
    defaultConfig: string,
    customConfig: customScriptRunnerConfig
  }

export interface IScriptRunnerState {
    customConfig: customScriptRunnerConfig
    configurations: ProjectConfiguration[]
    activeConfig: ProjectConfiguration
    enableCustomScriptRunner: boolean
  }

