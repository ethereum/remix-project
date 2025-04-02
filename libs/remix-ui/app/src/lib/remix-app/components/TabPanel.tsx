// TabPanel.tsx
import React, { useEffect, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { DraggableTab } from "./DraggableTab";
import { use } from "chai";

type Tab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

type TabPanelProps = {
  tabs: Tab[];
  defaultActiveTabId?: string;
  panelId: string;
  //onTabDrop?: (tabId: string, fromPanel: string, toPanel: string) => void;
  isDropTarget?: boolean;
  draggingTabId?: string;
};

export const TabPanel: React.FC<TabPanelProps> = ({
  tabs,
  defaultActiveTabId,
  panelId,
  //onTabDrop,
  isDropTarget,
  draggingTabId,
}) => {
  const { setNodeRef } = useDroppable({ id: panelId });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const [activeTabId, setActiveTabId] = useState(() =>
    defaultActiveTabId || tabs[0]?.id || ""
  );

  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];

  useEffect(() => {
    console.log({ activeTabId, tabs });
  }, [activeTabId])

  return (
    <div
      ref={setNodeRef}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: isDropTarget ? "#3a3d4f" : "#2a2c3f",
        outline: isDropTarget ? "2px solid #66f" : "none",
        transition: "outline 0.2s ease",
      }}
    >

      <div className="nav-tabs" style={{ display: "flex", borderBottom: "1px solid #ccc", position: "relative" }}>
        {tabs.map((tab, i) => (
          <React.Fragment key={tab.id}>
            {hoverIndex === i && (
              <div
                style={{
                  width: 2,
                  backgroundColor: "#66f",
                  height: "100%",
                  position: "absolute",
                  left: `${i * 100}px`, // crude estimate — can refine
                  top: 0,
                  zIndex: 10,
                }}
              />
            )}
            <DraggableTab
              tabId={tab.id}
              panelId={panelId}
              label={tab.label}
              isActive={tab.id === activeTabId}
              onClick={() => setActiveTabId(tab.id)}
            />
          </React.Fragment>
        ))}
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: 10 }}>
      {activeTab?.content}
      </div>
    </div>

  );
};