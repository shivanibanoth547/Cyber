import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ analyses: 0, reports: 0 });
    const [recentAnalyses, setRecentAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [analysisRes, reportRes] = await Promise.all([
                    api.get('/analysis/history'),
                    api.get('/reports'),
                ]);
                setStats({
                    analyses: analysisRes.data.analyses?.length || 0,
                    reports: reportRes.data.reports?.length || 0,
                });
                setRecentAnalyses((analysisRes.data.analyses || []).slice(0, 5));
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getSeverityClass = (s) => `severity-badge severity-${s?.toLowerCase()}`;

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="navbar">
                    <h1>Dashboard</h1>
                    <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                        Welcome back, {user?.fullName}
                    </span>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">🔍</div>
                        <div className="stat-value">{stats.analyses}</div>
                        <div className="stat-label">Total Analyses</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📝</div>
                        <div className="stat-value">{stats.reports}</div>
                        <div className="stat-label">Incident Reports</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🛡️</div>
                        <div className="stat-value">{user?.role?.replace('_', ' ').toUpperCase()}</div>
                        <div className="stat-label">Your Role</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-value" style={{ color: 'var(--accent-green)' }}>Active</div>
                        <div className="stat-label">Account Status</div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3>Recent Analyses</h3>
                    </div>
                    {loading ? (
                        <div className="spinner" />
                    ) : recentAnalyses.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📊</div>
                            <h3>No analyses yet</h3>
                            <p>Upload security logs to start AI-powered threat analysis</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>File</th>
                                    <th>Severity</th>
                                    <th>MITRE Technique</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentAnalyses.map((a) => (
                                    <tr key={a._id}>
                                        <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                                        <td>{a.originalFilename || 'Direct input'}</td>
                                        <td><span className={getSeverityClass(a.severity)}>{a.severity}</span></td>
                                        <td>{a.mitreTechnique}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
}
