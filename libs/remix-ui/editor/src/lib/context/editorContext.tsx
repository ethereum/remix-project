
// EditorContext.tsx
import React, { createContext, useContext, useReducer, useRef } from "react";
import { reducerActions, initialState, reducerListener, EditorAction, EditorModelsState } from "../actions/editor";
import monaco from "../../types/monaco";

export interface EditorContextType {
    plugin: any;
    monaco: any;
    events: any;
    dispatch: React.Dispatch<EditorAction>;
    editorModelsState: EditorModelsState;
    editors: any[];
    registerEditor: (editor: any) => void;
    unregisterEditor: (editor: any) => void;
  }


export const EditorContext = createContext<EditorContextType | null>(null)

export const EditorProvider = ({ plugin, monaco, events, children }) => {
    const [editorModelsState, dispatch] = useReducer<React.Reducer<EditorModelsState, EditorAction>>(
        reducerActions,
        initialState
    );
    const editorsRef = useRef<Record<string, monaco.editor.IStandaloneCodeEditor>>({});

    const registerEditor = (filePath: string, instance: monaco.editor.IStandaloneCodeEditor) => {
        editorsRef.current[filePath] = instance;
        reducerListener(plugin, dispatch, monaco, editorsRef.current, events);
    };

    const unregisterEditor = (filePath: string) => {
        delete editorsRef.current[filePath];
    };
      

    const contextValue: EditorContextType = {
        plugin,
        monaco,
        events,
        dispatch,
        editorModelsState,
        editors: editorsRef.current,
        registerEditor,
        unregisterEditor
    };

    return (
        <EditorContext.Provider value={contextValue}>
            {children}
        </EditorContext.Provider>
    );
};

export const useEditorContext = () => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error("useEditorContext must be used inside an EditorProvider");
    }
    return context;
};