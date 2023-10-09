import { OverlayTriggerRenderProps, OverlayDelay } from 'react-bootstrap/esm/OverlayTrigger';
import { Placement } from 'react-bootstrap/esm/types';

export type CustomTooltipType = {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>> | ((props: OverlayTriggerRenderProps) => React.ReactNode),
  placement?: Placement,
  tooltipId?: string,
  tooltipClasses?:string,
  tooltipText: string | JSX.Element,
  tooltipTextClasses?: string
  delay?: OverlayDelay
}