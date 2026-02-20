import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowUp, Paperclip, FileText, Terminal, AlertTriangle, Bot, User } from 'lucide-react';
import api from '../services/api';

/**
 * ForensicChat — v0-style AI chat component for SOC log analysis.
 * Plain React JSX + vanilla CSS (no Tailwind, no shadcn).
 */
export default function ForensicChat({ onAnalysisComplete }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [file, setFile] = useState(null);
    const textareaRef = useRef(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Auto-resize textarea
    const adjustHeight = useCallback((reset) => {
        const ta = textareaRef.current;
        if (!ta) return;
        if (reset) { ta.style.height = '52px'; return; }
        ta.style.height = '52px';
        const newH = Math.max(52, Math.min(ta.scrollHeight, 200));
        ta.style.height = `${newH}px`;
    }, []);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isAnalyzing]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text && !file) return;

        // Add user message
        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: file ? `📎 ${file.name}\n${text || '(File submitted for analysis)'}` : text,
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        adjustHeight(true);
        setIsAnalyzing(true);

        try {
            const formData = new FormData();
            if (file) {
                formData.append('logFile', file);
            } else {
                formData.append('logText', text);
            }

            const { data } = await api.post('/analysis/upload-log', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const analysis = data.analysis;
            const aiMsg = {
                id: Date.now() + 1,
                role: 'ai',
                content: formatAIResponse(analysis),
                analysis,
            };
            setMessages(prev => [...prev, aiMsg]);
            setFile(null);
            if (onAnalysisComplete) onAnalysisComplete(analysis);
        } catch (err) {
            const errMsg = {
                id: Date.now() + 1,
                role: 'ai',
                content: `⚠️ Analysis failed: ${err.response?.data?.error || err.message}`,
                isError: true,
            };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickAction = (text) => {
        setInput(text);
        textareaRef.current?.focus();
    };

    const formatAIResponse = (analysis) => {
        return `**Threat Analysis Complete**\n\n` +
            `**Severity:** ${analysis.severity}\n` +
            `**MITRE Technique:** ${analysis.mitreTechnique}\n\n` +
            `**Summary:** ${analysis.threatSummary}\n\n` +
            `**Recommended Actions:**\n${(analysis.recommendedActions || []).map(a => `• ${a}`).join('\n')}`;
    };

    const hasInput = input.trim().length > 0 || file;

    return (
        <div className="chat-container">
            {/* Messages area */}
            <div className="chat-messages">
                {messages.length === 0 && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                        <div style={{ fontSize: 48, marginBottom: 8 }}>
                            <Bot size={48} style={{ color: 'var(--accent-cyan)' }} />
                        </div>
                        <h2 style={{ fontSize: 22, fontWeight: 700, background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            What logs should I analyze?
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 440, textAlign: 'center' }}>
                            Paste security logs, upload a file, or describe a threat scenario for AI-powered forensic analysis.
                        </p>

                        {/* Quick action pills */}
                        <div className="chat-quick-actions">
                            <button className="chat-quick-action" onClick={() => handleQuickAction('Feb 14 08:23:15 server sshd[2456]: Failed password for root from 192.168.1.105 port 22 ssh2\nFeb 14 08:23:18 server sshd[2456]: Failed password for root from 192.168.1.105 port 22 ssh2\nFeb 14 08:23:20 server sshd[2456]: Failed password for root from 192.168.1.105 port 22 ssh2')}>
                                <Terminal size={16} className="quick-icon" />
                                SSH Brute Force Logs
                            </button>
                            <button className="chat-quick-action" onClick={() => handleQuickAction('192.168.1.50 - - [14/Feb/2026:10:15:32] "GET /admin/config.php HTTP/1.1" 200 4523\n192.168.1.50 - - [14/Feb/2026:10:15:33] "GET /etc/passwd HTTP/1.1" 403 287\n192.168.1.50 - - [14/Feb/2026:10:15:34] "POST /shell.php HTTP/1.1" 200 89')}>
                                <AlertTriangle size={16} className="quick-icon" />
                                Web Attack Logs
                            </button>
                            <button className="chat-quick-action" onClick={() => fileInputRef.current?.click()}>
                                <FileText size={16} className="quick-icon" />
                                Upload Log File
                            </button>
                        </div>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={`chat-message ${msg.role}`}>
                        <div className={`chat-avatar ${msg.role === 'user' ? 'user-avatar' : 'ai-avatar'}`}>
                            {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                        </div>
                        <div className="chat-bubble">
                            {msg.role === 'ai' && msg.analysis ? (
                                <>
                                    <div style={{ marginBottom: 12 }}>Threat analysis complete.</div>
                                    <div className="ai-result-card">
                                        <div className="result-row">
                                            <span className="result-label">Severity</span>
                                            <span className={`severity-badge severity-${msg.analysis.severity?.toLowerCase()}`}>
                                                {msg.analysis.severity}
                                            </span>
                                        </div>
                                        <div className="result-row">
                                            <span className="result-label">MITRE ATT&CK</span>
                                            <span style={{ color: 'var(--accent-amber)' }}>{msg.analysis.mitreTechnique}</span>
                                        </div>
                                        <div className="result-row">
                                            <span className="result-label">Threat Summary</span>
                                            <span>{msg.analysis.threatSummary}</span>
                                        </div>
                                        <div className="result-row">
                                            <span className="result-label">Recommended Actions</span>
                                            <ul style={{ paddingLeft: 16, margin: '4px 0 0' }}>
                                                {msg.analysis.recommendedActions?.map((a, i) => (
                                                    <li key={i} style={{ fontSize: 13, marginBottom: 4 }}>{a}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {isAnalyzing && (
                    <div className="chat-message ai">
                        <div className="chat-avatar ai-avatar">
                            <Bot size={18} />
                        </div>
                        <div className="chat-bubble">
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Analyzing threats...</div>
                            <div className="typing-indicator">
                                <span /><span /><span />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div className="chat-input-bar">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => { setInput(e.target.value); adjustHeight(); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Paste security logs or describe a threat scenario..."
                    disabled={isAnalyzing}
                />
                {file && (
                    <div style={{ padding: '0 16px 4px', fontSize: 12, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileText size={14} /> {file.name}
                        <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: 14, marginLeft: 4 }}>✕</button>
                    </div>
                )}
                <div className="chat-input-actions">
                    <div className="chat-input-left">
                        <button type="button" className="chat-action-btn" onClick={() => fileInputRef.current?.click()}>
                            <Paperclip size={16} /> Attach
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt,.csv,.json,.log"
                            style={{ display: 'none' }}
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                    </div>
                    <div className="chat-input-right">
                        <button
                            type="button"
                            className={`chat-send-btn ${hasInput ? 'active' : ''}`}
                            onClick={handleSend}
                            disabled={isAnalyzing || !hasInput}
                        >
                            <ArrowUp size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
