import React, { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useEditorContext } from "../context/editorContext";

export type EditorWrapperProps = {
    filePath: string;
    content: string;
    language: string;
    diffContent?: string;
    mode?: 'editor' | 'diff';
};


export const EditorWrapper: React.FC<EditorWrapperProps> = ({
    filePath,
    content,
    language,
    diffContent,
    mode = 'editor',
}) => {
    const editorRef = useRef<any>(null);
    const {
        registerEditor,
        unregisterEditor,
        monaco,
        plugin,
        events,
    } = useEditorContext();

    const handleEditorDidMount = (editorInstance) => {
        editorRef.current = editorInstance;
        registerEditor(editorInstance);

        // emit to plugin on mount
        plugin.emit("addModel", content, language, filePath);
    };

    useEffect(() => {
        return () => {
            if (editorRef.current) unregisterEditor(editorRef.current);
        };
    }, []);

    return (
        <Editor
            path={filePath}
            defaultLanguage={language}
            defaultValue={content}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            width="100%"
            height="100%"
        />
    );
};