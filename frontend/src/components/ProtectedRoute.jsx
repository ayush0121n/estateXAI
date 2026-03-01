import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loader">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 16 }}>
                <h2 style={{ color: '#ef4444' }}>Access Denied</h2>
                <p style={{ color: '#b0b7d3' }}>You don't have permission to access this page.</p>
                <p style={{ color: '#6b7298', fontSize: 14 }}>
                    You need to have an <strong>Owner</strong> account to list properties.
                    <br />Please contact admin to upgrade your account role.
                </p>
            </div>
        );
    }

    return children;
}
