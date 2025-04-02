import React, { useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";

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
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: tabId,
        data: {
            fromPanel: panelId,
            tabId: tabId,
        }
    });

    useEffect(() => {
        console.log({ isActive });
    }, [isActive])

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            onMouseUp={onClick}
            className={`nav-item nav-link ${isActive ? "active" : ""}`}
            style={{
                cursor: "pointer",
            }}
        >
            {label}
        </div>
    );
};