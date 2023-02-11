import { StatusEvents } from '@remixproject/plugin-utils'

export interface IGitSystem {
  events: {
  } & StatusEvents
  methods: {
    //Priority
    clone(url: string): string
    checkout(cmd: string): string // Switch branches or restore working tree files
    init(): string
    add(cmd: string): string 
    commit(cmd: string): string
    fetch(cmd: string): string
    pull(cmd: string): string
    push(cmd: string): string
    reset(cmd: string): string
    status(cmd: string): string
    remote(cmd: string): string 
    log(): string

    //Less priority
    /*
    gitMv(cmd: string): void //Move or rename a file, a directory, or a symlink
    gitRm(cmd: string)
    gitConfig(cmd: string): void //Get and set repository or global options
    gitBranch(cmd: string): void
    gitMerge(cmd: string): void
    gitRebase(cmd: string): void
    gitSwitch(cmd: string): void
    gitTag(cmd: string): void
    gitBlame(cmd: string): void
    */
  }
}
