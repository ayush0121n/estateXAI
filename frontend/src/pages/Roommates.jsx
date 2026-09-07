/* eslint-disable */
import { useState, useEffect } from 'react';
import { Users, Heart, Moon, Sun, Leaf, Cigarette, Briefcase, GraduationCap, MapPin, ChevronRight, Sliders, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const FIELDS = {
    diet: { label: 'Diet', options: [{ v: 'veg', l: '🥦 Vegetarian' }, { v: 'non-veg', l: '🍗 Non-Veg' }, { v: 'vegan', l: '🌱 Vegan' }, { v: 'any', l: '🤷 Any' }] },
    smoking: { label: 'Smoking', options: [{ v: 'no', l: '🚭 Non-Smoker' }, { v: 'outside-only', l: '🚪 Outside Only' }, { v: 'yes', l: '🚬 Smoker' }] },
    sleepSchedule: { label: 'Sleep', options: [{ v: 'early-bird', l: '🌅 Early Bird' }, { v: 'night-owl', l: '🦉 Night Owl' }, { v: 'flexible', l: '😴 Flexible' }] },
    profession: { label: 'Profession', options: [{ v: 'student', l: '📚 Student' }, { v: 'working-professional', l: '💼 Working' }, { v: 'any', l: '🤷 Any' }] },
    gender: { label: 'Preferred Flatmate', options: [{ v: 'male', l: '👨 Male' }, { v: 'female', l: '👩 Female' }, { v: 'any', l: '🤝 Any' }] },
    timeline: { label: 'Move-In Timeline', options: [{ v: 'immediate', l: '⚡ Immediate' }, { v: '15-days', l: '⏳ 15 Days' }, { v: 'next-month', l: '📅 Next Month' }, { v: 'flexible', l: '🧘 Flexible' }] },
    cleanliness: { label: 'Cleanliness', options: [{ v: 'super-clean', l: '✨ Super Clean' }, { v: 'moderate', l: '🧹 Moderate' }, { v: 'relaxed', l: '🛋️ Relaxed' }] },
    cooking: { label: 'Cooking Habits', options: [{ v: 'daily', l: '🍳 Daily' }, { v: 'occasional', l: '🍲 Occasional' }, { v: 'outside-food', l: '🥡 Outside Food' }] },
    pets: { label: 'Pet Policy', options: [{ v: 'has-pets', l: '🐶 Has Pets' }, { v: 'open-to-pets', l: '🐱 Open to Pets' }, { v: 'no-pets', l: '🚫 No Pets' }] }
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
        timeline: profile?.timeline || 'flexible',
        cleanliness: profile?.cleanliness || 'moderate',
        cooking: profile?.cooking || 'occasional',
        pets: profile?.pets || 'open-to-pets',
        contactNumber: profile?.contactNumber || ''
    });

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 12, padding: 32, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(201,163,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sliders size={20} color="var(--primary)" />
                </div>
                <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 22, margin: 0 }}>My Roommate Profile</h2>
            </div>

            {/* Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, padding: '16px 20px', background: form.isLookingForRoommate ? 'rgba(201,163,94,0.08)' : 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)', borderRadius: 10 }}>
                <button onClick={() => setForm(p => ({ ...p, isLookingForRoommate: !p.isLookingForRoommate }))} style={{
                    width: 50, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                    background: form.isLookingForRoommate ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    position: 'relative', transition: 'background 0.3s ease'
                }}>
                    <div style={{ position: 'absolute', top: 3, left: form.isLookingForRoommate ? 25 : 3, width: 22, height: 22, borderRadius: '50%', background: 'white', transition: 'left 0.3s ease', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} />
                </button>
                <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Looking for a Roommate</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{form.isLookingForRoommate ? 'You are visible in the matching pool and can find flatmates.' : 'Enable this to start finding your perfect flatmate.'}</div>
                </div>
            </div>

            <div className="roommate-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginBottom: 28 }}>
                {Object.entries(FIELDS).map(([key, { label, options }]) => (
                    <div key={key}>
                        <label style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {options.map(({ v, l }) => (
                                <button key={v} onClick={() => setForm(p => ({ ...p, [key]: v }))} style={{
                                    padding: '8px 14px', borderRadius: 8, fontSize: 13, border: '1px solid',
                                    borderColor: form[key] === v ? 'var(--primary)' : 'var(--dark-border)',
                                    background: form[key] === v ? 'rgba(201,163,94,0.1)' : 'rgba(255,255,255,0.02)',
                                    color: form[key] === v ? 'var(--primary)' : 'var(--text-muted)',
                                    cursor: 'pointer', transition: 'all 0.2s ease',
                                    fontWeight: form[key] === v ? 600 : 400
                                }}>{l}</button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ height: 1, background: 'var(--dark-border)', margin: '32px 0' }} />

            <div className="roommate-form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 8, fontWeight: 500 }}>Age</label>
                    <input type="number" placeholder="25" value={form.age} onChange={e => setForm(p => ({ ...p, age: Number(e.target.value) }))} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', borderRadius: 8, color: 'var(--text-primary)', padding: '12px 14px', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--dark-border)'} />
                </div>
                <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 8, fontWeight: 500 }}>Budget Min (₹)</label>
                    <input type="number" value={form.budgetMin} onChange={e => setForm(p => ({ ...p, budgetMin: Number(e.target.value) }))} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', borderRadius: 8, color: 'var(--text-primary)', padding: '12px 14px', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--dark-border)'} />
                </div>
                <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 8, fontWeight: 500 }}>Budget Max (₹)</label>
                    <input type="number" value={form.budgetMax} onChange={e => setForm(p => ({ ...p, budgetMax: Number(e.target.value) }))} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', borderRadius: 8, color: 'var(--text-primary)', padding: '12px 14px', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--dark-border)'} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 8, fontWeight: 500 }}>Preferred Area (e.g. Hinjewadi)</label>
                    <input value={form.preferredArea} onChange={e => setForm(p => ({ ...p, preferredArea: e.target.value }))} placeholder="Hinjewadi, Baner, Kothrud..." style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', borderRadius: 8, color: 'var(--text-primary)', padding: '12px 14px', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--dark-border)'} />
                </div>
                <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 8, fontWeight: 500 }}>Contact Number (WhatsApp)</label>
                    <input type="tel" value={form.contactNumber} onChange={e => setForm(p => ({ ...p, contactNumber: e.target.value }))} placeholder="+91 9876543210" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', borderRadius: 8, color: 'var(--text-primary)', padding: '12px 14px', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--dark-border)'} />
                </div>
            </div>

            <div style={{ marginBottom: 32 }}>
                <label style={{ color: 'var(--text-muted)', fontSize: 13, display: 'block', marginBottom: 8, fontWeight: 500 }}>Bio (max 300 chars)</label>
                <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value.slice(0, 300) }))} rows={3} placeholder="Tell potential flatmates about yourself, your habits, and what you're looking for..." style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', borderRadius: 8, color: 'var(--text-primary)', padding: '12px 14px', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--dark-border)'} />
                <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'right', marginTop: 4 }}>{form.bio.length}/300</div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onSave(form)} style={{ width: '100%', background: 'var(--primary)', color: '#000', border: 'none', borderRadius: 8, padding: '14px', fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(201,163,94,0.3)' }}>
                Save Profile & Find Matches <ChevronRight size={18} />
            </motion.button>
        </motion.div>
    );
}

export default function Roommates() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [myProfile, setMyProfile] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [showSetup, setShowSetup] = useState(false);
    const [profileLoaded, setProfileLoaded] = useState(false);

    useEffect(() => {
        document.title = 'Find Flatmates | EstateXAi';
        if (!user) return;
        
        // Use `api` from utils which automatically handles the token
        api.get(`/user/profile`)
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
            const { data } = await api.get(`/user/roommates/match`);
            setMatches(data.matches || []);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not fetch matches.');
        } finally {
            setLoadingMatches(false);
        }
    };

    const handleSaveProfile = async (form) => {
        try {
            await api.put(`/user/roommate-profile`, form);
            toast.success('Profile saved!');
            setMyProfile(form);
            setShowSetup(false);
            if (form.isLookingForRoommate) fetchMatches();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save profile.');
        }
    };

    const handleConnect = (match) => {
        if (!match.roommateProfile?.contactNumber) {
            toast.error("This user hasn't provided a contact number.");
            return;
        }
        // Format the number by stripping non-digit characters (optional logic)
        let phone = match.roommateProfile.contactNumber.replace(/\D/g, '');
        // Default to India +91 if no country code provided, just as a fallback
        if (phone.length === 10) phone = `91${phone}`;
        
        const message = `Hi ${match.name}! I found your profile on EstateXAi and we have a ${match.compatibilityScore}% compatibility score. Let's connect!`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    if (!user) return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(201,163,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={40} color="var(--primary)" />
            </div>
            <h2 style={{ color: 'var(--text-primary)', fontSize: 28, margin: 0 }}>Find Your Perfect Flatmate</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>Log in to use our smart roommate matching system.</p>
            <Link to="/login" className="btn btn-primary" style={{ padding: '12px 32px', borderRadius: 8 }}>Log In to Continue</Link>
        </div>
    );

    return (
        <div style={{ paddingTop: 90, minHeight: '100vh', background: 'var(--dark)' }}>
            <div className="container" style={{ paddingBottom: 80 }}>
                {/* Hero */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', marginBottom: 56 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,163,94,0.1)', border: '1px solid rgba(201,163,94,0.3)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
                        <Heart size={14} color="var(--primary)" />
                        <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.5px' }}>FLATMATE FINDER</span>
                    </div>
                    <h1 style={{ fontSize: 46, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px', letterSpacing: '-0.5px' }}>Find Your <span style={{ color: 'var(--primary)' }}>Perfect</span> Flatmate</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 18, maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
                        Our AI matches you based on lifestyle, diet, cleanliness, and budget — say goodbye to random WhatsApp group searches.
                    </p>
                </motion.div>

                {(!myProfile?.isLookingForRoommate || showSetup) ? (
                    <div style={{ maxWidth: 760, margin: '0 auto' }}>
                        <ProfileForm profile={myProfile} onSave={handleSaveProfile} />
                    </div>
                ) : (
                    <div>
                        {/* Controls */}
                        <div className="roommate-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, background: 'rgba(255,255,255,0.02)', padding: '16px 24px', borderRadius: 12, border: '1px solid var(--dark-border)' }}>
                            <div style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 500 }}>
                                Found <strong style={{ color: 'var(--primary)', fontSize: 20 }}>{matches.length}</strong> compatible flatmates
                            </div>
                            <button onClick={() => setShowSetup(true)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', borderRadius: 8, color: 'var(--text-primary)', padding: '10px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e => e.target.style.background='rgba(255,255,255,0.05)'}>
                                Edit Profile
                            </button>
                        </div>

                        {loadingMatches ? (
                            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 40, height: 40, border: '3px solid rgba(201,163,94,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 20px' }} />
                                Finding your best matches...
                            </div>
                        ) : matches.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 0', background: 'var(--dark-card)', borderRadius: 16, border: '1px dashed var(--dark-border)' }}>
                                <Users size={56} color="var(--text-muted)" style={{ marginBottom: 20, opacity: 0.5 }} />
                                <h3 style={{ color: 'var(--text-primary)', fontSize: 20, marginBottom: 8 }}>No perfect matches yet</h3>
                                <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>We couldn't find anyone with your exact preferences. Check back later as more people join every day!</p>
                            </motion.div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
                                <AnimatePresence>
                                    {matches.map(({ user: m, compatibilityScore }, idx) => (
                                        <motion.div key={m._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)', borderRadius: 16, padding: 28, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                            
                                            {/* Top Section */}
                                            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                                                {/* Avatar */}
                                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(201,163,94,0.4), rgba(201,163,94,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'var(--primary)', flexShrink: 0, border: '2px solid rgba(201,163,94,0.3)', overflow: 'hidden' }}>
                                                    {m.avatar ? <img src={m.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : m.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div style={{ flex: 1, paddingTop: 4 }}>
                                                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{m.name}</div>
                                                    <div style={{ display: 'flex', gap: 12, color: 'var(--text-muted)', fontSize: 13 }}>
                                                        {m.roommateProfile?.age > 0 && <span>{m.roommateProfile.age} yrs</span>}
                                                        {m.roommateProfile?.preferredArea && (
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                <MapPin size={12} color="var(--primary)" /> {m.roommateProfile.preferredArea}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{ flexShrink: 0, transform: 'scale(0.9)', transformOrigin: 'top right' }}>
                                                    <CompatibilityRing score={compatibilityScore} />
                                                </div>
                                            </div>

                                            {/* Traits */}
                                            <div className="roommate-traits" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20, flex: 1 }}>
                                                {[
                                                    m.roommateProfile?.timeline && m.roommateProfile?.timeline !== 'flexible' && `📅 ${FIELDS.timeline.options.find(o=>o.v===m.roommateProfile.timeline)?.l.slice(3) || 'Timeline'}`,
                                                    m.roommateProfile?.cleanliness && m.roommateProfile?.cleanliness !== 'moderate' && `✨ ${FIELDS.cleanliness.options.find(o=>o.v===m.roommateProfile.cleanliness)?.l.slice(3) || 'Cleanliness'}`,
                                                    m.roommateProfile?.diet !== 'any' && `🥗 ${m.roommateProfile?.diet}`,
                                                    m.roommateProfile?.sleepSchedule === 'early-bird' ? '🌅 Early Bird' : m.roommateProfile?.sleepSchedule === 'night-owl' ? '🦉 Night Owl' : '😴 Flexible',
                                                    m.roommateProfile?.smoking === 'no' ? '🚭 Non-Smoker' : m.roommateProfile?.smoking === 'outside-only' ? '🚪 Outside Only' : '🚬 Smoker',
                                                    m.roommateProfile?.profession !== 'any' && (m.roommateProfile?.profession === 'student' ? '📚 Student' : '💼 Professional'),
                                                    m.roommateProfile?.pets !== 'open-to-pets' && `🐾 ${FIELDS.pets.options.find(o=>o.v===m.roommateProfile.pets)?.l.slice(3) || 'Pets'}`
                                                ].filter(Boolean).map(trait => (
                                                    <span key={trait} style={{ padding: '6px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{trait}</span>
                                                ))}
                                            </div>

                                            {/* Budget & Bio */}
                                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                                                <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: m.roommateProfile?.bio ? 12 : 0 }}>
                                                    Budget: <strong style={{ color: 'var(--primary)', fontSize: 15 }}>₹{m.roommateProfile?.budgetMin?.toLocaleString()} – ₹{m.roommateProfile?.budgetMax?.toLocaleString()}/mo</strong>
                                                </div>
                                                {m.roommateProfile?.bio && (
                                                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
                                                        "{m.roommateProfile.bio}"
                                                    </p>
                                                )}
                                            </div>

                                            {/* Connect Button */}
                                            <motion.button 
                                                whileHover={{ scale: 1.02, background: 'var(--primary)' }} 
                                                whileTap={{ scale: 0.98 }} 
                                                onClick={() => handleConnect({user: m, name: m.name, compatibilityScore, roommateProfile: m.roommateProfile})}
                                                style={{ width: '100%', background: 'rgba(201,163,94,0.1)', color: 'var(--primary)', border: '1px solid rgba(201,163,94,0.3)', borderRadius: 8, padding: '12px', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'color 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.color = '#000'}
                                                onMouseLeave={e => e.currentTarget.style.color = 'var(--primary)'}
                                            >
                                                <MessageCircle size={16} />
                                                Connect via WhatsApp
                                            </motion.button>
                                            
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
