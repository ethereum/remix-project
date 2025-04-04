import React, { useRef, useState } from "react";
import Editor, { DiffEditor, loader, Monaco } from '@monaco-editor/react'

export const PanelContent: React.FC<{ id: string }> = ({ id }) => {
    const [count, setCount] = useState(0);
    const monacoRef = useRef<HTMLDivElement>(null);

    function handleEditorWillMount(monaco) {
        monacoRef.current = monaco
    }
    return (
        <div
            style={{
                height: "100%",
            }}
        >
            <Editor
                onMount={handleEditorWillMount}
                width="100%"
                theme="vs-dark"
            />
        </div>
    );
};