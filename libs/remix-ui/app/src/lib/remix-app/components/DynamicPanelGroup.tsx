// DynamicPanelGroup.tsx
import React, { useRef, useState } from "react";
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
  ImperativePanelHandle,
  ImperativePanelGroupHandle,
} from "react-resizable-panels";
import { TabPanel } from "./TabPanel";
import { v4 as uuidv4 } from "uuid";
import { PanelContent } from "./TestPanel";

const normalizeAndFixLayout = (sizes: number[]): number[] => {
  const total = sizes.reduce((a, b) => a + b, 0);
  const rounded = sizes.map((s) => Math.round((s / total) * 1000) / 10); // round to 0.1%
  const sum = rounded.reduce((a, b) => a + b, 0);
  const diff = Math.round((100 - sum) * 10) / 10;

  // Fix last item to compensate for rounding drift
  if (rounded.length > 0) {
    rounded[rounded.length - 1] += diff;
  }

  return rounded;
};



export const DynamicPanelGroup: React.FC = () => {
  const panelRef = useRef<ImperativePanelGroupHandle>(null);
  const [panels, setPanels] = useState([
    {
      id: uuidv4(),
      tabs: [{ id: "1", label: "First", content: <PanelContent id="1" /> }],
    },
  ]);

  const handleSplitPanel = (index: number) => {
    const currentLayout = panelRef.current?.getLayout() ?? [];

    console.log("currentLayout", currentLayout);
  
    const newPanel = {
      id: uuidv4(),
      tabs: [
        {
          id: uuidv4(),
          label: `${index}`,
          content: <p>Split from panel {panels[index].id}</p>,
        },
      ],
    };
  
    const newPanels = [...panels];
    newPanels.splice(index + 1, 0, newPanel);
    setPanels(newPanels);
  
    requestAnimationFrame(() => {
      const oldSizes = currentLayout;
      const newPanelSize = 20;
      const remaining = 100 - newPanelSize;
  
      const scaledOldSizes = oldSizes.map((s) => (s / 100) * remaining);
      const layout = normalizeAndFixLayout([
        ...scaledOldSizes.slice(0, index + 1),
        newPanelSize,
        ...scaledOldSizes.slice(index + 1),
      ]);
  
      panelRef.current?.setLayout(layout);
    });
  };


  return (

    <PanelGroup direction="horizontal" ref={panelRef} style={{ height: "100vh" }}>
      {panels.map((panel, index) => (
        <React.Fragment key={panel.id}>
          <Panel order={index} id={panel.id} defaultSize={100 / (panels.length)}>
            <button onClick={() => handleSplitPanel(index)}>Split</button>
            <TabPanel tabs={panel.tabs} />
          </Panel>
          {index < panels.length - 1 && <PanelResizeHandle style={{
            backgroundColor: 'var(--primary)',
            width: '2px',
          }} />}
        </React.Fragment>
      ))}
    </PanelGroup>
  );
};