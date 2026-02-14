import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function AdminDashboard() {
    const [tab, setTab] = useState('pending');
    const [users, setUsers] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    const fetchPending = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/pending-users');
            setUsers(data.users || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAll = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data.users || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAudit = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/audit-logs?limit=100');
            setAuditLogs(data.logs || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tab === 'pending') fetchPending();
        else if (tab === 'all') fetchAll();
        else if (tab === 'audit') fetchAudit();
    }, [tab]);

    const handleAction = async (action, userId) => {
        setMsg('');
        try {
            if (action === 'approve') {
                await api.post(`/admin/approve/${userId}`);
                setMsg('User approved');
            } else if (action === 'reject') {
                await api.post(`/admin/reject/${userId}`);
                setMsg('User rejected');
            } else if (action === 'disable') {
                await api.post(`/admin/disable/${userId}`);
                setMsg('User disabled');
            }
            if (tab === 'pending') fetchPending();
            else fetchAll();
        } catch (err) {
            setMsg(err.response?.data?.error || 'Action failed');
        }
    };

    const handleRoleChange = async (userId, role) => {
        try {
            await api.post(`/admin/assign-role/${userId}`, { role });
            setMsg(`Role updated to ${role}`);
            fetchAll();
        } catch (err) {
            setMsg(err.response?.data?.error || 'Role update failed');
        }
    };

    const statusClass = (s) => `status-badge status-${s}`;

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="navbar"><h1>Admin Panel</h1></div>

                {msg && <div className="alert alert-success">{msg}</div>}

                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                    <button className={`btn ${tab === 'pending' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('pending')}>
                        ⏳ Pending Users
                    </button>
                    <button className={`btn ${tab === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('all')}>
                        👥 All Users
                    </button>
                    <button className={`btn ${tab === 'audit' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('audit')}>
                        📋 Audit Logs
                    </button>
                </div>

                {loading ? <div className="spinner" /> : (
                    <div className="card">
                        {(tab === 'pending' || tab === 'all') && (
                            users.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">{tab === 'pending' ? '✅' : '👥'}</div>
                                    <h3>{tab === 'pending' ? 'No pending users' : 'No users found'}</h3>
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Registered</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u._id}>
                                                <td>{u.fullName}</td>
                                                <td>{u.email}</td>
                                                <td>
                                                    {tab === 'all' ? (
                                                        <select
                                                            value={u.role}
                                                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                            style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: 6, fontSize: 12 }}
                                                        >
                                                            <option value="soc_analyst">SOC Analyst</option>
                                                            <option value="soc_manager">SOC Manager</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    ) : u.role?.replace('_', ' ')}
                                                </td>
                                                <td><span className={statusClass(u.status)}>{u.status}</span></td>
                                                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        {u.status === 'pending' && (
                                                            <>
                                                                <button className="btn btn-success btn-sm" onClick={() => handleAction('approve', u._id)}>✅ Approve</button>
                                                                <button className="btn btn-danger btn-sm" onClick={() => handleAction('reject', u._id)}>❌ Reject</button>
                                                            </>
                                                        )}
                                                        {u.status === 'approved' && (
                                                            <button className="btn btn-danger btn-sm" onClick={() => handleAction('disable', u._id)}>🚫 Disable</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        )}
                        {tab === 'audit' && (
                            auditLogs.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📋</div>
                                    <h3>No audit logs yet</h3>
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Timestamp</th>
                                            <th>User</th>
                                            <th>Action</th>
                                            <th>Resource</th>
                                            <th>Detail</th>
                                            <th>IP</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {auditLogs.map((log) => (
                                            <tr key={log._id}>
                                                <td style={{ fontSize: 12 }}>{new Date(log.createdAt).toLocaleString()}</td>
                                                <td>{log.userId?.fullName || log.userId?.email || '—'}</td>
                                                <td><strong>{log.action}</strong></td>
                                                <td>{log.resource}</td>
                                                <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.detail}</td>
                                                <td style={{ fontSize: 12 }}>{log.ipAddress}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
