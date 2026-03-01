import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Building2, Plus, X } from 'lucide-react';

const amenityOptions = ['parking', 'gym', 'pool', 'security', 'elevator', 'power_backup', 'garden', 'clubhouse', 'wifi', 'ac'];

export default function ListProperty() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', type: 'apartment', listingType: 'rent',
        price: '', area: '', bhk: 1, bathrooms: 1, furnishing: 'unfurnished',
        facing: 'east', floor: 1, totalFloors: 1, yearBuilt: '',
        location: { address: '', city: 'Pune', state: 'Maharashtra', pincode: '' },
        amenities: [],
        images: []
    });
    const [imageUrl, setImageUrl] = useState('');

    const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
    const setLoc = (key, val) => setForm(p => ({ ...p, location: { ...p.location, [key]: val } }));

    const toggleAmenity = (a) => {
        setForm(p => ({
            ...p,
            amenities: p.amenities.includes(a) ? p.amenities.filter(x => x !== a) : [...p.amenities, a]
        }));
    };

    const addImage = () => {
        if (imageUrl.trim()) {
            setForm(p => ({ ...p, images: [...p.images, imageUrl.trim()] }));
            setImageUrl('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.price || !form.area || !form.location.address) {
            toast.error('Please fill all required fields');
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post('/properties', {
                ...form,
                price: Number(form.price),
                area: Number(form.area),
                bhk: Number(form.bhk),
                bathrooms: Number(form.bathrooms),
                floor: Number(form.floor),
                totalFloors: Number(form.totalFloors)
            });
            toast.success('Property listed successfully! 🎉');
            navigate(`/properties/${data.property._id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to list property');
        } finally {
            setLoading(false);
        }
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

    const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 };

    return (
        <div style={{ paddingTop: 90, minHeight: '100vh' }}>
            <div className="container" style={{ paddingTop: 24, paddingBottom: 60, maxWidth: 800 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                    <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #6c63ff, #43e5f7)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building2 size={22} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 800, color: 'white' }}>List a Property</h1>
                        <p style={{ color: '#6b7298', fontSize: 14 }}>Fill in the details to list your property</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Section title="📋 Basic Information">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <Field label="Property Title" required>
                                <input required className="input" placeholder="e.g. 3BHK Luxury Apartment in Kothrud" value={form.title} onChange={e => set('title', e.target.value)} />
                            </Field>
                            <Field label="Description" required>
                                <textarea required className="input" placeholder="Describe the property..." value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical', minHeight: 100 }} />
                            </Field>
                            <div style={grid2}>
                                <Field label="Property Type" required>
                                    <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
                                        {['apartment', 'villa', 'studio', 'house', 'plot', 'commercial'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                    </select>
                                </Field>
                                <Field label="Listing For" required>
                                    <select className="input" value={form.listingType} onChange={e => set('listingType', e.target.value)}>
                                        <option value="rent">For Rent</option>
                                        <option value="sale">For Sale</option>
                                    </select>
                                </Field>
                            </div>
                        </div>
                    </Section>

                    <Section title="💰 Pricing & Size">
                        <div style={{ ...grid2, marginBottom: 16 }}>
                            <Field label={`Price (₹) ${form.listingType === 'rent' ? 'per month' : ''}`} required>
                                <input required type="number" className="input" placeholder="e.g. 25000" value={form.price} onChange={e => set('price', e.target.value)} />
                            </Field>
                            <Field label="Area (sq ft)" required>
                                <input required type="number" className="input" placeholder="e.g. 1000" value={form.area} onChange={e => set('area', e.target.value)} />
                            </Field>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                            <Field label="BHK">
                                <select className="input" value={form.bhk} onChange={e => set('bhk', e.target.value)}>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} BHK</option>)}
                                </select>
                            </Field>
                            <Field label="Bathrooms">
                                <select className="input" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)}>
                                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </Field>
                            <Field label="Floor No.">
                                <input type="number" className="input" value={form.floor} onChange={e => set('floor', e.target.value)} min={0} />
                            </Field>
                            <Field label="Total Floors">
                                <input type="number" className="input" value={form.totalFloors} onChange={e => set('totalFloors', e.target.value)} min={1} />
                            </Field>
                        </div>
                        <div style={{ ...grid2, marginTop: 16 }}>
                            <Field label="Furnishing">
                                <select className="input" value={form.furnishing} onChange={e => set('furnishing', e.target.value)}>
                                    {['unfurnished', 'semi-furnished', 'fully-furnished'].map(f => <option key={f} value={f}>{f.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}</option>)}
                                </select>
                            </Field>
                            <Field label="Facing">
                                <select className="input" value={form.facing} onChange={e => set('facing', e.target.value)}>
                                    {['north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west'].map(f => <option key={f} value={f}>{f.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                                </select>
                            </Field>
                        </div>
                    </Section>

                    <Section title="📍 Location">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <Field label="Full Address" required>
                                <input required className="input" placeholder="e.g. 123, ABC Society, Kothrud" value={form.location.address} onChange={e => setLoc('address', e.target.value)} />
                            </Field>
                            <div style={grid2}>
                                <Field label="City">
                                    <input className="input" value={form.location.city} onChange={e => setLoc('city', e.target.value)} />
                                </Field>
                                <Field label="Pincode">
                                    <input className="input" placeholder="411038" value={form.location.pincode} onChange={e => setLoc('pincode', e.target.value)} />
                                </Field>
                            </div>
                        </div>
                    </Section>

                    <Section title="✨ Amenities">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                            {amenityOptions.map(a => (
                                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                                    style={{ padding: '8px 16px', borderRadius: 20, border: `1px solid ${form.amenities.includes(a) ? 'rgba(108,99,255,0.6)' : 'rgba(255,255,255,0.1)'}`, background: form.amenities.includes(a) ? 'rgba(108,99,255,0.2)' : 'transparent', color: form.amenities.includes(a) ? '#6c63ff' : '#b0b7d3', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', textTransform: 'capitalize', transition: 'all 0.2s' }}>
                                    {form.amenities.includes(a) ? '✓ ' : ''}{a.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </Section>

                    <Section title="🖼️ Images (Optional)">
                        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                            <input className="input" placeholder="Paste image URL..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                            <button type="button" onClick={addImage} className="btn btn-secondary"><Plus size={16} /> Add</button>
                        </div>
                        {form.images.length > 0 && (
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {form.images.map((img, i) => (
                                    <div key={i} style={{ position: 'relative' }}>
                                        <img src={img} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80'; }} />
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
                            {loading ? 'Listing...' : '🚀 List Property'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
