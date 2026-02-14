import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const { user, logout, isAdmin } = useAuth();

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <span className="shield-icon">🛡️</span>
                <h2>SOC AI Assistant</h2>
            </div>

            <ul className="sidebar-nav">
                <li>
                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                        📊 Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/analysis" className={({ isActive }) => isActive ? 'active' : ''}>
                        🔍 Log Analysis
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/reports" className={({ isActive }) => isActive ? 'active' : ''}>
                        📝 Incident Reports
                    </NavLink>
                </li>
                {isAdmin && (
                    <>
                        <li>
                            <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
                                ⚙️ Admin Panel
                            </NavLink>
                        </li>
                    </>
                )}
            </ul>

            <div className="sidebar-user">
                <div className="user-name">{user?.fullName}</div>
                <div className="user-role">{user?.role?.replace('_', ' ')}</div>
                <button className="btn btn-secondary btn-sm" onClick={logout} style={{ marginTop: 12, width: '100%' }}>
                    🚪 Logout
                </button>
            </div>
        </aside>
    );
}
