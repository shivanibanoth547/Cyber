import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LayoutDashboard, Search, FileText, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
    const { user, logout, isAdmin } = useAuth();

    const initials = user?.fullName
        ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '??';

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <Shield size={28} style={{ color: 'var(--accent-cyan)' }} />
                <h2>SOC AI Assistant</h2>
            </div>

            <ul className="sidebar-nav">
                <li>
                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                        <LayoutDashboard size={20} className="nav-icon" />
                        Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/analysis" className={({ isActive }) => isActive ? 'active' : ''}>
                        <Search size={20} className="nav-icon" />
                        Log Analysis
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/reports" className={({ isActive }) => isActive ? 'active' : ''}>
                        <FileText size={20} className="nav-icon" />
                        Incident Reports
                    </NavLink>
                </li>
                {isAdmin && (
                    <li>
                        <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
                            <Settings size={20} className="nav-icon" />
                            Admin Panel
                        </NavLink>
                    </li>
                )}
            </ul>

            <div className="sidebar-user">
                <div className="user-avatar">{initials}</div>
                <div className="user-name">{user?.fullName}</div>
                <div className="user-role">{user?.role?.replace('_', ' ')}</div>
                <button className="btn btn-secondary btn-sm" onClick={logout} style={{ marginTop: 12, width: '100%' }}>
                    <LogOut size={14} /> Logout
                </button>
            </div>
        </aside>
    );
}
