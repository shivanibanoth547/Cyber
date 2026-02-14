import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/AdminDashboard';
import AnalysisPage from './pages/AnalysisPage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Protected Routes — All approved users */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute><DashboardPage /></ProtectedRoute>
                    } />
                    <Route path="/analysis" element={
                        <ProtectedRoute><AnalysisPage /></ProtectedRoute>
                    } />
                    <Route path="/reports" element={
                        <ProtectedRoute><ReportsPage /></ProtectedRoute>
                    } />

                    {/* Admin-only Routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
                    } />

                    {/* Default redirect */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
