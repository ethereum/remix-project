import React, { useState } from "react";

export const PanelContent: React.FC<{ id: string }> = ({ id }) => {
    const [count, setCount] = useState(0);
  
    return (
      <div
        style={{
          height: "100%",
          padding: "1rem",
          background: "#f7f7f7",
          borderRight: "1px solid #ccc",
        }}
      >
        <h3>Panel {id}</h3>
        <p>Count: {count}</p>
        <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      </div>
    );
  };