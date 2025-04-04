
// EditorContext.tsx
import React, { createContext, useContext, useReducer, useRef } from "react";
import { reducerActions, initialState, reducerListener } from "../actions/editor";

export const EditorContext = createContext(null);

export const EditorProvider = ({ plugin, monaco, events, children }) => {
  const [editorModelsState, dispatch] = useReducer(reducerActions, initialState);
  const editorsRef = useRef<any[]>([]);

  const registerEditor = (editor: any) => {
    editorsRef.current.push(editor);
    reducerListener(plugin, dispatch, monaco, editorsRef.current, events);
  };

  const unregisterEditor = (editor: any) => {
    editorsRef.current = editorsRef.current.filter((e) => e !== editor);
  };

  return (
    <EditorContext.Provider
      value={{
        editorModelsState,
        dispatch,
        plugin,
        monaco,
        events,
        registerEditor,
        unregisterEditor,
        editors: editorsRef.current,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => useContext(EditorContext);