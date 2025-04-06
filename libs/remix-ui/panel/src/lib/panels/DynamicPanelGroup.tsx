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
import { PanelContent } from "./PanelContent";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useLayoutContext } from "@remix-ui/panel";




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
  const { panels, setPanels, focusedGroupId, setFocusedGroupId } = useLayoutContext();
  const [activeDropTarget, setActiveDropTarget] = useState<string | null>(null);

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

  const moveTabToPosition = (
    tabId: string,
    fromPanelId: string,
    toPanelId: string,
    targetTabId: string,
    side: "left" | "right"
  ) => {
    setPanels((prev) => {
      const from = prev.find((p) => p.id === fromPanelId);
      const to = prev.find((p) => p.id === toPanelId);
      if (!from || !to) return prev;
  
      const movedTab = from.tabs.find((tab) => tab.id === tabId);
      if (!movedTab) return prev;
  
      // Remove tab from source
      const updatedFromTabs = from.tabs.filter((tab) => tab.id !== tabId);
  
      // Calculate insertion index
      const targetIndex = to.tabs.findIndex((tab) => tab.id === targetTabId);
      const insertIndex = side === "left" ? targetIndex : targetIndex + 1;
  
      // Remove from source first if it's the same panel to prevent index shift
      const isSamePanel = fromPanelId === toPanelId;
      let newTabs = isSamePanel ? updatedFromTabs : [...to.tabs];
      newTabs.splice(insertIndex, 0, movedTab);
  
      const newPanels = prev
        .map((p) => {
          if (p.id === fromPanelId && !isSamePanel) {
            return { ...p, tabs: updatedFromTabs };
          }
          if (p.id === toPanelId) {
            return { ...p, tabs: newTabs };
          }
          return p;
        })
        .filter((p) => p.tabs.length > 0); // Remove empty panel
  
      // Layout update if needed
      if (!isSamePanel) {
        requestAnimationFrame(() => {
          const currentLayout = panelRef.current?.getLayout() ?? [];
          const indexToRemove = prev.findIndex((p) => p.id === fromPanelId);
          const removedSize = currentLayout[indexToRemove];
          const remaining = currentLayout.filter((_, i) => i !== indexToRemove);
          const total = remaining.reduce((a, b) => a + b, 0);
          const adjusted = remaining.map((s) => s + (s / total) * removedSize);
          const layout = normalizeAndFixLayout(adjusted);
          panelRef.current?.setLayout(layout);
        });
      }
  
      return newPanels;
    });
  };

  const findPanelIdForTab = (tabId: string): string | null => {
    const panel = panels.find((p) => p.tabs.some((t) => t.id === tabId));
    return panel?.id || null;
  };

  const handleMoveTab = (tabId: string, fromPanel: string, toPanel: string) => {
    console.log("Move tab", tabId, "from", fromPanel, "to", toPanel);

    setPanels((prev) => {
      const from = prev.find((p) => p.id === fromPanel);
      const to = prev.find((p) => p.id === toPanel);
      if (!from || !to) return prev;

      const movedTab = from.tabs.find((tab) => tab.id === tabId);
      if (!movedTab) return prev;

      const newPanels = prev
        .map((p) => {
          if (p.id === fromPanel) {
            return {
              ...p,
              tabs: p.tabs.filter((tab) => tab.id !== tabId),
            };
          } else if (p.id === toPanel) {
            return {
              ...p,
              tabs: [...p.tabs, movedTab],
            };
          } else {
            return p;
          }
        })
        .filter((p) => p.tabs.length > 0); // 🧼 remove empty panel immediately

      requestAnimationFrame(() => {
        const currentLayout = panelRef.current?.getLayout() ?? [];

        // If a panel was removed, recalculate layout
        if (newPanels.length < prev.length) {
          const indexToRemove = prev.findIndex((p) => p.id === fromPanel);
          const removedSize = currentLayout[indexToRemove];
          const remaining = currentLayout.filter((_, i) => i !== indexToRemove);
          const total = remaining.reduce((a, b) => a + b, 0);

          const adjusted = remaining.map((s) => s + (s / total) * removedSize);
          const layout = normalizeAndFixLayout(adjusted);

          panelRef.current?.setLayout(layout);
        }
      });

      return newPanels;
    });
  };


  return (
    <DndContext
      sensors={sensors}
      onDragOver={(event) => {
        const overPanelId = event.over?.id;
        if (typeof overPanelId === "string") {
          setActiveDropTarget(overPanelId);
        } else {
          setActiveDropTarget(null);
        }
      }}
      onDragEnd={(event) => {
        const { active, over } = event;
        if (!active || !over) return;
      
        const fromPanel = active.data?.current?.fromPanel;
        const tabId = active.id as string;
        const overId = over.id as string;
      
        // Handle directional drop (e.g. "tab-abc-left")
        const match = overId.match(/^(.+)-(left|right)$/);
        if (match) {
          const [_, targetTabId, side] = match;
          const toPanel = findPanelIdForTab(targetTabId); // you’ll define this
          if (toPanel && fromPanel) {
            moveTabToPosition(tabId, fromPanel, toPanel, targetTabId, side as "left" | "right");
          }
          setActiveDropTarget(null);
          return;
        }
      
        // fallback: drop on whole panel
        if (fromPanel && overId !== fromPanel) {
          handleMoveTab(tabId, fromPanel, overId);
        }
      
        setActiveDropTarget(null);
      }}
      onDragCancel={() => {
        setActiveDropTarget(null);
      }}
    >
      <PanelGroup direction="horizontal" ref={panelRef} style={{ height: "100vh" }}>
        {panels.map((panel, index) => (
          <React.Fragment key={panel.id}>
            <Panel order={index} id={panel.id} defaultSize={100 / (panels.length)}>
              <button onClick={() => handleSplitPanel(index)}>Split</button>
              <button onClick={() => handleClosePanel(index)}>✖</button>
              <TabPanel panelId={panel.id} tabs={panel.tabs} isDropTarget={panel.id === activeDropTarget} />
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