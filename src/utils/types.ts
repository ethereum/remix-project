import { UserMethodDoc, DevMethodDoc, DeveloperDocumentation, UserDocumentation } from "@remixproject/plugin";

export interface MethodsDocumentation {
    [x: string]: UserMethodDoc | DevMethodDoc
}

export interface ContractDocumentation {
    methods: MethodsDocumentation;
    author: string;
    title: string;
    details: string;
    notice: string;
}

export type MethodDoc = DevMethodDoc & UserMethodDoc

export type TemplateDoc<T> = { [key in keyof T]: (...params: any[]) => string }

// Contract
export type ContractDoc = DeveloperDocumentation & UserDocumentation

export interface FunctionDocumentation {
    name: string
    type: string
    devdoc?: Partial<MethodDoc>
    inputs: ParameterDocumentation[]
    outputs: ParameterDocumentation[]
}

export interface ParameterDocumentation {
    name: string
    type: string
    description: string
}

export type HTMLContent = string
