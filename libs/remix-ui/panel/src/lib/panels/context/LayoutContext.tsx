import { EditorWrapperProps } from "@remix-ui/editor";
import React, { createContext, useContext, useState } from "react";

export type PanelTab = {
  id: string;
  label: string;
  icon?: string;
  content: React.ReactElement<EditorWrapperProps>;
  type?: "editor" | "diff" | "view" | "terminal" | string;
};

export type PanelState = {
  id: string;
  tabs: PanelTab[];
  activeTabId?: string;
};

export interface LayoutState {
    panels: PanelState[];
    setPanels: React.Dispatch<React.SetStateAction<PanelState[]>>;
    focusedGroupId: string | null;
    setFocusedGroupId: (id: string) => void;
  
    openTab: (tab: PanelTab) => void;
    closeTab: (tabId: string) => void;
    focusTab: (tabId: string) => void;
    getCurrentTab: () => PanelTab | null;
  }

const LayoutContext = createContext<LayoutState | null>(null);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [panels, setPanels] = useState<PanelState[]>([]);
    const [focusedGroupId, setFocusedGroupId] = useState<string | null>(null);
  
    const openTab = (tab: PanelTab) => {
        setPanels((prev) => {
          const groupId = focusedGroupId ?? prev[0]?.id;
          if (!groupId) return prev;
      
          return prev.map((panel) => {
            if (panel.id === groupId) {
              const exists = panel.tabs.find((t) => t.id === tab.id);
              if (exists) {
                return {
                  ...panel,
                  activeTabId: tab.id, // even if it exists, focus it
                };
              }
      
              return {
                ...panel,
                tabs: [...panel.tabs, tab],
                activeTabId: tab.id, // new tab becomes active
              };
            }
            return panel;
          });
        });
      };
  
    const closeTab = (tabId: string) => {
      setPanels((prev) =>
        prev.map((panel) => ({
          ...panel,
          tabs: panel.tabs.filter((tab) => tab.id !== tabId),
        })).filter((panel) => panel.tabs.length > 0) // remove empty panels
      );
    };
  
    const focusTab = (tabId: string) => {
        setPanels((prev) => {
          return prev.map((panel) => {
            const found = panel.tabs.find((t) => t.id === tabId);
            if (found) {
              setFocusedGroupId(panel.id);
              return { ...panel, activeTabId: tabId };
            }
            return panel;
          });
        });
      };
  
      const getCurrentTab = (): PanelTab | null => {
        if (!focusedGroupId) return null;
        const panel = panels.find((p) => p.id === focusedGroupId);
        if (!panel) return null;
      
        const active = panel.tabs.find((t) => t.id === panel.activeTabId);
        return active || null;
      };
  
    return (
      <LayoutContext.Provider
        value={{
          panels,
          setPanels,
          focusedGroupId,
          setFocusedGroupId,
          openTab,
          closeTab,
          focusTab,
          getCurrentTab
        }}
      >
        {children}
      </LayoutContext.Provider>
    );
  };

export const useLayoutContext = () => {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayoutContext must be used inside LayoutProvider");
  return ctx;
};