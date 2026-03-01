import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Building2, Briefcase, Save } from 'lucide-react';

export default function Profile() {
    const { user, updateProfile, logout } = useAuth();
    const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', institution: user?.institution || '', workplace: user?.workplace || '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(form);
            toast.success('Profile updated successfully! ✅');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally { setLoading(false); }
    };

    const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

    const roleColors = { admin: '#ffd700', owner: '#43e5f7', user: '#6c63ff' };
    const roleColor = roleColors[user?.role] || '#6c63ff';

    return (
        <div style={{ paddingTop: 90, minHeight: '100vh' }}>
            <div className="container" style={{ paddingTop: 24, paddingBottom: 60, maxWidth: 600 }}>
                <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 8 }}>My Profile</h1>
                <p style={{ color: '#6b7298', marginBottom: 32 }}>Manage your account information</p>

                {/* Avatar */}
                <div className="glass-card" style={{ padding: 28, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${roleColor}, ${roleColor}bb)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'white', boxShadow: `0 8px 30px ${roleColor}50` }}>
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2 style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>{user?.name}</h2>
                        <p style={{ color: '#6b7298', fontSize: 14, marginBottom: 8 }}>{user?.email}</p>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: `${roleColor}20`, border: `1px solid ${roleColor}40`, fontSize: 12, color: roleColor, fontWeight: 600, textTransform: 'capitalize' }}>
                            {user?.role === 'admin' ? '🛡️' : user?.role === 'owner' ? '🏠' : '🔍'} {user?.role}
                        </span>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="glass-card" style={{ padding: 28 }}>
                    <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(108,99,255,0.2)' }}>Edit Information</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 13, color: '#b0b7d3', fontWeight: 500 }}>
                                <User size={13} /> Full Name
                            </label>
                            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 13, color: '#b0b7d3', fontWeight: 500 }}>
                                <Mail size={13} /> Email <span style={{ marginLeft: 4, fontSize: 11, color: '#6b7298' }}>(cannot change)</span>
                            </label>
                            <input className="input" value={user?.email} disabled style={{ opacity: 0.5 }} />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 13, color: '#b0b7d3', fontWeight: 500 }}>
                                <Phone size={13} /> Phone Number
                            </label>
                            <input className="input" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 13, color: '#b0b7d3', fontWeight: 500 }}>
                                <Building2 size={13} /> College / Institution
                                <span style={{ fontSize: 11, color: '#6c63ff' }}>(used for AI PG recommendations)</span>
                            </label>
                            <input className="input" placeholder="e.g. SPPU University, MIT Pune" value={form.institution} onChange={e => set('institution', e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 13, color: '#b0b7d3', fontWeight: 500 }}>
                                <Briefcase size={13} /> Workplace
                            </label>
                            <input className="input" placeholder="e.g. Infosys, TCS" value={form.workplace} onChange={e => set('workplace', e.target.value)} />
                        </div>

                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '14px', borderRadius: 12, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                            <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>

                {/* Danger Zone */}
                <div className="glass-card" style={{ padding: 24, marginTop: 20, border: '1px solid rgba(239,68,68,0.2)' }}>
                    <h3 style={{ color: '#ef4444', fontWeight: 600, marginBottom: 12 }}>Danger Zone</h3>
                    <p style={{ color: '#6b7298', fontSize: 14, marginBottom: 16 }}>Logging out will clear your session.</p>
                    <button onClick={() => { logout(); }} className="btn btn-danger" style={{ fontSize: 14 }}>
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}
