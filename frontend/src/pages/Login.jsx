import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Building2 } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form.email, form.password);
            toast.success('Welcome back! 👋');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 60px', background: 'radial-gradient(ellipse at 30% 40%, rgba(108,99,255,0.2) 0%, transparent 60%), #0a0b1e' }}>
            <div style={{ width: '100%', maxWidth: 420 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #6c63ff, #43e5f7)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 30px rgba(108,99,255,0.4)' }}>
                        <Building2 size={28} color="white" />
                    </div>
                    <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 8 }}>Welcome Back</h1>
                    <p style={{ color: '#6b7298', fontSize: 14 }}>Sign in to your EstateXAi account</p>
                </div>

                <div className="glass-card" style={{ padding: 36 }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#b0b7d3', fontWeight: 500 }}>Email Address</label>
                            <input type="email" required placeholder="you@example.com" value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                className="input" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#b0b7d3', fontWeight: 500 }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPwd ? 'text' : 'password'} required placeholder="••••••••" value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    className="input" style={{ paddingRight: 44 }} />
                                <button type="button" onClick={() => setShowPwd(!showPwd)}
                                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7298', display: 'flex' }}>
                                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '14px', borderRadius: 12, fontSize: 16, marginTop: 4 }}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="divider" />

                    {/* Demo credentials */}
                    <div style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                        <p style={{ fontSize: 12, color: '#6b7298', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Demo Credentials</p>
                        <p style={{ fontSize: 13, color: '#b0b7d3' }}>Register an account to get started, or use the admin seed feature.</p>
                    </div>

                    <p style={{ textAlign: 'center', color: '#6b7298', fontSize: 14 }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: '#6c63ff', fontWeight: 600 }}>Create one free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
