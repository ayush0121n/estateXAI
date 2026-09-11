/* eslint-disable */
import { useState } from 'react';
import { MapPin, Bike, Car, Bus, Zap, Clock, LocateFixed } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://estatexai.onrender.com');

export default function CommuteScorer({ propertyLat, propertyLng }) {
    const [workplace, setWorkplace] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!propertyLat || !propertyLng) return null;

    const handleCalculate = async (useLocation = false) => {
        if (!useLocation && !workplace.trim()) return toast.error('Please enter your workplace.');
        setLoading(true);
        setResult(null);
        
        try {
            let payload = { propertyLat, propertyLng };
            
            if (useLocation) {
                // Fetch browser location
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
                });
                payload.userLat = position.coords.latitude;
                payload.userLng = position.coords.longitude;
                setWorkplace('Current Location');
            } else {
                payload.workplace = workplace;
            }

            const { data } = await axios.post(`${API}/api/commute/score`, payload);
            setResult(data);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Could not calculate commute. Ensure location permissions are granted.');
        } finally {
            setLoading(false);
        }
    };

    const scoreColor = (s) => s >= 80 ? '#22c55e' : s >= 60 ? '#f59e0b' : s >= 40 ? '#f97316' : '#ef4444';
    const scoreBg = (s) => s >= 80 ? 'rgba(34,197,94,0.1)' : s >= 60 ? 'rgba(245,158,11,0.1)' : s >= 40 ? 'rgba(249,115,22,0.1)' : 'rgba(239,68,68,0.1)';

    return (
        <div style={{
            background: 'var(--dark-card)',
            border: '1px solid var(--dark-border)',
            borderRadius: 8,
            padding: 24,
            marginTop: 32
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 4, background: 'rgba(201,163,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={18} color="var(--primary)" />
                </div>
                <div>
                    <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 16, margin: 0 }}>AI Commute Scorer</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Enter your workplace to see how far this property is</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <MapPin size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="e.g. Infosys Hinjewadi..."
                        value={workplace}
                        onChange={e => setWorkplace(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCalculate(false)}
                        style={{
                            width: '100%', paddingLeft: 38, padding: '10px 12px 10px 38px',
                            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--dark-border)',
                            borderRadius: 6, color: 'var(--text-primary)', fontSize: 14,
                            outline: 'none', boxSizing: 'border-box'
                        }}
                    />
                </div>
                <button
                    onClick={() => handleCalculate(true)}
                    disabled={loading}
                    title="Use My Exact Location"
                    style={{
                        background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', border: '1px solid var(--dark-border)',
                        borderRadius: 6, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s'
                    }}
                >
                    <LocateFixed size={18} />
                </button>
                <button
                    onClick={() => handleCalculate(false)}
                    disabled={loading}
                    style={{
                        background: 'var(--primary)', color: '#000', border: 'none',
                        borderRadius: 6, padding: '10px 20px', fontWeight: 600, fontSize: 14,
                        cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
                        opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s'
                    }}
                >
                    {loading ? 'Calculating...' : 'Calculate'}
                </button>
            </div>

            {result && (
                <div style={{ marginTop: 20, animation: 'fadeIn 0.4s ease' }}>
                    {/* Score bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: scoreBg(result.liveabilityScore), borderRadius: 8, marginBottom: 16 }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 32, fontWeight: 800, color: scoreColor(result.liveabilityScore), lineHeight: 1 }}>{result.liveabilityScore}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>/ 100</div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 15 }}>Liveability Score</div>
                            <div style={{ color: scoreColor(result.liveabilityScore), fontSize: 13, fontWeight: 500 }}>{result.timeInsight.verdict}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                                <strong style={{ color: 'var(--text-secondary)' }}>{result.distanceKm} km</strong> from <strong style={{ color: 'var(--text-secondary)' }}>{result.workplace}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Commute times */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
                        {[
                            { icon: Bike, label: 'Bike / Scooter', time: result.commuteTimes.bike, color: '#22c55e' },
                            { icon: Car, label: 'Auto / Cab', time: result.commuteTimes.auto, color: '#f59e0b' },
                            { icon: Bus, label: 'Bus / Metro', time: result.commuteTimes.bus, color: '#6366f1' }
                        ].map(({ icon: Icon, label, time, color }) => (
                            <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', borderRadius: 6, padding: '12px', textAlign: 'center' }}>
                                <Icon size={18} color={color} style={{ marginBottom: 6 }} />
                                <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 18 }}>{time}m</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Time cost insight */}
                    <div style={{ display: 'flex', gap: 8, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                        <Zap size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: 1 }} />
                        <span>
                            Daily commute costs you <strong style={{ color: 'var(--text-primary)' }}>~{result.commuteTimes.bike * 2} min/day</strong> — that's
                            <strong style={{ color: 'var(--text-primary)' }}> {result.timeInsight.weeklyHours} hrs/week</strong> and
                            <strong style={{ color: 'var(--text-primary)' }}> {result.timeInsight.monthlyHours} hrs/month</strong>.
                        </span>
                    </div>
                </div>
            )}
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
}

