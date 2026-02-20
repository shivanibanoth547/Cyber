import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandedLoader } from './ShimmerLoader';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <BrandedLoader />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
