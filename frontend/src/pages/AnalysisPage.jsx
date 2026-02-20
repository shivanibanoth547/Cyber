import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ForensicChat from '../components/ForensicChat';
import { ShimmerTable, ShimmerAnalysisResult } from '../components/ShimmerLoader';
import { Search, MessageSquare, Upload, FileText } from 'lucide-react';
import api from '../services/api';

export default function AnalysisPage() {
    const [mode, setMode] = useState('chat');
    const [logText, setLogText] = useState('');
    const [file, setFile] = useState(null);
    const [analyses, setAnalyses] = useState([]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [dragOver, setDragOver] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await api.get('/analysis/history');
            setAnalyses(data.analyses || []);
        } catch (err) {
            console.error(err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!logText.trim() && !file) return;

        setLoading(true);
        setResult(null);
        try {
            let response;
            if (file) {
                const formData = new FormData();
                formData.append('logFile', file);
                response = await api.post('/analysis/upload-log', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                const formData = new FormData();
                formData.append('logText', logText);
                response = await api.post('/analysis/upload-log', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            setResult(response.data.analysis);
            setLogText('');
            setFile(null);
            fetchHistory();
        } catch (err) {
            setResult({ error: err.response?.data?.error || 'Analysis failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = async (analysisId) => {
        try {
            await api.post(`/reports/generate/${analysisId}`);
            alert('Incident report generated! Check the Reports page.');
        } catch (err) {
            alert(err.response?.data?.error || 'Report generation failed');
        }
    };

    const getSeverityClass = (s) => `severity-badge severity-${s?.toLowerCase()}`;

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="navbar">
                    <h1><Search size={24} className="page-header-icon" /> Log Analysis</h1>
                </div>

                {/* Mode Toggle */}
                <div className="mode-tabs">
                    <button className={`mode-tab ${mode === 'chat' ? 'active' : ''}`} onClick={() => setMode('chat')}>
                        <MessageSquare size={16} /> Chat
                    </button>
                    <button className={`mode-tab ${mode === 'classic' ? 'active' : ''}`} onClick={() => setMode('classic')}>
                        <Upload size={16} /> Classic
                    </button>
                </div>

                {/* Chat Mode */}
                {mode === 'chat' && (
                    <ForensicChat onAnalysisComplete={() => fetchHistory()} />
                )}

                {/* Classic Mode */}
                {mode === 'classic' && (
                    <>
                        <div className="card" style={{ marginBottom: 24 }}>
                            <div className="card-header"><h3>Submit Log for AI Analysis</h3></div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Paste Log Content</label>
                                    <textarea
                                        className="form-input"
                                        placeholder={'Paste your security logs here...\n\nExample:\nFeb 14 08:23:15 server sshd[2456]: Failed password for root from 192.168.1.105 port 22 ssh2'}
                                        value={logText}
                                        onChange={(e) => setLogText(e.target.value)}
                                        rows={6}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Or Upload a Log File</label>
                                    <div
                                        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                                        onDrop={(e) => { e.preventDefault(); setDragOver(false); setFile(e.dataTransfer.files[0]); }}
                                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                        onDragLeave={() => setDragOver(false)}
                                        onClick={() => document.getElementById('logFileInput').click()}
                                    >
                                        <Upload size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                                        <p>Drag & drop log file or click to browse</p>
                                        <p style={{ fontSize: 12, marginTop: 4, color: 'var(--text-muted)' }}>TXT, CSV, JSON — Max 10MB</p>
                                        {file && <div className="file-name">✅ {file.name}</div>}
                                        <input id="logFileInput" type="file" accept=".txt,.csv,.json,.log" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={loading || (!logText.trim() && !file)}>
                                    {loading ? (
                                        <><span className="spinner" style={{ width: 16, height: 16, margin: 0, borderWidth: 2 }} /> Analyzing...</>
                                    ) : (
                                        <><Search size={16} /> Run AI Analysis</>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Loading shimmer for analysis */}
                        {loading && <ShimmerAnalysisResult />}

                        {/* Result */}
                        {result && !result.error && (
                            <div className="card" style={{ marginBottom: 24, borderColor: 'var(--accent-cyan)' }}>
                                <div className="card-header">
                                    <h3>🎯 Analysis Result</h3>
                                    <span className={getSeverityClass(result.severity)}>{result.severity}</span>
                                </div>
                                <div style={{ display: 'grid', gap: 16 }}>
                                    <div>
                                        <label style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Threat Summary</label>
                                        <p style={{ marginTop: 4 }}>{result.threatSummary}</p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>MITRE ATT&CK Technique</label>
                                        <p style={{ marginTop: 4, color: 'var(--accent-amber)' }}>{result.mitreTechnique}</p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recommended Actions</label>
                                        <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                                            {result.recommendedActions?.map((a, i) => <li key={i} style={{ marginBottom: 4 }}>{a}</li>)}
                                        </ul>
                                    </div>
                                    <button className="btn btn-success" onClick={() => handleGenerateReport(result._id)}>
                                        <FileText size={16} /> Generate Incident Report
                                    </button>
                                </div>
                            </div>
                        )}
                        {result?.error && <div className="alert alert-error">{result.error}</div>}

                        {/* History */}
                        <div className="card">
                            <div className="card-header"><h3>Analysis History</h3></div>
                            {historyLoading ? <ShimmerTable rows={5} cols={6} /> : analyses.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon"><Search size={48} style={{ color: 'var(--text-muted)' }} /></div>
                                    <h3>No analyses yet</h3>
                                    <p>Upload your first security log above</p>
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Source</th>
                                            <th>Severity</th>
                                            <th>MITRE</th>
                                            <th>Summary</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analyses.map((a) => (
                                            <tr key={a._id}>
                                                <td style={{ fontSize: 12 }}>{new Date(a.createdAt).toLocaleString()}</td>
                                                <td>{a.originalFilename || 'Direct'}</td>
                                                <td><span className={getSeverityClass(a.severity)}>{a.severity}</span></td>
                                                <td style={{ fontSize: 12 }}>{a.mitreTechnique}</td>
                                                <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.threatSummary}</td>
                                                <td>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => handleGenerateReport(a._id)}>
                                                        <FileText size={12} /> Report
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
