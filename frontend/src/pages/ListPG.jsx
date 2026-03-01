import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Users, Plus, X } from 'lucide-react';

export default function ListPG() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [institutionInput, setInstitution] = useState('');

    const [form, setForm] = useState({
        name: '', description: '', type: 'pg', genderType: 'male',
        rentPerMonth: '', securityDeposit: '', sharingType: [],
        location: { address: '', city: 'Pune', state: 'Maharashtra', pincode: '', nearbyInstitutions: [] },
        amenities: { wifi: false, food: false, ac: false, laundry: false, parking: false, housekeeping: false, gym: false, studyRoom: false, cctv: false, powerBackup: false, hotWater: true, refrigerator: false, tv: false },
        meals: { breakfast: false, lunch: false, dinner: false },
        rules: { curfewTime: '', guestsAllowed: false, smokingAllowed: false, petsAllowed: false },
        totalRooms: 10, availableRooms: 5,
        images: []
    });

    const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
    const setLoc = (key, val) => setForm(p => ({ ...p, location: { ...p.location, [key]: val } }));
    const setAm = (key, val) => setForm(p => ({ ...p, amenities: { ...p.amenities, [key]: val } }));
    const setMeal = (key, val) => setForm(p => ({ ...p, meals: { ...p.meals, [key]: val } }));
    const setRule = (key, val) => setForm(p => ({ ...p, rules: { ...p.rules, [key]: val } }));

    const toggleSharing = (s) => setForm(p => ({ ...p, sharingType: p.sharingType.includes(s) ? p.sharingType.filter(x => x !== s) : [...p.sharingType, s] }));

    const addInstitution = () => {
        if (institutionInput.trim()) {
            setLoc('nearbyInstitutions', [...form.location.nearbyInstitutions, institutionInput.trim()]);
            setInstitution('');
        }
    };

    const addImage = () => { if (imageUrl.trim()) { setForm(p => ({ ...p, images: [...p.images, imageUrl.trim()] })); setImageUrl(''); } };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.rentPerMonth || !form.location.address) { toast.error('Fill required fields'); return; }
        setLoading(true);
        try {
            const { data } = await api.post('/pgs', { ...form, rentPerMonth: Number(form.rentPerMonth), securityDeposit: Number(form.securityDeposit || 0), totalRooms: Number(form.totalRooms), availableRooms: Number(form.availableRooms) });
            toast.success('PG listed successfully! 🎉');
            navigate(`/pgs/${data.pg._id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to list PG');
        } finally { setLoading(false); }
    };

    const Section = ({ title, children }) => (
        <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
            <h3 style={{ color: 'white', fontWeight: 700, marginBottom: 20, fontSize: 16, borderBottom: '1px solid rgba(108,99,255,0.2)', paddingBottom: 12 }}>{title}</h3>
            {children}
        </div>
    );

    const Field = ({ label, required, children }) => (
        <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#b0b7d3', fontWeight: 500 }}>{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</label>
            {children}
        </div>
    );

    const Toggle = ({ label, checked, onChange }) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#b0b7d3', fontSize: 14 }}>{label}</span>
            <button type="button" onClick={() => onChange(!checked)}
                style={{ width: 44, height: 24, borderRadius: 12, background: checked ? '#6c63ff' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.3s' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: checked ? 23 : 3, transition: 'left 0.3s' }} />
            </button>
        </div>
    );

    return (
        <div style={{ paddingTop: 90, minHeight: '100vh' }}>
            <div className="container" style={{ paddingTop: 24, paddingBottom: 60, maxWidth: 800 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                    <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #43e5f7, #6c63ff)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={22} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 800, color: 'white' }}>List a PG / Hostel</h1>
                        <p style={{ color: '#6b7298', fontSize: 14 }}>Reach students & professionals looking for accommodation</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Section title="📋 Basic Info">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <Field label="PG / Hostel Name" required>
                                <input required className="input" placeholder="e.g. Green Valley Boys PG" value={form.name} onChange={e => set('name', e.target.value)} />
                            </Field>
                            <Field label="Description" required>
                                <textarea required className="input" placeholder="Describe your PG..." value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical', minHeight: 90 }} />
                            </Field>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <Field label="Type">
                                    <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
                                        <option value="pg">PG</option>
                                        <option value="hostel">Hostel</option>
                                        <option value="coliving">Co-Living</option>
                                    </select>
                                </Field>
                                <Field label="Gender Type" required>
                                    <select className="input" value={form.genderType} onChange={e => set('genderType', e.target.value)}>
                                        <option value="male">Boys Only</option>
                                        <option value="female">Girls Only</option>
                                        <option value="unisex">Unisex</option>
                                    </select>
                                </Field>
                            </div>
                        </div>
                    </Section>

                    <Section title="💰 Rent & Capacity">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <Field label="Rent per Month (₹)" required>
                                <input required type="number" className="input" placeholder="8500" value={form.rentPerMonth} onChange={e => set('rentPerMonth', e.target.value)} />
                            </Field>
                            <Field label="Security Deposit (₹)">
                                <input type="number" className="input" placeholder="17000" value={form.securityDeposit} onChange={e => set('securityDeposit', e.target.value)} />
                            </Field>
                            <Field label="Total Rooms">
                                <input type="number" className="input" value={form.totalRooms} onChange={e => set('totalRooms', e.target.value)} min={1} />
                            </Field>
                            <Field label="Available Rooms">
                                <input type="number" className="input" value={form.availableRooms} onChange={e => set('availableRooms', e.target.value)} min={0} />
                            </Field>
                        </div>
                        <Field label="Sharing Types">
                            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                {['single', 'double', 'triple', 'quad'].map(s => (
                                    <button key={s} type="button" onClick={() => toggleSharing(s)}
                                        style={{ padding: '8px 16px', borderRadius: 20, border: `1px solid ${form.sharingType.includes(s) ? 'rgba(108,99,255,0.6)' : 'rgba(255,255,255,0.1)'}`, background: form.sharingType.includes(s) ? 'rgba(108,99,255,0.2)' : 'transparent', color: form.sharingType.includes(s) ? '#6c63ff' : '#b0b7d3', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', textTransform: 'capitalize', transition: 'all 0.2s' }}>
                                        {form.sharingType.includes(s) ? '✓ ' : ''}{s}
                                    </button>
                                ))}
                            </div>
                        </Field>
                    </Section>

                    <Section title="📍 Location">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <Field label="Full Address" required>
                                <input required className="input" placeholder="e.g. 45, Aundh, Pune" value={form.location.address} onChange={e => setLoc('address', e.target.value)} />
                            </Field>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <Field label="City">
                                    <input className="input" value={form.location.city} onChange={e => setLoc('city', e.target.value)} />
                                </Field>
                                <Field label="Pincode">
                                    <input className="input" placeholder="411007" value={form.location.pincode} onChange={e => setLoc('pincode', e.target.value)} />
                                </Field>
                            </div>
                            <Field label="Nearby Institutions (for AI matching)">
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <input className="input" placeholder="e.g. SPPU University" value={institutionInput} onChange={e => setInstitution(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addInstitution(); } }} />
                                    <button type="button" onClick={addInstitution} className="btn btn-secondary"><Plus size={16} /></button>
                                </div>
                                {form.location.nearbyInstitutions.length > 0 && (
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                                        {form.location.nearbyInstitutions.map((inst, i) => (
                                            <span key={i} className="amenity-chip" style={{ cursor: 'pointer' }} onClick={() => setLoc('nearbyInstitutions', form.location.nearbyInstitutions.filter((_, idx) => idx !== i))}>
                                                🏛️ {inst} <X size={12} />
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </Field>
                        </div>
                    </Section>

                    <Section title="✨ Amenities">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                            {Object.entries(form.amenities).map(([key, val]) => (
                                <Toggle key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())} checked={val} onChange={v => setAm(key, v)} />
                            ))}
                        </div>
                    </Section>

                    <Section title="🍽️ Meals">
                        <div style={{ display: 'flex', gap: 16 }}>
                            {Object.entries(form.meals).map(([key, val]) => (
                                <Toggle key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} checked={val} onChange={v => setMeal(key, v)} />
                            ))}
                        </div>
                    </Section>

                    <Section title="📜 House Rules">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            <Field label="Curfew Time (leave blank if none)">
                                <input className="input" placeholder="e.g. 10:00 PM" value={form.rules.curfewTime} onChange={e => setRule('curfewTime', e.target.value)} />
                            </Field>
                            <div style={{ marginTop: 16 }}>
                                <Toggle label="Guests Allowed" checked={form.rules.guestsAllowed} onChange={v => setRule('guestsAllowed', v)} />
                                <Toggle label="Smoking Allowed" checked={form.rules.smokingAllowed} onChange={v => setRule('smokingAllowed', v)} />
                                <Toggle label="Pets Allowed" checked={form.rules.petsAllowed} onChange={v => setRule('petsAllowed', v)} />
                            </div>
                        </div>
                    </Section>

                    <Section title="🖼️ Images (Optional)">
                        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                            <input className="input" placeholder="Paste image URL..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                            <button type="button" onClick={addImage} className="btn btn-secondary"><Plus size={16} /></button>
                        </div>
                        {form.images.length > 0 && (
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {form.images.map((img, i) => (
                                    <div key={i} style={{ position: 'relative' }}>
                                        <img src={img} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=80'; }} />
                                        <button type="button" onClick={() => setForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                                            style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                            <X size={12} color="white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Section>

                    <div style={{ display: 'flex', gap: 14 }}>
                        <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2, padding: '14px', fontSize: 16, borderRadius: 12 }}>
                            {loading ? 'Listing...' : '🚀 List PG / Hostel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
