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
};

export const TabPanel: React.FC<TabPanelProps> = ({
  tabs,
  defaultActiveTabId,
  panelId,
  //onTabDrop,
}) => {
  const { setNodeRef } = useDroppable({ id: panelId });

  const [activeTabId, setActiveTabId] = useState(() =>
    defaultActiveTabId || tabs[0]?.id || ""
  );

  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];

  useEffect(() => {
    console.log({ activeTabId, tabs });
  },[activeTabId])

  return (
    <div
      ref={setNodeRef}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >

      <div className="nav-tabs" style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
        {tabs.map((tab) => (
          <DraggableTab
            key={tab.id}
            tabId={tab.id}
            panelId={panelId}
            label={tab.label}
            isActive={tab.id === activeTabId}
            onClick={() => setActiveTabId(tab.id)}
          />
        ))}
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: 10 }}>
        {activeTab?.content}
      </div>
    </div>

  );
};