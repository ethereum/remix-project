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
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";




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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 50,
        tolerance: 5,
      },
    })
  );

  const handleClosePanel = (index: number) => {
    if (panels.length === 1) return; // Optional: prevent closing the last panel

    const currentLayout = panelRef.current?.getLayout() ?? [];
    const newPanels = [...panels];
    newPanels.splice(index, 1);
    setPanels(newPanels);

    requestAnimationFrame(() => {
      const removedSize = currentLayout[index];
      const remaining = currentLayout.filter((_, i) => i !== index);
      const total = remaining.reduce((a, b) => a + b, 0);

      // Redistribute removed size proportionally
      const adjusted = remaining.map((s) => s + (s / total) * removedSize);
      const layout = normalizeAndFixLayout(adjusted);

      panelRef.current?.setLayout(layout);
    });
  };

  const handleSplitPanel = (index: number) => {
    const currentLayout = panelRef.current?.getLayout() ?? [];

    const newId = uuidv4();
    const newPanel = {
      id: newId,
      tabs: [
        {
          id: `${newId}_1`,
          label: `${newId}_1`.substring(0, 4),
          content: <PanelContent id={`${newId}_1`} />,
        },
        {
          id: `${newId}_2`,
          label: `${newId}_2`.substring(0, 4),
          content: <PanelContent id={`${newId}_2`} />,
        }
      ],
    };

    const newPanels = [...panels];
    newPanels.splice(index + 1, 0, newPanel);
    setPanels(newPanels);

    requestAnimationFrame(() => {
      let layout: number[];

      if (currentLayout.length === 1) {
        // Only one panel → split evenly
        layout = [50, 50];
      } else {
        const newPanelSize = 20;
        const remaining = 100 - newPanelSize;

        const scaledOldSizes = currentLayout.map((s) => (s / 100) * remaining);
        layout = normalizeAndFixLayout([
          ...scaledOldSizes.slice(0, index + 1),
          newPanelSize,
          ...scaledOldSizes.slice(index + 1),
        ]);
      }

      panelRef.current?.setLayout(layout);
    });
  };

  const handleMoveTab = (tabId: string, fromPanel: string, toPanel: string) => {
    console.log("Move tab", tabId, "from", fromPanel, "to", toPanel);
    
    setPanels((prev) => {
      const newPanels = prev.map((p) => {
        if (p.id === fromPanel) {
          return {
            ...p,
            tabs: p.tabs.filter((tab) => tab.id !== tabId),
          };
        } else if (p.id === toPanel) {
          const movedTab = prev
            .find((p) => p.id === fromPanel)
            ?.tabs.find((tab) => tab.id === tabId);
          return {
            ...p,
            tabs: [...p.tabs, movedTab!],
          };
        } else {
          return p;
        }
      });
      console.log(newPanels);
      return newPanels;
    });
  };


  return (
    <DndContext
      sensors={sensors}
      onDragEnd={(event) => {
        const { active, over } = event;
        if (!active || !over) return;

        const fromPanel = active.data?.current?.fromPanel;
        const tabId = active.id as string;
        const toPanel = over.id as string;

        if (fromPanel && toPanel && fromPanel !== toPanel) {
          handleMoveTab(tabId, fromPanel, toPanel);
        }
      }}
    >
      <PanelGroup direction="horizontal" ref={panelRef} style={{ height: "100vh" }}>
        {panels.map((panel, index) => (
          <React.Fragment key={panel.id}>
            <Panel order={index} id={panel.id} defaultSize={100 / (panels.length)}>
              <button onClick={() => handleSplitPanel(index)}>Split</button>
              <button onClick={() => handleClosePanel(index)}>✖</button>
              <TabPanel panelId={panel.id} tabs={panel.tabs} />
            </Panel>
            {index < panels.length - 1 && <PanelResizeHandle style={{
              backgroundColor: 'var(--primary)',
              width: '2px',
            }} />}
          </React.Fragment>
        ))}
      </PanelGroup>
    </DndContext>
  );
};