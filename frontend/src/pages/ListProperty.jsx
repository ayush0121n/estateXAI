/* eslint-disable */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Building2, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer, staggerItem } from '../utils/animations';

const amenityOptions = ['parking', 'gym', 'pool', 'security', 'elevator', 'power_backup', 'garden', 'clubhouse', 'wifi', 'ac'];

const Section = ({ title, children }) => (
    <motion.div variants={staggerItem} className="bg-elevated border border-borderSubtle/20 rounded-card p-6 md:p-8 mb-6 shadow-sm">
        <h3 className="text-primary font-bold text-lg mb-6 pb-3 border-b border-borderSubtle/10">{title}</h3>
        {children}
    </motion.div>
);

const Field = ({ label, required, children }) => (
    <div>
        <label className="block text-sm font-semibold text-primary mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
        {children}
    </div>
);

export default function ListProperty() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', type: 'apartment', listingType: 'rent',
        price: '', area: '', bhk: 1, bathrooms: 1, furnishing: 'unfurnished',
        facing: 'east', floor: 1, totalFloors: 1, yearBuilt: '',
        location: { address: '', city: '', state: '', pincode: '' },
        walkabilityScore: 0, connectivityScore: 0, futureDevelopment: '',
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

    return (
        <div className="light-page min-h-screen pt-6 pb-20 font-sans">
            <div className="max-w-3xl mx-auto px-6 lg:px-8">
                <motion.div variants={fadeIn} initial="initial" animate="animate" className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-primary mb-1">List a Property</h1>
                        <p className="text-muted text-sm">Fill in the details to list your property</p>
                    </div>
                </motion.div>

                <motion.form variants={staggerContainer} initial="initial" animate="animate" onSubmit={handleSubmit}>
                    <Section title="📋 Basic Information">
                        <div className="flex flex-col gap-5">
                            <Field label="Property Title" required>
                                <input required className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" placeholder="e.g. 3BHK Luxury Apartment in Kothrud" value={form.title} onChange={e => set('title', e.target.value)} />
                            </Field>
                            <Field label="Description" required>
                                <textarea required className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary min-h-[100px] resize-y" placeholder="Describe the property..." value={form.description} onChange={e => set('description', e.target.value)} />
                            </Field>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="Property Type" required>
                                    <select className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" value={form.type} onChange={e => set('type', e.target.value)}>
                                        {['apartment', 'villa', 'studio', 'house', 'plot', 'commercial'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                    </select>
                                </Field>
                                <Field label="Listing For" required>
                                    <select className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" value={form.listingType} onChange={e => set('listingType', e.target.value)}>
                                        <option value="rent">For Rent</option>
                                        <option value="sale">For Sale</option>
                                    </select>
                                </Field>
                            </div>
                        </div>
                    </Section>

                    <Section title="💰 Pricing & Size">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            <Field label={`Price (₹) ${form.listingType === 'rent' ? 'per month' : ''}`} required>
                                <input required type="number" className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" placeholder="e.g. 25000" value={form.price} onChange={e => set('price', e.target.value)} />
                            </Field>
                            <Field label="Area (sq ft)" required>
                                <input required type="number" className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" placeholder="e.g. 1000" value={form.area} onChange={e => set('area', e.target.value)} />
                            </Field>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
                            <Field label="BHK">
                                <select className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" value={form.bhk} onChange={e => set('bhk', e.target.value)}>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} BHK</option>)}
                                </select>
                            </Field>
                            <Field label="Bathrooms">
                                <select className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)}>
                                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </Field>
                            <Field label="Floor No.">
                                <input type="number" className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" value={form.floor} onChange={e => set('floor', e.target.value)} min={0} />
                            </Field>
                            <Field label="Total Floors">
                                <input type="number" className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" value={form.totalFloors} onChange={e => set('totalFloors', e.target.value)} min={1} />
                            </Field>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field label="Furnishing">
                                <select className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" value={form.furnishing} onChange={e => set('furnishing', e.target.value)}>
                                    {['unfurnished', 'semi-furnished', 'fully-furnished'].map(f => <option key={f} value={f}>{f.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}</option>)}
                                </select>
                            </Field>
                            <Field label="Facing">
                                <select className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" value={form.facing} onChange={e => set('facing', e.target.value)}>
                                    {['north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west'].map(f => <option key={f} value={f}>{f.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                                </select>
                            </Field>
                        </div>
                    </Section>

                    <Section title="📍 Location">
                        <div className="flex flex-col gap-5">
                            <Field label="Full Address" required>
                                <input required className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" placeholder="e.g. 123, ABC Society, Kothrud" value={form.location.address} onChange={e => setLoc('address', e.target.value)} />
                            </Field>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="City">
                                    <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" value={form.location.city} onChange={e => setLoc('city', e.target.value)} />
                                </Field>
                                <Field label="Pincode">
                                    <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" placeholder="411038" value={form.location.pincode} onChange={e => setLoc('pincode', e.target.value)} />
                                </Field>
                            </div>
                        </div>
                    </Section>

                    <Section title="🧠 Location Intelligence (Optional)">
                        <div className="flex flex-col gap-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="Latitude (Map Coordinates)">
                                    <input type="number" step="any" className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" placeholder="e.g. 18.5204" value={form.location.coordinates?.lat || ''} onChange={e => setForm(p => ({...p, location: {...p.location, coordinates: {...p.location.coordinates, lat: Number(e.target.value)}}}))} />
                                </Field>
                                <Field label="Longitude (Map Coordinates)">
                                    <input type="number" step="any" className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" placeholder="e.g. 73.8567" value={form.location.coordinates?.lng || ''} onChange={e => setForm(p => ({...p, location: {...p.location, coordinates: {...p.location.coordinates, lng: Number(e.target.value)}}}))} />
                                </Field>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="Walkability Score (0-100)">
                                    <input type="number" className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" value={form.walkabilityScore} onChange={e => set('walkabilityScore', Number(e.target.value))} min={0} max={100} />
                                </Field>
                                <Field label="Connectivity Score (0-100)">
                                    <input type="number" className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" value={form.connectivityScore} onChange={e => set('connectivityScore', Number(e.target.value))} min={0} max={100} />
                                </Field>
                            </div>
                            <Field label="Future Development Notes">
                                <textarea className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary min-h-[60px] resize-y" placeholder="e.g. Upcoming metro station in 500m..." value={form.futureDevelopment} onChange={e => set('futureDevelopment', e.target.value)} />
                            </Field>
                        </div>
                    </Section>

                    <Section title="✨ Amenities">
                        <div className="flex flex-wrap gap-2.5">
                            {amenityOptions.map(a => (
                                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                                    className={`px-4 py-2 rounded-full border text-sm capitalize transition-all ${form.amenities.includes(a) ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-borderSubtle/30 text-muted hover:border-primary/50'}`}>
                                    {form.amenities.includes(a) ? '✓ ' : ''}{a.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </Section>

                    <Section title="🖼️ Images (Optional)">
                        <div className="flex gap-3 mb-4">
                            <input className="flex-1 bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" placeholder="Paste image URL..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                            <button type="button" onClick={addImage} className="btn btn-secondary bg-surface border border-borderSubtle/30 whitespace-nowrap"><Plus className="w-4 h-4" /> Add</button>
                        </div>
                        {form.images.length > 0 && (
                            <div className="flex gap-3 flex-wrap">
                                {form.images.map((img, i) => (
                                    <div key={i} className="relative">
                                        <img src={img} alt="" className="w-20 h-16 object-cover rounded-lg" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80'; }} />
                                        <button type="button" onClick={() => setForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Section>

                    <motion.div variants={staggerItem} className="flex gap-4">
                        <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary bg-surface flex-1">Cancel</button>
                        <button type="submit" disabled={loading} className="btn btn-primary flex-[2] py-3 text-base shadow-md hover:shadow-lg">
                            {loading ? 'Listing...' : '🚀 List Property'}
                        </button>
                    </motion.div>
                </motion.form>
            </div>
        </div>
    );
}
