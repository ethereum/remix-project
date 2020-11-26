export interface TreeViewProps {
    children?: React.ReactNode,
    id?: string
}

export interface TreeViewItemProps {
    children?: React.ReactNode,
    id?: string,
    label: string | number | React.ReactNode,
    expand?: boolean,
    onClick?: VoidFunction,
    className?: string,
    iconX?: string,
    iconY?: string,
    icon?: string
}
