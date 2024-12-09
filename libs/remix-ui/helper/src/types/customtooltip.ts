import { Placement } from 'react-bootstrap/esm/Overlay'
import { OverlayDelay, OverlayTriggerRenderProps } from 'react-bootstrap/esm/OverlayTrigger'

export type CustomTooltipType = {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>> | ((props: OverlayTriggerRenderProps) => React.ReactNode),
  placement?: Placement,
  tooltipId?: string,
  tooltipClasses?:string,
  tooltipText: string | JSX.Element,
  tooltipTextClasses?: string
  delay?: OverlayDelay
  hide?: boolean
  show?: boolean
}