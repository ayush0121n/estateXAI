import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Building2, User, Briefcase } from 'lucide-react';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'user', institution: '', workplace: '' });
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            await register(form);
            toast.success('Account created! Welcome to EstateXAi 🎉');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 60px', background: 'radial-gradient(ellipse at 70% 30%, rgba(67,229,247,0.1) 0%, transparent 60%), #0a0b1e' }}>
            <div style={{ width: '100%', maxWidth: 480 }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #6c63ff, #43e5f7)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 30px rgba(108,99,255,0.4)' }}>
                        <Building2 size={28} color="white" />
                    </div>
                    <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 8 }}>Create Account</h1>
                    <p style={{ color: '#6b7298', fontSize: 14 }}>Join thousands on EstateXAi</p>
                </div>

                <div className="glass-card" style={{ padding: 36 }}>
                    {/* Role Selector */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                        {[
                            { value: 'user', label: '🔍 I\'m Looking', desc: 'Find properties & PGs' },
                            { value: 'owner', label: '🏠 I\'m an Owner', desc: 'List my properties' }
                        ].map(r => (
                            <button key={r.value} type="button" onClick={() => set('role', r.value)}
                                style={{ flex: 1, padding: '14px', borderRadius: 12, border: `1px solid ${form.role === r.value ? 'rgba(108,99,255,0.6)' : 'rgba(255,255,255,0.1)'}`, background: form.role === r.value ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', textAlign: 'center' }}>
                                <div style={{ fontSize: 16, fontWeight: 600, color: form.role === r.value ? '#6c63ff' : '#b0b7d3', marginBottom: 4 }}>{r.label}</div>
                                <div style={{ fontSize: 11, color: '#6b7298' }}>{r.desc}</div>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#b0b7d3', fontWeight: 500 }}>Full Name *</label>
                            <input type="text" required placeholder="Ayush Narkhede" value={form.name} onChange={e => set('name', e.target.value)} className="input" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#b0b7d3', fontWeight: 500 }}>Email *</label>
                            <input type="email" required placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} className="input" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#b0b7d3', fontWeight: 500 }}>Phone</label>
                            <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} className="input" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#b0b7d3', fontWeight: 500 }}>Password *</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPwd ? 'text' : 'password'} required placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} className="input" style={{ paddingRight: 44 }} />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7298', display: 'flex' }}>
                                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {form.role === 'user' && (
                            <>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#b0b7d3', fontWeight: 500 }}>
                                        <User size={12} style={{ display: 'inline', marginRight: 4 }} /> College / Institution <span style={{ color: '#6b7298', fontSize: 11 }}>(for smart PG recommendations)</span>
                                    </label>
                                    <input type="text" placeholder="e.g. SPPU University, MIT Pune" value={form.institution} onChange={e => set('institution', e.target.value)} className="input" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#b0b7d3', fontWeight: 500 }}>
                                        <Briefcase size={12} style={{ display: 'inline', marginRight: 4 }} /> Workplace <span style={{ color: '#6b7298', fontSize: 11 }}>(optional)</span>
                                    </label>
                                    <input type="text" placeholder="e.g. Infosys, TCS, Wipro" value={form.workplace} onChange={e => set('workplace', e.target.value)} className="input" />
                                </div>
                            </>
                        )}

                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '14px', borderRadius: 12, fontSize: 16, marginTop: 4 }}>
                            {loading ? 'Creating Account...' : 'Create Free Account'}
                        </button>
                    </form>

                    <div className="divider" />

                    <p style={{ textAlign: 'center', color: '#6b7298', fontSize: 14 }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#6c63ff', fontWeight: 600 }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
