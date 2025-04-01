import React, { useEffect, useRef } from "react";
import { Panel, PanelProps, ImperativePanelHandle } from "react-resizable-panels";

type PixelSizedPanelProps = PanelProps & {
  pixelSize: number;
  direction?: "horizontal" | "vertical";
};

export const PixelSizedPanel: React.FC<PixelSizedPanelProps> = ({
  pixelSize,
  direction = "horizontal",
  children,
  ...rest
}) => {
  const panelRef = useRef<ImperativePanelHandle>(null);
  const resizeObserverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = resizeObserverRef.current?.parentElement;
    if (!node || !panelRef.current) return;

    const updateSize = () => {
      const containerSize =
        direction === "horizontal" ? node.offsetWidth : node.offsetHeight;

      if (containerSize > 0) {
        const percent = (pixelSize / containerSize) * 100;
        panelRef.current?.resize(percent);
      }
    };

    updateSize(); // initial

    const observer = new ResizeObserver(updateSize);
    observer.observe(node);

    return () => observer.disconnect();
  }, [pixelSize, direction]);

  return (
    <>
      <Panel ref={panelRef} {...rest}>
        {children}
      </Panel>
      <div ref={resizeObserverRef} style={{ display: "none" }} />
    </>
  );
};