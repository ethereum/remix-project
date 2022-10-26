import { Placement } from 'react-bootstrap/esm/Overlay'
import { OverlayTriggerRenderProps } from 'react-bootstrap/esm/OverlayTrigger'

export type CustomTooltipType = {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>> | ((props: OverlayTriggerRenderProps) => React.ReactNode),
  placement?: Placement,
  tooltipId?: string,
  tooltipClasses?:string,
  tooltipText: string,
  tooltipTextClasses?: string
}