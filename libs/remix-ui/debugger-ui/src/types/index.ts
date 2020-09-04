export interface ExtractData {
    children?: Array<{key: number | string, value: string}> | { key: number | string, value: string }
    self?: string,
    isNode?: boolean,
    isLeaf?: boolean,
    isArray?: boolean,
    isStruct?: boolean,
    isMapping?: boolean,
    type?: string
}

export type ExtractFunc = (json: any, parent?: any) => ExtractData

export interface DropdownPanelProps {
    dropdownName: string,
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
    extractFunc?: ExtractFunc
}