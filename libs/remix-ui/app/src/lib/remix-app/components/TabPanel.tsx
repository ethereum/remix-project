// TabPanel.tsx
import React, { useState } from "react";

type Tab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

type TabPanelProps = {
  tabs: Tab[];
  defaultActiveTabId?: string;
};

export const TabPanel: React.FC<TabPanelProps> = ({
  tabs,
  defaultActiveTabId,
}) => {
  const [activeTabId, setActiveTabId] = useState(
    defaultActiveTabId || tabs[0]?.id
  );

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            style={{
              padding: "8px 12px",
              background: tab.id === activeTabId ? "#eee" : "transparent",
              border: "none",
              borderBottom: tab.id === activeTabId ? "2px solid #333" : "none",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: 10 }}>
        {activeTab?.content}
      </div>
    </div>
  );
};