import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Users, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer, staggerItem } from '../utils/animations';

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

const Toggle = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between py-3 border-b border-borderSubtle/10">
        <span className="text-primary text-sm font-medium">{label}</span>
        <button type="button" onClick={() => onChange(!checked)}
            className={`w-11 h-6 rounded-full relative transition-colors ${checked ? 'bg-primary' : 'bg-surface border border-borderSubtle/30'}`}>
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${checked ? 'left-6 shadow-sm' : 'left-1'}`} />
        </button>
    </div>
);

export default function ListPG() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [institutionInput, setInstitution] = useState('');

    const [form, setForm] = useState({
        name: '', description: '', type: 'pg', genderType: 'male',
        rentPerMonth: '', securityDeposit: '', sharingType: [],
        location: { address: '', city: '', state: '', pincode: '', nearbyInstitutions: [] },
        amenities: { wifi: false, food: false, ac: false, laundry: false, parking: false, housekeeping: false, gym: false, studyRoom: false, cctv: false, powerBackup: false, hotWater: true, refrigerator: false, tv: false },
        meals: { breakfast: false, lunch: false, dinner: false },
        rules: { curfewTime: '', guestsAllowed: false, smokingAllowed: false, petsAllowed: false },
        walkabilityScore: 0, connectivityScore: 0, futureDevelopment: '',
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

    return (
        <div className="light-page min-h-screen pt-6 pb-20 font-sans">
            <div className="max-w-3xl mx-auto px-6 lg:px-8">
                <motion.div variants={fadeIn} initial="initial" animate="animate" className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-primary mb-1">List a PG / Hostel</h1>
                        <p className="text-muted text-sm">Reach students & professionals looking for accommodation</p>
                    </div>
                </motion.div>

                <motion.form variants={staggerContainer} initial="initial" animate="animate" onSubmit={handleSubmit}>
                    <Section title="📋 Basic Info">
                        <div className="flex flex-col gap-5">
                            <Field label="PG / Hostel Name" required>
                                <input required className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" placeholder="e.g. Green Valley Boys PG" value={form.name} onChange={e => set('name', e.target.value)} />
                            </Field>
                            <Field label="Description" required>
                                <textarea required className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary min-h-[90px] resize-y" placeholder="Describe your PG..." value={form.description} onChange={e => set('description', e.target.value)} />
                            </Field>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="Type">
                                    <select className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" value={form.type} onChange={e => set('type', e.target.value)}>
                                        <option value="pg">PG</option>
                                        <option value="hostel">Hostel</option>
                                        <option value="coliving">Co-Living</option>
                                    </select>
                                </Field>
                                <Field label="Gender Type" required>
                                    <select className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" value={form.genderType} onChange={e => set('genderType', e.target.value)}>
                                        <option value="male">Boys Only</option>
                                        <option value="female">Girls Only</option>
                                        <option value="unisex">Unisex</option>
                                    </select>
                                </Field>
                            </div>
                        </div>
                    </Section>

                    <Section title="💰 Rent & Capacity">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            <Field label="Rent per Month (₹)" required>
                                <input required type="number" className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" placeholder="8500" value={form.rentPerMonth} onChange={e => set('rentPerMonth', e.target.value)} />
                            </Field>
                            <Field label="Security Deposit (₹)">
                                <input type="number" className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" placeholder="17000" value={form.securityDeposit} onChange={e => set('securityDeposit', e.target.value)} />
                            </Field>
                            <Field label="Total Rooms">
                                <input type="number" className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" value={form.totalRooms} onChange={e => set('totalRooms', e.target.value)} min={1} />
                            </Field>
                            <Field label="Available Rooms">
                                <input type="number" className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" value={form.availableRooms} onChange={e => set('availableRooms', e.target.value)} min={0} />
                            </Field>
                        </div>
                        <Field label="Sharing Types">
                            <div className="flex flex-wrap gap-2.5 mt-2">
                                {['single', 'double', 'triple', 'quad'].map(s => (
                                    <button key={s} type="button" onClick={() => toggleSharing(s)}
                                        className={`px-4 py-2 rounded-full border text-sm capitalize transition-all ${form.sharingType.includes(s) ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-borderSubtle/30 text-muted hover:border-primary/50'}`}>
                                        {form.sharingType.includes(s) ? '✓ ' : ''}{s}
                                    </button>
                                ))}
                            </div>
                        </Field>
                    </Section>

                    <Section title="📍 Location">
                        <div className="flex flex-col gap-5">
                            <Field label="Full Address" required>
                                <input required className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" placeholder="e.g. 45, Andheri West, Mumbai" value={form.location.address} onChange={e => setLoc('address', e.target.value)} />
                            </Field>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="City">
                                    <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" value={form.location.city} onChange={e => setLoc('city', e.target.value)} />
                                </Field>
                                <Field label="Pincode">
                                    <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" placeholder="411007" value={form.location.pincode} onChange={e => setLoc('pincode', e.target.value)} />
                                </Field>
                            </div>
                            <Field label="Nearby Institutions (for AI matching)">
                                <div className="flex gap-3">
                                    <input className="flex-1 bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" placeholder="e.g. SPPU University" value={institutionInput} onChange={e => setInstitution(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addInstitution(); } }} />
                                    <button type="button" onClick={addInstitution} className="btn btn-secondary bg-surface border border-borderSubtle/30"><Plus className="w-4 h-4" /></button>
                                </div>
                                {form.location.nearbyInstitutions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {form.location.nearbyInstitutions.map((inst, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-surface border border-borderSubtle/20 rounded-full text-xs text-primary flex items-center gap-1.5 cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200" onClick={() => setLoc('nearbyInstitutions', form.location.nearbyInstitutions.filter((_, idx) => idx !== i))}>
                                                🏛️ {inst} <X className="w-3 h-3" />
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </Field>
                        </div>
                    </Section>

                    <Section title="🧠 Location Intelligence (Optional)">
                        <div className="flex flex-col gap-5">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                            {Object.entries(form.amenities).map(([key, val]) => (
                                <Toggle key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())} checked={val} onChange={v => setAm(key, v)} />
                            ))}
                        </div>
                    </Section>

                    <Section title="🍽️ Meals Included">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-1">
                            {Object.entries(form.meals).map(([key, val]) => (
                                <Toggle key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} checked={val} onChange={v => setMeal(key, v)} />
                            ))}
                        </div>
                    </Section>

                    <Section title="📜 PG Rules">
                        <div className="flex flex-col gap-5">
                            <Field label="Curfew Time">
                                <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" placeholder="e.g. 10:30 PM (Leave blank if no curfew)" value={form.rules.curfewTime} onChange={e => setRule('curfewTime', e.target.value)} />
                            </Field>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-1 mt-2">
                                <Toggle label="Guests Allowed" checked={form.rules.guestsAllowed} onChange={v => setRule('guestsAllowed', v)} />
                                <Toggle label="Smoking Allowed" checked={form.rules.smokingAllowed} onChange={v => setRule('smokingAllowed', v)} />
                                <Toggle label="Pets Allowed" checked={form.rules.petsAllowed} onChange={v => setRule('petsAllowed', v)} />
                            </div>
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
                                        <img src={img} alt="" className="w-20 h-16 object-cover rounded-lg" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=80'; }} />
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
                            {loading ? 'Listing...' : '🚀 List PG'}
                        </button>
                    </motion.div>
                </motion.form>
            </div>
        </div>
    );
}
