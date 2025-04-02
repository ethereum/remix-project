import React, { useEffect } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";

type DraggableTabProps = {
    tabId: string;
    panelId: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
};

export const DraggableTab: React.FC<DraggableTabProps> = ({
  tabId,
  panelId,
  label,
  isActive,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef: setDragRef } = useDraggable({
    id: tabId,
    data: {
      fromPanel: panelId,
      tabId: tabId,
    },
  });

  const leftId = `${tabId}-left`;
  const rightId = `${tabId}-right`;

  const { isOver: isOverLeft, setNodeRef: setLeftDropRef } = useDroppable({ id: leftId });
  const { isOver: isOverRight, setNodeRef: setRightDropRef } = useDroppable({ id: rightId });

  return (
    <div
      ref={setDragRef}
      {...attributes}
      {...listeners}
      onMouseUp={onClick}
      className={`nav-item nav-link ${isActive ? "active" : ""}`}
      style={{
        position: "relative",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 10px",
      }}
    >
      {/* Drop targets */}
      <div
        ref={setLeftDropRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: isOverLeft ? "#66f" : "transparent",
          transition: "background-color 0.2s ease",
        }}
      />
      <div
        ref={setRightDropRef}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: isOverRight ? "#66f" : "transparent",
          transition: "background-color 0.2s ease",
        }}
      />

      {label}
    </div>
  );
};