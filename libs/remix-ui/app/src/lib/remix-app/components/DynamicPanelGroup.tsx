// DynamicPanelGroup.tsx
import React, { useState } from "react";
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
} from "react-resizable-panels";
import { TabPanel } from "./TabPanel";
import { v4 as uuidv4 } from "uuid";

export const DynamicPanelGroup: React.FC = () => {
  const [panels, setPanels] = useState([
    {
      id: uuidv4(),
      tabs: [{ id: "1", label: "First", content: <p>Hello Panel 1</p> }],
    },
    {
      id: uuidv4(),
      tabs: [{ id: "2", label: "Second", content: <p>Hello Panel 2</p> }],
    },
  ]);

  const addPanel = () => {
    const newPanel = {
      id: uuidv4(),
      tabs: [
        {
          id: uuidv4(),
          label: "New Tab",
          content: <p>New Panel Content</p>,
        },
      ],
    };
    setPanels([...panels, newPanel]);
  };

  return (
    <PanelGroup key={panels.length} direction="horizontal" style={{ height: "100vh" }}>
      {panels.map((panel, index) => (
        <React.Fragment key={panel.id}>
          <Panel defaultSize={100 / (panels.length + 1)}>
            <TabPanel tabs={panel.tabs} />
          </Panel>
          {index < panels.length - 1 &&                 <PanelResizeHandle style={{
                  backgroundColor: 'var(--primary)',
                  width: '2px',
                }} />}
        </React.Fragment>
      ))}

      {/* Add Panel Button as final panel */}
      <Panel defaultSize={10} minSize={5}>
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fafafa",
            borderLeft: "1px solid #ccc",
          }}
        >
          <button onClick={addPanel}>➕ Add Panel</button>
        </div>
      </Panel>
    </PanelGroup>
  );
};