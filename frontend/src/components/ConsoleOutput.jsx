import { CheckCircle2, XCircle, Terminal, Play, Save, ChevronRight, Keyboard, Database, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConsoleOutput = ({ results, loading, onRun, onSubmit, activeTab, setActiveTab }) => {
    const [customInput, setCustomInput] = useState('');

    return (
        <div style={{ 
            height: '100%', 
            width: '100%',
            background: '#090e1a', 
            borderRadius: '16px', 
            border: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
            {/* Console Tabs */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '0 1rem', 
                background: '#111827', 
                borderBottom: '1px solid #1e293b',
                gap: '8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '1rem', color: '#64748b' }}>
                    <Terminal size={14} />
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Terminal</span>
                </div>
                
                {['testcases', 'console'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{ 
                            padding: '12px 16px', 
                            background: 'transparent', 
                            border: 'none', 
                            color: activeTab === tab ? '#60a5fa' : '#475569',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        {tab === 'testcases' ? <Database size={14} /> : <Keyboard size={14} />}
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {activeTab === tab && (
                            <motion.div 
                                layoutId="activeConsoleTab"
                                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: '#60a5fa' }} 
                            />
                        )}
                    </button>
                ))}

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onRun(customInput)}
                        disabled={loading}
                        style={{ 
                            padding: '6px 12px', 
                            borderRadius: '8px', 
                            background: '#1e293b', 
                            color: '#e2e8f0', 
                            border: '1px solid #334155', 
                            fontSize: '0.75rem', 
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        {loading ? <div className="spinner-small" /> : <Play size={14} fill="#e2e8f0" />}
                        Run
                    </motion.button>

                    <motion.button 
                        whileHover={{ scale: 1.05, background: '#2563eb' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onSubmit}
                        disabled={loading}
                        style={{ 
                            padding: '6px 16px', 
                            borderRadius: '8px', 
                            background: '#3b82f6', 
                            color: 'white', 
                            border: 'none', 
                            fontSize: '0.75rem', 
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        {loading ? <div className="spinner-small" /> : <Save size={14} />}
                        Submit
                    </motion.button>
                </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', fontFamily: '"Fira Code", monospace' }}>
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: '#64748b' }}
                        >
                            <div className="spinner" style={{ width: '30px', height: '30px' }} />
                            <div style={{ fontSize: '0.85rem' }}>Executing code on Mentordeskk servers...</div>
                        </motion.div>
                    ) : activeTab === 'testcases' ? (
                        <motion.div 
                            key="testcases"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                        >
                            {results && results.length > 0 ? (
                                results.map((res, idx) => (
                                    <div key={idx} style={{ 
                                        padding: '1rem', 
                                        background: '#1a1f2e', 
                                        borderRadius: '12px', 
                                        border: `1px solid ${res.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{ 
                                            position: 'absolute', 
                                            left: 0, 
                                            top: 0, 
                                            bottom: 0, 
                                            width: '4px', 
                                            background: res.passed ? '#10b981' : '#ef4444' 
                                        }} />
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {res.passed ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}
                                                <span style={{ fontWeight: '800', color: res.passed ? '#10b981' : '#ef4444', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                                    Test Case {idx + 1}: {res.passed ? 'PASSED' : 'FAILED'}
                                                </span>
                                            </div>
                                            {res.time !== undefined && <span style={{ color: '#475569', fontSize: '0.7rem' }}>Time: {res.time}s</span>}
                                        </div>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px', fontSize: '0.8rem' }}>
                                            <div style={{ color: '#475569' }}>Input:</div>
                                            <div style={{ color: '#e2e8f0', background: '#0f172a', padding: '4px 8px', borderRadius: '4px' }}>{res.input || '(empty)'}</div>
                                            
                                            <div style={{ color: '#475569' }}>Expected:</div>
                                            <div style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>{res.expected || '(empty)'}</div>
                                            
                                            <div style={{ color: '#475569' }}>Actual:</div>
                                            <div style={{ color: res.passed ? '#10b981' : '#ef4444', background: res.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                                                {res.actual || (res.status === 'Compile Error' ? 'Compilation failed' : '(empty)')}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', color: '#475569', padding: '2rem' }}>
                                    <Play size={40} style={{ margin: '0 auto 1rem', opacity: 0.1 }} />
                                    <div style={{ fontSize: '0.9rem' }}>Run your code to see test results</div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="console"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#1a1f2e', borderRadius: '8px', border: '1px solid #1e293b' }}>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '8px', fontWeight: '800', textTransform: 'uppercase' }}>Stdin / Custom Input</div>
                                <textarea 
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                    placeholder="Enter custom input here..."
                                    style={{ 
                                        width: '100%', 
                                        minHeight: '60px', 
                                        background: 'transparent', 
                                        border: 'none', 
                                        color: '#e2e8f0', 
                                        fontSize: '0.85rem', 
                                        outline: 'none',
                                        resize: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                                    <button 
                                        onClick={() => onRun(customInput)}
                                        style={{ background: '#334155', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                                    >
                                        Run with Custom Input
                                    </button>
                                </div>
                            </div>

                            <div style={{ flex: 1, background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #1e293b', overflowY: 'auto' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '1rem', fontSize: '0.75rem', fontWeight: '800' }}>
                                    <ChevronRight size={14} /> stdout / stderr
                                </div>
                                {results && results.length > 0 ? (
                                    <div style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>
                                        {results.map((res, i) => (
                                            <div key={i} style={{ marginBottom: '1rem' }}>
                                                {res.input && <div style={{ color: '#475569', fontSize: '0.7rem' }}>Input: {res.input}</div>}
                                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{res.actual || '(no output)'}</pre>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ color: '#334155', fontStyle: 'italic', fontSize: '0.85rem' }}>No console output yet.</div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Footer Status */}
            <div style={{ padding: '0.5rem 1rem', background: '#111827', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.65rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }} />
                        Connected
                    </div>
                    <div>UTF-8</div>
                </div>
                <div style={{ fontSize: '0.65rem', color: '#475569', fontWeight: '700' }}>
                    MENTORDESKK V1.0.4
                </div>
            </div>
        </div>
    );
};

export default ConsoleOutput;
