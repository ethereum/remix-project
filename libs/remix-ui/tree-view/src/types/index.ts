export interface TreeViewProps {
    children?: React.ReactNode,
    key: string
}

export interface TreeViewItemProps {
    children?: React.ReactNode,
    key: string,
    label: string | number | React.ReactNode
}