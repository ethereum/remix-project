import { ReactNode } from "react"
import { Placement } from "react-bootstrap/esm/Overlay"

export type CustomTooltipType = {
  children: ReactNode,
  placement?: Placement,
  tooltipId?: string,
  tooltipClasses?:string,
  tooltipText: string
}