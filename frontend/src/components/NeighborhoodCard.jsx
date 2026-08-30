/* eslint-disable */
import { useState, useEffect } from 'react';
import { Shield, Volume2, Sparkles, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://estatexai.onrender.com');

function StarRating({ value, onChange, disabled }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" disabled={disabled}
                    onClick={() => onChange && onChange(s)}
                    onMouseEnter={() => !disabled && setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    style={{ background: 'none', border: 'none', cursor: disabled ? 'default' : 'pointer', padding: 2 }}
                >
                    <Star size={18}
                        fill={(hovered || value) >= s ? 'var(--primary)' : 'none'}
                        color={(hovered || value) >= s ? 'var(--primary)' : 'var(--dark-border)'}
                    />
                </button>
            ))}
        </div>
    );
}

export default function NeighborhoodCard({ area, city = 'India' }) {
    const { user, token } = useAuth();
    const [stats, setStats] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ safetyScore: 0, noiseLevel: 0, cleanlinessScore: 0, review: '' });

    useEffect(() => {
        if (!area) return;
        const areaName = area.split(',')[0].trim();
        axios.get(`${API}/api/neighborhood/${encodeURIComponent(areaName)}`)
            .then(({ data }) => { setStats(data.stats); setReviews(data.reviews || []); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [area]);

    const handleSubmit = async () => {
        if (!form.safetyScore || !form.noiseLevel || !form.cleanlinessScore)
            return toast.error('Please rate all three categories.');
        setSubmitting(true);
        try {
            const areaName = area.split(',')[0].trim();
            const { data } = await axios.post(`${API}/api/neighborhood/rate`,
                { area: areaName, city, ...form },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Rating submitted!');
            setShowForm(false);
            // Refresh stats
            const res = await axios.get(`${API}/api/neighborhood/${encodeURIComponent(areaName)}`);
            setStats(res.data.stats);
            setReviews(res.data.reviews || []);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit rating.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!area) return null;
    const areaName = area.split(',')[0].trim();

    const scoreLabel = (val) => {
        const v = parseFloat(val);
        if (v >= 4.5) return 'Excellent';
        if (v >= 3.5) return 'Good';
        if (v >= 2.5) return 'Average';
        return 'Poor';
    };

    return (
        <div style={{
            background: 'var(--dark-card)',
            border: '1px solid var(--dark-border)',
            borderRadius: 8,
            padding: 24,
            marginTop: 32
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 4, background: 'rgba(201,163,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield size={18} color="var(--primary)" />
                    </div>
                    <div>
                        <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 16, margin: 0 }}>Neighborhood Vibe</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>{areaName}, {city}</p>
                    </div>
                </div>
                {user && (
                    <button onClick={() => setShowForm(!showForm)} style={{
                        background: showForm ? 'rgba(201,163,94,0.2)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--dark-border)',
                        borderRadius: 6, color: 'var(--primary)', padding: '7px 14px',
                        fontSize: 13, cursor: 'pointer', fontWeight: 500
                    }}>
                        {showForm ? 'Cancel' : '+ Rate this area'}
                    </button>
                )}
            </div>

            {/* Rating Form */}
            {showForm && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', borderRadius: 8, padding: 20, marginBottom: 20 }}>
                    <h4 style={{ color: 'var(--text-primary)', margin: '0 0 16px', fontSize: 14, fontWeight: 600 }}>Rate {areaName}</h4>
                    {[
                        { key: 'safetyScore', label: 'Safety', icon: Shield, hint: '5 = Very Safe' },
                        { key: 'noiseLevel', label: 'Noise Level', icon: Volume2, hint: '5 = Very Noisy' },
                        { key: 'cleanlinessScore', label: 'Cleanliness', icon: Sparkles, hint: '5 = Very Clean' }
                    ].map(({ key, label, icon: Icon, hint }) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <Icon size={14} color="var(--text-muted)" style={{ width: 16 }} />
                            <span style={{ color: 'var(--text-secondary)', fontSize: 13, width: 110 }}>{label}</span>
                            <StarRating value={form[key]} onChange={v => setForm(p => ({ ...p, [key]: v }))} />
                            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{hint}</span>
                        </div>
                    ))}
                    <textarea
                        placeholder="Optional: share your experience living here..."
                        value={form.review}
                        onChange={e => setForm(p => ({ ...p, review: e.target.value }))}
                        rows={3}
                        style={{
                            width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--dark-border)',
                            borderRadius: 6, color: 'var(--text-primary)', fontSize: 13, padding: 10,
                            resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginTop: 8
                        }}
                    />
                    <button onClick={handleSubmit} disabled={submitting} style={{
                        marginTop: 12, background: 'var(--primary)', color: '#000', border: 'none',
                        borderRadius: 6, padding: '9px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer'
                    }}>
                        {submitting ? 'Submitting...' : 'Submit Rating'}
                    </button>
                </div>
            )}

            {loading ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>Loading ratings...</div>
            ) : !stats ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No ratings yet for this area. Be the first to rate it!</p>
                </div>
            ) : (
                <>
                    {/* Stats grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                        {[
                            { label: 'Overall Score', value: stats.overallScore, max: 5 },
                            { label: 'Safety', value: stats.avgSafety, icon: Shield },
                            { label: 'Noise Level', value: stats.avgNoise, icon: Volume2 },
                            { label: 'Cleanliness', value: stats.avgCleanliness, icon: Sparkles }
                        ].map(({ label, value }) => (
                            <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', borderRadius: 6, padding: '14px 10px', textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{value}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>{scoreLabel(value)}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 16 }}>Based on {stats.totalRatings} community rating{stats.totalRatings !== 1 ? 's' : ''}</div>

                    {/* Recent reviews */}
                    {reviews.filter(r => r.review).slice(0, 2).map(r => (
                        <div key={r._id} style={{ padding: '12px 0', borderTop: '1px solid var(--dark-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(201,163,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>
                                    {r.user?.name?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>{r.user?.name || 'Anonymous'}</span>
                                <div style={{ display: 'flex', gap: 2 }}>
                                    {[1,2,3,4,5].map(s => <Star key={s} size={10} fill={s <= r.safetyScore ? 'var(--primary)' : 'none'} color={s <= r.safetyScore ? 'var(--primary)' : 'var(--dark-border)'} />)}
                                </div>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>{r.review}</p>
                        </div>
                    ))}
                </>
            )}
            {!user && <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', marginTop: 12 }}>
                <a href="/login" style={{ color: 'var(--primary)' }}>Log in</a> to rate this neighborhood.
            </p>}
        </div>
    );
}

