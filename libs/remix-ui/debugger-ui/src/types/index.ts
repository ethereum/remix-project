export interface ExtractData {
    children?: Array<{key: number | string, value: ExtractData}>
    self?: string | number,
    isNode?: boolean,
    isLeaf?: boolean,
    isArray?: boolean,
    isStruct?: boolean,
    isMapping?: boolean,
    type?: string,
    isProperty?: boolean
}

export type ExtractFunc = (json: any, parent?: any) => ExtractData

export interface DropdownPanelProps {
    dropdownName: string,
    dropdownMessage?: string,
    opts: {
        json: boolean,
        displayContentOnly?: boolean,
        css?: {
            [key: string]: string
        }
    },
    codeView?: string[],
    index?: number,
    calldata?: {
        [key: string]: string
    },
    header?: string,
    extractFunc?: ExtractFunc,
    formatSelfFunc?: FormatSelfFunc
}

export type FormatSelfFunc = (key: string, data: ExtractData) => JSX.Element