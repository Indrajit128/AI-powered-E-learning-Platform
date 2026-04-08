import Editor from '@monaco-editor/react';
import { useState, useEffect } from 'react';

const CodeEditor = ({ language, value, onChange, theme = 'vs-dark' }) => {
    return (
        <div style={{ height: '100%', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <Editor
                height="100%"
                language={language}
                value={value}
                theme={theme}
                onChange={onChange}
                options={{
                    fontSize: 16,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    lineNumbers: 'on',
                    roundedSelection: true,
                    cursorStyle: 'line',
                    autoClosingBrackets: 'always',
                    formatOnType: true,
                    tabSize: 4
                }}
            />
        </div>
    );
};

export default CodeEditor;
