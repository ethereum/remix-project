export interface TreeViewProps {
    children?: React.ReactNode,
    id?: string
}

export interface TreeViewItemProps {
    children?: React.ReactNode,
    id?: string,
    label: string | number | React.ReactNode,
    expand?: boolean,
    onClick?: (...args: any) => void,
    className?: string,
    iconX?: string,
    iconY?: string,
    icon?: string,
    labelClass?: string,
    controlBehaviour?: boolean
    innerRef?: any,
    onContextMenu?: (...args: any) => void
}
