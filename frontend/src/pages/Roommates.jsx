/* eslint-disable */
import { useState, useEffect } from 'react';
import { Users, Heart, Moon, Sun, Leaf, Cigarette, Briefcase, GraduationCap, MapPin, ChevronRight, Sliders } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://estatexai.onrender.com');

const FIELDS = {
    diet: { label: 'Diet', options: [{ v: 'veg', l: '🥦 Vegetarian' }, { v: 'non-veg', l: '🍗 Non-Veg' }, { v: 'vegan', l: '🌱 Vegan' }, { v: 'any', l: '🤷 Any' }] },
    smoking: { label: 'Smoking', options: [{ v: 'no', l: '🚭 Non-Smoker' }, { v: 'outside-only', l: '🚪 Outside Only' }, { v: 'yes', l: '🚬 Smoker' }] },
    sleepSchedule: { label: 'Sleep', options: [{ v: 'early-bird', l: '🌅 Early Bird' }, { v: 'night-owl', l: '🦉 Night Owl' }, { v: 'flexible', l: '😴 Flexible' }] },
    profession: { label: 'Profession', options: [{ v: 'student', l: '📚 Student' }, { v: 'working-professional', l: '💼 Working' }, { v: 'any', l: '🤷 Any' }] },
    gender: { label: 'Preferred Flatmate', options: [{ v: 'male', l: '👨 Male' }, { v: 'female', l: '👩 Female' }, { v: 'any', l: '🤝 Any' }] },
};

function CompatibilityRing({ score }) {
    const color = score >= 80 ? '#22c55e' : score >= 60 ? 'var(--primary)' : score >= 40 ? '#f59e0b' : '#ef4444';
    const label = score >= 80 ? 'Great Match' : score >= 60 ? 'Good Match' : score >= 40 ? 'Fair Match' : 'Low Match';
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 4px' }}>
                <svg width="64" height="64" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                    <circle cx="32" cy="32" r="26" fill="none" stroke={color} strokeWidth="6"
                        strokeDasharray={`${(score / 100) * 163} 163`}
                        strokeLinecap="round"
                        transform="rotate(-90 32 32)"
                        style={{ transition: 'stroke-dasharray 0.8s ease' }}
                    />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color }}>
                    {score}%
                </div>
            </div>
            <div style={{ fontSize: 11, color, fontWeight: 600 }}>{label}</div>
        </div>
    );
}

function ProfileForm({ profile, onSave }) {
    const [form, setForm] = useState({
        isLookingForRoommate: profile?.isLookingForRoommate || false,
        gender: profile?.gender || 'any',
        diet: profile?.diet || 'any',
        smoking: profile?.smoking || 'no',
        sleepSchedule: profile?.sleepSchedule || 'flexible',
        profession: profile?.profession || 'any',
        preferredArea: profile?.preferredArea || '',
        budgetMin: profile?.budgetMin || 5000,
        budgetMax: profile?.budgetMax || 15000,
        bio: profile?.bio || '',
        age: profile?.age || '',
    });

    return (
        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 8, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <Sliders size={20} color="var(--primary)" />
                <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 18, margin: 0 }}>My Roommate Profile</h2>
            </div>

            {/* Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '14px 16px', background: form.isLookingForRoommate ? 'rgba(201,163,94,0.1)' : 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', borderRadius: 8 }}>
                <button onClick={() => setForm(p => ({ ...p, isLookingForRoommate: !p.isLookingForRoommate }))} style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: form.isLookingForRoommate ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    position: 'relative', transition: 'background 0.2s'
                }}>
                    <div style={{ position: 'absolute', top: 3, left: form.isLookingForRoommate ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                </button>
                <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 14 }}>Looking for a Roommate</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{form.isLookingForRoommate ? 'You are visible in the matching pool' : 'Enable to start finding flatmates'}</div>
                </div>
            </div>

            <div className="roommate-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {Object.entries(FIELDS).map(([key, { label, options }]) => (
                    <div key={key}>
                        <label style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 8 }}>{label}</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {options.map(({ v, l }) => (
                                <button key={v} onClick={() => setForm(p => ({ ...p, [key]: v }))} style={{
                                    padding: '6px 12px', borderRadius: 6, fontSize: 12, border: '1px solid',
                                    borderColor: form[key] === v ? 'var(--primary)' : 'var(--dark-border)',
                                    background: form[key] === v ? 'rgba(201,163,94,0.15)' : 'transparent',
                                    color: form[key] === v ? 'var(--primary)' : 'var(--text-muted)',
                                    cursor: 'pointer', transition: 'all 0.15s'
                                }}>{l}</button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="roommate-form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Age</label>
                    <input type="number" placeholder="25" value={form.age} onChange={e => setForm(p => ({ ...p, age: Number(e.target.value) }))} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--dark-border)', borderRadius: 6, color: 'var(--text-primary)', padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Budget Min (₹)</label>
                    <input type="number" value={form.budgetMin} onChange={e => setForm(p => ({ ...p, budgetMin: Number(e.target.value) }))} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--dark-border)', borderRadius: 6, color: 'var(--text-primary)', padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Budget Max (₹)</label>
                    <input type="number" value={form.budgetMax} onChange={e => setForm(p => ({ ...p, budgetMax: Number(e.target.value) }))} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--dark-border)', borderRadius: 6, color: 'var(--text-primary)', padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
            </div>

            <div style={{ marginBottom: 20 }}>
                <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Preferred Area (e.g. Hinjewadi, Baner)</label>
                <input value={form.preferredArea} onChange={e => setForm(p => ({ ...p, preferredArea: e.target.value }))} placeholder="Hinjewadi, Baner, Kothrud..." style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--dark-border)', borderRadius: 6, color: 'var(--text-primary)', padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: 24 }}>
                <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 6 }}>Bio (max 300 chars)</label>
                <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value.slice(0, 300) }))} rows={3} placeholder="Tell potential flatmates about yourself..." style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--dark-border)', borderRadius: 6, color: 'var(--text-primary)', padding: '9px 12px', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                <div style={{ color: 'var(--text-muted)', fontSize: 11, textAlign: 'right' }}>{form.bio.length}/300</div>
            </div>

            <button onClick={() => onSave(form)} style={{ width: '100%', background: 'var(--primary)', color: '#000', border: 'none', borderRadius: 6, padding: '12px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                Save Profile & Find Matches →
            </button>
        </div>
    );
}

export default function Roommates() {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [myProfile, setMyProfile] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [showSetup, setShowSetup] = useState(false);
    const [profileLoaded, setProfileLoaded] = useState(false);

    useEffect(() => {
        document.title = 'Find Flatmates | EstateXAi';
        if (!user) return;
        axios.get(`${API}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
            .then(({ data }) => {
                setMyProfile(data.user?.roommateProfile);
                setProfileLoaded(true);
                if (data.user?.roommateProfile?.isLookingForRoommate) fetchMatches();
            })
            .catch(() => setProfileLoaded(true));
    }, [user]);

    const fetchMatches = async () => {
        setLoadingMatches(true);
        try {
            const { data } = await axios.get(`${API}/api/user/roommates/match`, { headers: { Authorization: `Bearer ${token}` } });
            setMatches(data.matches || []);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not fetch matches.');
        } finally {
            setLoadingMatches(false);
        }
    };

    const handleSaveProfile = async (form) => {
        try {
            await axios.put(`${API}/api/user/roommate-profile`, form, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Profile saved!');
            setMyProfile(form);
            setShowSetup(false);
            if (form.isLookingForRoommate) fetchMatches();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save profile.');
        }
    };

    if (!user) return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
            <Users size={48} color="var(--primary)" />
            <h2 style={{ color: 'var(--text-primary)' }}>Find Your Perfect Flatmate</h2>
            <p style={{ color: 'var(--text-muted)' }}>Log in to use our smart roommate matching system.</p>
            <Link to="/login" className="btn btn-primary">Log In to Continue</Link>
        </div>
    );

    return (
        <div style={{ paddingTop: 90, minHeight: '100vh', background: 'var(--dark)' }}>
            <div className="container" style={{ paddingBottom: 60 }}>
                {/* Hero */}
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,163,94,0.1)', border: '1px solid rgba(201,163,94,0.3)', borderRadius: 20, padding: '6px 16px', marginBottom: 16 }}>
                        <Heart size={14} color="var(--primary)" />
                        <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>Flatmate Finder</span>
                    </div>
                    <h1 style={{ fontSize: 42, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>Find Your <span style={{ color: 'var(--primary)' }}>Perfect</span> Flatmate</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
                        Our AI matches you based on lifestyle, diet, sleep habits, and budget — no more random WhatsApp searches.
                    </p>
                </div>

                {(!myProfile?.isLookingForRoommate || showSetup) ? (
                    <div style={{ maxWidth: 700, margin: '0 auto' }}>
                        <ProfileForm profile={myProfile} onSave={handleSaveProfile} />
                    </div>
                ) : (
                    <div>
                        {/* Controls */}
                        <div className="roommate-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
                                Found <strong style={{ color: 'var(--primary)' }}>{matches.length}</strong> compatible flatmates
                            </div>
                            <button onClick={() => setShowSetup(true)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', borderRadius: 6, color: 'var(--text-secondary)', padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>
                                Edit My Profile
                            </button>
                        </div>

                        {loadingMatches ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Finding your best matches...</div>
                        ) : matches.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <Users size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                                <p style={{ color: 'var(--text-muted)' }}>No matches yet. More people are joining every day!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                                {matches.map(({ user: m, compatibilityScore }) => (
                                    <div key={m._id} style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 8, padding: 24, transition: 'border-color 0.2s, transform 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,163,94,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--dark-border)'; e.currentTarget.style.transform = 'none'; }}
                                    >
                                        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                            {/* Avatar */}
                                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(201,163,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
                                                {m.avatar ? <img src={m.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : m.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 16 }}>{m.name}</div>
                                                {m.roommateProfile?.age > 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{m.roommateProfile.age} years old</div>}
                                                {m.roommateProfile?.preferredArea && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                                                        <MapPin size={10} /> {m.roommateProfile.preferredArea}
                                                    </div>
                                                )}
                                            </div>
                                            <CompatibilityRing score={compatibilityScore} />
                                        </div>

                                        {/* Traits */}
                                        <div className="roommate-traits" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                                            {[
                                                m.roommateProfile?.diet !== 'any' && `🥗 ${m.roommateProfile?.diet}`,
                                                m.roommateProfile?.sleepSchedule === 'early-bird' ? '🌅 Early Bird' : m.roommateProfile?.sleepSchedule === 'night-owl' ? '🦉 Night Owl' : '😴 Flexible',
                                                m.roommateProfile?.smoking === 'no' ? '🚭 Non-Smoker' : m.roommateProfile?.smoking === 'outside-only' ? '🚪 Outside Only' : '🚬 Smoker',
                                                m.roommateProfile?.profession !== 'any' && (m.roommateProfile?.profession === 'student' ? '📚 Student' : '💼 Professional'),
                                            ].filter(Boolean).map(trait => (
                                                <span key={trait} style={{ padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', fontSize: 11, color: 'var(--text-muted)' }}>{trait}</span>
                                            ))}
                                        </div>

                                        {/* Budget */}
                                        <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>
                                            Budget: <strong style={{ color: 'var(--text-secondary)' }}>₹{m.roommateProfile?.budgetMin?.toLocaleString()} – ₹{m.roommateProfile?.budgetMax?.toLocaleString()}/mo</strong>
                                        </div>

                                        {/* Bio */}
                                        {m.roommateProfile?.bio && (
                                            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 14px', lineHeight: 1.5, borderLeft: '2px solid rgba(201,163,94,0.3)', paddingLeft: 10 }}>
                                                "{m.roommateProfile.bio}"
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

