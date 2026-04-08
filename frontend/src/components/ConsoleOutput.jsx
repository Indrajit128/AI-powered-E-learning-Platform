import { CheckCircle2, XCircle, Terminal, Play, Save } from 'lucide-react';

const ConsoleOutput = ({ results, loading, onRun, onSubmit, activeTab, setActiveTab }) => {
    return (
        <div style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            background: '#1e1e1e', 
            borderRadius: '12px', 
            overflow: 'hidden',
            border: '1px solid var(--border)' 
        }}>
            {/* Header / Tabs */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justify: 'space-between', 
                padding: '0.5rem 1rem', 
                background: '#252526', 
                borderBottom: '1px solid #333' 
            }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={() => setActiveTab('testcases')}
                        style={{ 
                            background: 'transparent', 
                            color: activeTab === 'testcases' ? 'var(--primary)' : '#999', 
                            border: 'none', 
                            padding: '4px 8px', 
                            fontSize: '0.9rem',
                            fontWeight: activeTab === 'testcases' ? '600' : '400',
                            cursor: 'pointer'
                        }}
                    >
                        Test Cases
                    </button>
                    <button 
                        onClick={() => setActiveTab('console')}
                        style={{ 
                            background: 'transparent', 
                            color: activeTab === 'console' ? 'var(--primary)' : '#999', 
                            border: 'none', 
                            padding: '4px 8px', 
                            fontSize: '0.9rem',
                            fontWeight: activeTab === 'console' ? '600' : '400',
                            cursor: 'pointer'
                        }}
                    >
                        Console Output
                    </button>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                        disabled={loading}
                        onClick={onRun}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Play size={14} /> Run
                    </button>
                    <button 
                        disabled={loading}
                        onClick={onSubmit}
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Save size={14} /> Submit
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#999' }}>
                        <div className="spinner-small" /> Executing code...
                    </div>
                ) : activeTab === 'testcases' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {results && results.length > 0 ? (
                            results.map((res, idx) => (
                                <div key={idx} style={{ 
                                    padding: '12px', 
                                    background: '#2d2d2d', 
                                    borderRadius: '8px', 
                                    borderLeft: `4px solid ${res.passed ? '#10b981' : '#ef4444'}` 
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 'bold', color: res.passed ? '#10b981' : '#ef4444' }}>
                                            Test Case {idx + 1}: {res.passed ? 'PASSED' : 'FAILED'}
                                        </span>
                                        <span style={{ color: '#666', fontSize: '0.8rem' }}>{res.time}s</span>
                                    </div>
                                    <div style={{ color: '#ccc', marginBottom: '4px' }}>Input: <span style={{ color: '#fff' }}>{res.input}</span></div>
                                    <div style={{ color: '#ccc', marginBottom: '4px' }}>Expected: <span style={{ color: '#fff' }}>{res.expected}</span></div>
                                    <div style={{ color: '#ccc' }}>Actual: <span style={{ color: res.passed ? '#fff' : '#ef4444' }}>{res.actual || '(no output)'}</span></div>
                                </div>
                            ))
                        ) : (
                            <div style={{ color: '#666', textAlign: 'center', marginTop: '2rem' }}>
                                <Terminal size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                <p>Run your code to see test case results here.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ whiteSpace: 'pre-wrap', color: '#ccc' }}>
                        {results && results.length > 0 ? (
                            results.map((res, idx) => res.actual).join('\n')
                        ) : (
                            <span style={{ color: '#666' }}>Console is empty. Run code to see output.</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsoleOutput;
