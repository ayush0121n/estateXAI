import { Link } from 'react-router-dom';
import { Home, Building2 } from 'lucide-react';

export default function NotFound() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 24px 60px' }}>
            <div>
                <div style={{ fontSize: 120, fontWeight: 900, fontFamily: 'Outfit, sans-serif', background: 'linear-gradient(135deg, #6c63ff, #43e5f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: 16 }}>
                    404
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 12 }}>Page Not Found</h1>
                <p style={{ color: '#6b7298', marginBottom: 40, maxWidth: 400, margin: '0 auto 40px' }}>
                    The page you're looking for doesn't exist. It may have been moved or deleted.
                </p>
                <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
                    <Link to="/" className="btn btn-primary" style={{ padding: '12px 28px' }}>
                        <Home size={16} /> Go Home
                    </Link>
                    <Link to="/properties" className="btn btn-ghost" style={{ padding: '12px 28px' }}>
                        <Building2 size={16} /> Browse Properties
                    </Link>
                </div>
            </div>
        </div>
    );
}
