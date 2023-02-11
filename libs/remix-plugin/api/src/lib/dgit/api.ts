import { StatusEvents } from "@remixproject/plugin-utils";
export interface IDgitSystem {
    events: StatusEvents
    methods: {
        init(): void;
        add(cmd: any): string;
        commit(cmd: any): string;
        status(cmd: any): any[];
        rm(cmd: any): string;
        log(cmd: any): any[];
        lsfiles(cmd: any): any[];
        readblob(cmd: any): { oid: string, blob: Uint8Array }
        resolveref(cmd: any): string
        branch(cmd: any): void
        checkout(cmd: any): void
        branches(): string[]
        currentbranch(): string
        push(cmd: any): string
        pull(cmd: any): void
        setIpfsConfig(config:any): boolean
        zip():void
        setItem(name:string, content:string):void
        getItem(name: string): string
        import(cmd: any): void
        export(cmd: any): void
        remotes(): any[]
        addremote(cmd: any): void
        delremote(cmd: any): void
        clone(cmd: any): void
        localStorageUsed(): any
    };
}
