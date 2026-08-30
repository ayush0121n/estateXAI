import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Building2, Briefcase, Save, Heart, Bookmark, History, SlidersHorizontal, Trash2 } from 'lucide-react';
import api from '../utils/api';
import { PropertyCard, PGCard } from '../components/ListingCard';

export default function Profile() {
    const { user, updateProfile, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('info'); // 'info' | 'preferences' | 'favorites' | 'searches' | 'history'
    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        institution: user?.institution || '',
        workplace: user?.workplace || '',
        preferences: {
            budgetMin: user?.preferences?.budgetMin || 0,
            budgetMax: user?.preferences?.budgetMax || 10000000,
            listingType: user?.preferences?.listingType || 'any',
            preferredCities: user?.preferences?.preferredCities?.join(', ') || 'Mumbai, Delhi',
            propertyTypes: user?.preferences?.propertyTypes || ['apartment'],
        }
    });
    const [loading, setLoading] = useState(false);

    // Profile data state fetched from GET /api/user/profile
    const [profileData, setProfileData] = useState(null);
    const [savedSearches, setSavedSearches] = useState([]);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        api.get('/user/profile').then(r => setProfileData(r.data.user)).catch(() => {});
        api.get('/user/searches').then(r => setSavedSearches(r.data.savedSearches || [])).catch(() => {});
        api.get('/user/history').then(r => setHistory(r.data.history || [])).catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...form,
                preferences: {
                    ...form.preferences,
                    preferredCities: form.preferences.preferredCities.split(',').map(s => s.trim()).filter(Boolean)
                }
            };
            await updateProfile(payload);
            toast.success('Profile updated successfully! ✅');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally { setLoading(false); }
    };

    const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
    const setPref = (key, val) => setForm(p => ({ ...p, preferences: { ...p.preferences, [key]: val } }));

    const roleColors = { admin: '#ffd700', owner: 'var(--primary-light)', user: 'var(--primary)' };
    const roleColor = roleColors[user?.role] || 'var(--primary)';

    return (
        <div style={{ paddingTop: 90, minHeight: '100vh', background: '#0a0d1a' }}>
            <div className="container" style={{ paddingTop: 24, paddingBottom: 60, maxWidth: 900 }}>
                <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 8 }}>My Profile</h1>
                <p style={{ color: '#6b7298', marginBottom: 28 }}>Manage your preferences, saved items, and search history</p>

                {/* Top Profile Card */}
                <div className="glass-card profile-card" style={{ padding: 28, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${roleColor}, ${roleColor}bb)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'white', boxShadow: `0 8px 30px ${roleColor}50` }}>
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ color: 'white', fontWeight: 700, fontSize: 20, margin: 0 }}>{user?.name}</h2>
                        <p style={{ color: '#6b7298', fontSize: 14, margin: '4px 0 8px' }}>{user?.email}</p>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: `${roleColor}20`, border: `1px solid ${roleColor}40`, fontSize: 12, color: roleColor, fontWeight: 600, textTransform: 'capitalize' }}>
                            {user?.role === 'admin' ? '🛡️' : user?.role === 'owner' ? '🏠' : '🔍'} {user?.role}
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="profile-tabs" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 24, paddingBottom: 4 }}>
                    {[
                        { id: 'info', label: 'Edit Info', icon: <User size={15} /> },
                        { id: 'preferences', label: 'Preferences', icon: <SlidersHorizontal size={15} /> },
                        { id: 'favorites', label: 'Saved Favorites', icon: <Heart size={15} /> },
                        { id: 'searches', label: 'Saved Searches', icon: <Bookmark size={15} /> },
                        { id: 'history', label: 'Activity History', icon: <History size={15} /> },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '10px 18px', borderRadius: 12, border: 'none',
                                background: activeTab === tab.id ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                                color: activeTab === tab.id ? '#fff' : '#aaa',
                                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap'
                            }}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'info' && (
                    <div className="glass-card" style={{ padding: 28 }}>
                        <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(201, 163, 94,0.2)' }}>Personal Information</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 13, color: '#b0b7d3', fontWeight: 500 }}><User size={13} /> Full Name</label>
                                <input className="input" value={form.name} onChange={e => set('name', e.target.value)} />
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 13, color: '#b0b7d3', fontWeight: 500 }}><Mail size={13} /> Email (read-only)</label>
                                <input className="input" value={user?.email} disabled style={{ opacity: 0.5 }} />
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 13, color: '#b0b7d3', fontWeight: 500 }}><Phone size={13} /> Phone Number</label>
                                <input className="input" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 13, color: '#b0b7d3', fontWeight: 500 }}><Building2 size={13} /> College / Institution <span style={{ fontSize: 11, color: 'var(--primary)' }}>(AI PG Match)</span></label>
                                <input className="input" placeholder="e.g. Delhi University, IIT Bombay" value={form.institution} onChange={e => set('institution', e.target.value)} />
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 13, color: '#b0b7d3', fontWeight: 500 }}><Briefcase size={13} /> Workplace</label>
                                <input className="input" placeholder="e.g. Infosys, TCS" value={form.workplace} onChange={e => set('workplace', e.target.value)} />
                            </div>

                            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '14px', borderRadius: 12, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'preferences' && (
                    <div className="glass-card" style={{ padding: 28 }}>
                        <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(201, 163, 94,0.2)' }}>Property Search Preferences</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div className="pref-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label style={{ fontSize: 13, color: '#b0b7d3', display: 'block', marginBottom: 6 }}>Min Budget (₹)</label>
                                    <input type="number" className="input" value={form.preferences.budgetMin} onChange={e => setPref('budgetMin', Number(e.target.value))} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, color: '#b0b7d3', display: 'block', marginBottom: 6 }}>Max Budget (₹)</label>
                                    <input type="number" className="input" value={form.preferences.budgetMax} onChange={e => setPref('budgetMax', Number(e.target.value))} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: 13, color: '#b0b7d3', display: 'block', marginBottom: 6 }}>Preferred Listing Type</label>
                                <select className="input" value={form.preferences.listingType} onChange={e => setPref('listingType', e.target.value)}>
                                    <option value="any">Any (Buy or Rent)</option>
                                    <option value="sale">Buy Only</option>
                                    <option value="rent">Rent Only</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: 13, color: '#b0b7d3', display: 'block', marginBottom: 6 }}>Preferred Cities (comma-separated)</label>
                                <input className="input" value={form.preferences.preferredCities} onChange={e => setPref('preferredCities', e.target.value)} />
                            </div>

                            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '14px', borderRadius: 12, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                <Save size={18} /> {loading ? 'Saving...' : 'Save Preferences'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'favorites' && (
                    <div>
                        <h3 style={{ color: 'white', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Saved Properties ({profileData?.savedProperties?.length || 0})</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 32 }}>
                            {(profileData?.savedProperties || []).map(p => <PropertyCard key={p._id} property={p} />)}
                            {(profileData?.savedProperties || []).length === 0 && <p style={{ color: '#555', gridColumn: '1/-1' }}>No saved properties yet. Click the heart icon on any listing!</p>}
                        </div>

                        <h3 style={{ color: 'white', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Saved PGs ({profileData?.savedPGs?.length || 0})</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                            {(profileData?.savedPGs || []).map(pg => <PGCard key={pg._id} pg={pg} />)}
                            {(profileData?.savedPGs || []).length === 0 && <p style={{ color: '#555', gridColumn: '1/-1' }}>No saved PGs yet.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'searches' && (
                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 16 }}>Saved Searches</h3>
                        {savedSearches.length === 0 ? (
                            <p style={{ color: '#555' }}>No saved searches. Save your frequent search criteria from the search page!</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {savedSearches.map((s, i) => (
                                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#fff' }}>{s.name || `Search #${i + 1}`}</div>
                                            <div style={{ fontSize: 12, color: '#888' }}>{new Date(s.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 12 }}>Run Search</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 16 }}>Activity History ({history.length})</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {history.map((h, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, fontSize: 13 }}>
                                    <span style={{ color: h.interactionType === 'favorite' ? '#ef4444' : 'var(--primary)', textTransform: 'capitalize', fontWeight: 600 }}>
                                        {h.interactionType}
                                    </span>
                                    <span style={{ color: '#aaa' }}>{h.itemType} ({h.itemId})</span>
                                    <span style={{ marginLeft: 'auto', color: '#555', fontSize: 11 }}>{new Date(h.createdAt).toLocaleString()}</span>
                                </div>
                            ))}
                            {history.length === 0 && <p style={{ color: '#555' }}>No activity history recorded yet.</p>}
                        </div>
                    </div>
                )}

                {/* Danger Zone */}
                <div className="glass-card" style={{ padding: 24, marginTop: 32, border: '1px solid rgba(239,68,68,0.2)' }}>
                    <h3 style={{ color: '#ef4444', fontWeight: 600, marginBottom: 12 }}>Account Actions</h3>
                    <button onClick={logout} className="btn btn-danger" style={{ fontSize: 14 }}>
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}
