/* eslint-disable */
import { useState, useEffect } from 'react';
import { Users, Heart, MapPin, ChevronRight, Sliders, MessageCircle, ShieldCheck, Filter, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, staggerContainer, staggerItem } from '../utils/animations';

const CITIES = ['Bangalore', 'Pune', 'Hyderabad', 'Mumbai', 'Delhi NCR', 'Chennai', 'Kolkata', 'Ahmedabad'];

const FIELDS = {
    diet: { label: 'Diet', options: [{ v: 'veg', l: '🥦 Vegetarian' }, { v: 'non-veg', l: '🍗 Non-Veg' }, { v: 'vegan', l: '🌱 Vegan' }, { v: 'any', l: '🤷 Any' }] },
    smoking: { label: 'Smoking', options: [{ v: 'no', l: '🚭 Non-Smoker' }, { v: 'outside-only', l: '🚪 Outside Only' }, { v: 'yes', l: '🚬 Smoker' }] },
    sleepSchedule: { label: 'Sleep', options: [{ v: 'early-bird', l: '🌅 Early Bird' }, { v: 'night-owl', l: '🦉 Night Owl' }, { v: 'flexible', l: '😴 Flexible' }] },
    profession: { label: 'Profession', options: [{ v: 'student', l: '📚 Student' }, { v: 'working-professional', l: '💼 Working' }, { v: 'any', l: '🤷 Any' }] },
    gender: { label: 'Preferred Flatmate', options: [{ v: 'male', l: '👨 Male' }, { v: 'female', l: '👩 Female' }, { v: 'any', l: '🤝 Any' }] },
    timeline: { label: 'Move-In Timeline', options: [{ v: 'immediate', l: '⚡ Immediate' }, { v: '15-days', l: '⏳ 15 Days' }, { v: 'next-month', l: '📅 Next Month' }, { v: 'flexible', l: '🧘 Flexible' }] },
    cleanliness: { label: 'Cleanliness', options: [{ v: 'super-clean', l: '✨ Super Clean' }, { v: 'moderate', l: '🧹 Moderate' }, { v: 'relaxed', l: '🛋️ Relaxed' }] },
    cooking: { label: 'Cooking Habits', options: [{ v: 'daily', l: '🍳 Daily' }, { v: 'occasional', l: '🍲 Occasional' }, { v: 'outside-food', l: '🥡 Outside Food' }] },
    pets: { label: 'Pet Policy', options: [{ v: 'has-pets', l: '🐶 Has Pets' }, { v: 'open-to-pets', l: '🐱 Open to Pets' }, { v: 'no-pets', l: '🚫 No Pets' }] },
    guestsPolicy: { label: 'Guests Policy', options: [{ v: 'no-guests', l: '🚫 No Guests' }, { v: 'occasional', l: '🤝 Occasional' }, { v: 'frequent', l: '🎉 Frequent' }, { v: 'flexible', l: '🧘 Flexible' }] },
    wfhPreference: { label: 'Work Style', options: [{ v: 'full-wfh', l: '🏠 Full WFH' }, { v: 'hybrid', l: '🔄 Hybrid' }, { v: 'office', l: '🏢 Office' }, { v: 'any', l: '🤷 Any' }] },
    noiseTolerance: { label: 'Noise Level', options: [{ v: 'silent', l: '🤫 Silent' }, { v: 'moderate', l: '🔊 Moderate' }, { v: 'lively', l: '🎵 Lively' }] }
};

function CompatibilityRing({ score }) {
    const color = score >= 80 ? '#22c55e' : score >= 60 ? 'var(--primary)' : score >= 40 ? '#f59e0b' : '#ef4444';
    const label = score >= 80 ? 'Great Match' : score >= 60 ? 'Good Match' : score >= 40 ? 'Fair Match' : 'Low Match';
    const strokeColor = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-primary' : score >= 40 ? 'text-amber-500' : 'text-red-500';
    
    return (
        <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-1">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" className="stroke-borderSubtle/20" strokeWidth="6" />
                    <circle cx="32" cy="32" r="26" fill="none" className={strokeColor} strokeWidth="6"
                        strokeDasharray={`${(score / 100) * 163} 163`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.8s ease' }}
                    />
                </svg>
                <div className={`absolute inset-0 flex items-center justify-center text-sm font-extrabold ${strokeColor}`}>
                    {score}%
                </div>
            </div>
            <div className={`text-[11px] font-bold ${strokeColor}`}>{label}</div>
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
        city: profile?.city || '',
        budgetMin: profile?.budgetMin || 5000,
        budgetMax: profile?.budgetMax || 15000,
        bio: profile?.bio || '',
        age: profile?.age || '',
        timeline: profile?.timeline || 'flexible',
        cleanliness: profile?.cleanliness || 'moderate',
        cooking: profile?.cooking || 'occasional',
        pets: profile?.pets || 'open-to-pets',
        contactNumber: profile?.contactNumber || '',
        guestsPolicy: profile?.guestsPolicy || 'flexible',
        wfhPreference: profile?.wfhPreference || 'any',
        noiseTolerance: profile?.noiseTolerance || 'moderate'
    });

    return (
        <motion.div variants={fadeIn} initial="initial" animate="animate" className="bg-elevated border border-borderSubtle/20 rounded-[2rem] p-8 md:p-12 shadow-xl shadow-black/5">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Sliders className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-primary font-bold text-2xl m-0">My Roommate Profile</h2>
            </div>

            {/* Toggle */}
            <div className={`flex items-center gap-5 p-5 mb-8 rounded-2xl border transition-colors ${form.isLookingForRoommate ? 'bg-primary/5 border-primary/30' : 'bg-surface border-borderSubtle/20'}`}>
                <button onClick={() => setForm(p => ({ ...p, isLookingForRoommate: !p.isLookingForRoommate }))} className={`relative w-14 h-8 rounded-full transition-colors ${form.isLookingForRoommate ? 'bg-primary' : 'bg-borderSubtle/30'}`}>
                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-sm ${form.isLookingForRoommate ? 'left-7' : 'left-1'}`} />
                </button>
                <div>
                    <div className="text-primary font-bold text-base mb-1">Looking for a Roommate</div>
                    <div className="text-muted text-sm">{form.isLookingForRoommate ? 'You are visible in the matching pool and can find flatmates.' : 'Enable this to start finding your perfect flatmate.'}</div>
                </div>
            </div>

            {/* City selector */}
            <div className="mb-8">
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-3">City</label>
                <div className="flex flex-wrap gap-2.5">
                    {CITIES.map(c => (
                        <button key={c} onClick={() => setForm(p => ({ ...p, city: c }))} 
                            className={`px-4 py-2 rounded-xl text-sm transition-all border ${form.city === c ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-surface border-borderSubtle/30 text-muted hover:border-borderSubtle/60'}`}>
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {Object.entries(FIELDS).map(([key, { label, options }]) => (
                    <div key={key}>
                        <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-3">{label}</label>
                        <div className="flex flex-wrap gap-2.5">
                            {options.map(({ v, l }) => (
                                <button key={v} onClick={() => setForm(p => ({ ...p, [key]: v }))} 
                                    className={`px-4 py-2 rounded-xl text-sm transition-all border ${form[key] === v ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-surface border-borderSubtle/30 text-muted hover:border-borderSubtle/60'}`}>
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="h-px bg-borderSubtle/20 my-10" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div>
                    <label className="block text-sm font-bold text-primary mb-2">Age</label>
                    <input type="number" placeholder="25" value={form.age} onChange={e => setForm(p => ({ ...p, age: Number(e.target.value) }))} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-primary mb-2">Budget Min (₹)</label>
                    <input type="number" value={form.budgetMin} onChange={e => setForm(p => ({ ...p, budgetMin: Number(e.target.value) }))} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-primary mb-2">Budget Max (₹)</label>
                    <input type="number" value={form.budgetMax} onChange={e => setForm(p => ({ ...p, budgetMax: Number(e.target.value) }))} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="block text-sm font-bold text-primary mb-2">Preferred Area</label>
                    <input value={form.preferredArea} onChange={e => setForm(p => ({ ...p, preferredArea: e.target.value }))} placeholder="Hinjewadi, Baner..." className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-primary mb-2">Contact Number (WhatsApp)</label>
                    <input type="tel" value={form.contactNumber} onChange={e => setForm(p => ({ ...p, contactNumber: e.target.value }))} placeholder="+91 9876543210" className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" />
                </div>
            </div>

            <div className="mb-10">
                <label className="block text-sm font-bold text-primary mb-2">Bio (max 300 chars)</label>
                <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value.slice(0, 300) }))} rows={3} placeholder="Tell potential flatmates about yourself..." className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors resize-y" />
                <div className="text-right text-xs text-muted mt-2 font-medium">{form.bio.length}/300</div>
            </div>

            <button onClick={() => onSave(form)} className="btn btn-primary w-full py-4 text-base font-bold rounded-xl shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2">
                Save Profile & Find Matches <ChevronRight className="w-5 h-5" />
            </button>
        </motion.div>
    );
}

export default function Roommates() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [myProfile, setMyProfile] = useState(null);
    const [matches, setMatches] = useState([]);
    const [filteredMatches, setFilteredMatches] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [showSetup, setShowSetup] = useState(false);
    const [profileLoaded, setProfileLoaded] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ diet: '', gender: '', city: '', verifiedOnly: false });
    const [connectedUsers, setConnectedUsers] = useState(() => {
        try { return JSON.parse(localStorage.getItem('flatmate_connects') || '[]'); } catch { return []; }
    });

    useEffect(() => {
        document.title = 'Find Flatmates | EstateXAi';
        if (!user) return;
        api.get(`/user/profile`)
            .then(({ data }) => {
                setMyProfile(data.user?.roommateProfile);
                setProfileLoaded(true);
                if (data.user?.roommateProfile?.isLookingForRoommate) fetchMatches();
            })
            .catch(() => setProfileLoaded(true));
    }, [user]);

    useEffect(() => {
        let result = matches;
        if (filters.diet) result = result.filter(m => m.user.roommateProfile?.diet === filters.diet || m.user.roommateProfile?.diet === 'any');
        if (filters.gender) result = result.filter(m => m.user.roommateProfile?.gender === filters.gender || m.user.roommateProfile?.gender === 'any');
        if (filters.city) result = result.filter(m => m.user.roommateProfile?.city?.toLowerCase().includes(filters.city.toLowerCase()));
        if (filters.verifiedOnly) result = result.filter(m => m.user.isPhoneVerified);
        setFilteredMatches(result);
    }, [matches, filters]);

    const fetchMatches = async () => {
        setLoadingMatches(true);
        try {
            const endpoint = user ? `/user/roommates/match` : `/user/roommates/public`;
            const { data } = await api.get(endpoint);
            setMatches(data.matches || []);
            setFilteredMatches(data.matches || []);
        } catch (err) {
            if (user) toast.error(err.response?.data?.message || 'Could not fetch matches.');
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
        if (!user) {
            toast.error("Please login to connect with flatmates!");
            return;
        }
        const isConnected = connectedUsers.includes(match.user?._id || match._id);
        if (!isConnected) {
            const newConnects = [...connectedUsers, match.user?._id || match._id];
            setConnectedUsers(newConnects);
            localStorage.setItem('flatmate_connects', JSON.stringify(newConnects));
            toast.success(`Connection request sent to ${match.name || match.user?.name}!`);
            return;
        }
        const contact = match.roommateProfile?.contactNumber || match.user?.roommateProfile?.contactNumber;
        if (!contact) {
            toast.error("This user hasn't provided a contact number.");
            return;
        }
        let phone = contact.replace(/\D/g, '');
        if (phone.length === 10) phone = `91${phone}`;
        const score = match.compatibilityScore || '';
        const message = `Hi ${match.name || match.user?.name}! I found your profile on EstateXAi${score ? ` and we have a ${score}% compatibility score` : ''}. Let's connect!`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="light-page min-h-screen pt-24 pb-20 font-sans">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Hero */}
                <motion.div variants={fadeIn} initial="initial" animate="animate" className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
                        <Heart className="w-4 h-4 text-primary" />
                        <span className="text-xs text-primary font-bold tracking-wider uppercase">Flatmate Finder</span>
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-4">
                        Find Your <span className="text-accent">Perfect</span> Flatmate
                    </h1>
                    <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed">
                        Our AI matches you based on lifestyle, diet, cleanliness, work style, and budget — say goodbye to random WhatsApp group searches.
                    </p>
                </motion.div>

                {(user && (!myProfile?.isLookingForRoommate || showSetup)) ? (
                    <div className="max-w-4xl mx-auto">
                        <ProfileForm profile={myProfile} onSave={handleSaveProfile} />
                    </div>
                ) : (
                    <div>
                        {!user && (
                            <motion.div variants={fadeIn} initial="initial" animate="animate" className="bg-primary/10 border border-primary/30 rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div>
                                    <h3 className="text-primary font-bold text-xl mb-2">Want to see your compatibility scores?</h3>
                                    <p className="text-muted text-sm font-medium">Log in and create your lifestyle profile to get AI-matched with the perfect flatmates.</p>
                                </div>
                                <div className="flex gap-4 w-full md:w-auto">
                                    <Link to="/login" className="btn btn-ghost py-2.5 px-6 flex-1 md:flex-none justify-center">Log In</Link>
                                    <Link to="/register" className="btn btn-primary py-2.5 px-6 flex-1 md:flex-none justify-center">Sign Up</Link>
                                </div>
                            </motion.div>
                        )}
                        
                        {/* Controls + Filter Bar */}
                        <div className="mb-10">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-elevated border border-borderSubtle/20 p-5 rounded-2xl shadow-sm mb-4">
                                <div className="text-primary font-medium">
                                    Found <strong className="text-accent text-2xl mx-2">{filteredMatches.length}</strong> compatible flatmates
                                    {filters.city && <span className="text-muted text-sm ml-2">in {filters.city}</span>}
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button onClick={() => setShowFilters(!showFilters)} className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors border ${showFilters ? 'bg-primary text-white border-primary' : 'bg-surface border-borderSubtle/30 text-primary hover:border-borderSubtle/60'}`}>
                                        <Filter className="w-4 h-4" /> Filters
                                    </button>
                                    <button onClick={() => setShowSetup(true)} className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold bg-surface border border-borderSubtle/30 text-primary hover:border-borderSubtle/60 transition-colors">
                                        Edit Profile
                                    </button>
                                </div>
                            </div>

                            {/* Filter panel */}
                            <AnimatePresence>
                                {showFilters && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                        <div className="flex flex-wrap gap-3 p-5 bg-surface border border-borderSubtle/20 rounded-2xl shadow-sm mb-4">
                                            <select value={filters.city} onChange={e => setFilters(p => ({ ...p, city: e.target.value }))} className="bg-elevated border border-borderSubtle/30 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary text-primary min-w-[140px] cursor-pointer">
                                                <option value="">All Cities</option>
                                                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            <select value={filters.diet} onChange={e => setFilters(p => ({ ...p, diet: e.target.value }))} className="bg-elevated border border-borderSubtle/30 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary text-primary min-w-[140px] cursor-pointer">
                                                <option value="">Any Diet</option>
                                                <option value="veg">Vegetarian</option>
                                                <option value="non-veg">Non-Veg</option>
                                                <option value="vegan">Vegan</option>
                                            </select>
                                            <select value={filters.gender} onChange={e => setFilters(p => ({ ...p, gender: e.target.value }))} className="bg-elevated border border-borderSubtle/30 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary text-primary min-w-[140px] cursor-pointer">
                                                <option value="">Any Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                            <button onClick={() => setFilters(p => ({ ...p, verifiedOnly: !p.verifiedOnly }))}
                                                className={`px-4 py-2.5 rounded-xl text-sm font-medium inline-flex items-center gap-2 border transition-colors ${filters.verifiedOnly ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' : 'bg-elevated border-borderSubtle/30 text-muted'}`}>
                                                <ShieldCheck className="w-4 h-4" /> Verified Only
                                            </button>
                                            {(filters.diet || filters.gender || filters.city || filters.verifiedOnly) && (
                                                <button onClick={() => setFilters({ diet: '', gender: '', city: '', verifiedOnly: false })}
                                                    className="px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors inline-flex items-center gap-2">
                                                    <X className="w-4 h-4" /> Clear All
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {loadingMatches ? (
                            <div className="text-center py-24 text-muted font-medium">
                                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                                Finding your best matches...
                            </div>
                        ) : filteredMatches.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-surface border border-dashed border-borderSubtle/40 rounded-3xl">
                                <Users className="w-16 h-16 text-borderSubtle mx-auto mb-5 opacity-60" />
                                <h3 className="text-primary font-bold text-2xl mb-3">No matches found</h3>
                                <p className="text-muted text-lg max-w-md mx-auto">
                                    {filters.city || filters.diet || filters.gender ? 'Try adjusting your filters to see more results.' : 'Check back later as more people join every day!'}
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                <AnimatePresence>
                                    {filteredMatches.map(({ user: m, compatibilityScore }, idx) => {
                                        const isConnected = connectedUsers.includes(m._id);
                                        return (
                                        <motion.div key={m._id} variants={staggerItem} className="bg-elevated border border-borderSubtle/20 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow relative flex flex-col group">
                                            
                                            {/* Top badges */}
                                            <div className="absolute top-5 right-5 flex flex-col items-end gap-2">
                                                {m.isPhoneVerified && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-200 shadow-sm">
                                                        <ShieldCheck className="w-3 h-3" /> Verified
                                                    </span>
                                                )}
                                                {m.trustScore > 0 && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 shadow-sm">
                                                        🏆 Trust: {m.trustScore}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Top Section */}
                                            <div className="flex gap-5 mb-6">
                                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center text-3xl font-bold text-primary shrink-0 border border-primary/20 overflow-hidden shadow-inner">
                                                    {m.avatar ? <img src={m.avatar} alt="" className="w-full h-full object-cover" /> : m.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 pt-1 min-w-0">
                                                    <div className="text-primary font-bold text-xl mb-1.5 truncate pr-20">{m.name}</div>
                                                    <div className="flex flex-wrap gap-y-1.5 gap-x-3 text-muted text-sm font-medium">
                                                        {m.roommateProfile?.age > 0 && <span>{m.roommateProfile.age} yrs</span>}
                                                        {m.roommateProfile?.city && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3.5 h-3.5 text-primary" /> {m.roommateProfile.city}
                                                            </span>
                                                        )}
                                                        {m.roommateProfile?.preferredArea && (
                                                            <span className="flex items-center gap-1 text-primary/80">
                                                                {m.roommateProfile.preferredArea}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Traits */}
                                            <div className="flex flex-wrap gap-2 mb-6 flex-1">
                                                {[
                                                    m.roommateProfile?.timeline && m.roommateProfile?.timeline !== 'flexible' && `📅 ${FIELDS.timeline.options.find(o=>o.v===m.roommateProfile.timeline)?.l.slice(3) || 'Timeline'}`,
                                                    m.roommateProfile?.cleanliness && m.roommateProfile?.cleanliness !== 'moderate' && `✨ ${FIELDS.cleanliness.options.find(o=>o.v===m.roommateProfile.cleanliness)?.l.slice(3) || 'Cleanliness'}`,
                                                    m.roommateProfile?.diet !== 'any' && `🥗 ${m.roommateProfile?.diet}`,
                                                    m.roommateProfile?.sleepSchedule === 'early-bird' ? '🌅 Early Bird' : m.roommateProfile?.sleepSchedule === 'night-owl' ? '🦉 Night Owl' : '😴 Flexible',
                                                    m.roommateProfile?.smoking === 'no' ? '🚭 Non-Smoker' : m.roommateProfile?.smoking === 'outside-only' ? '🚪 Outside Only' : '🚬 Smoker',
                                                    m.roommateProfile?.profession !== 'any' && (m.roommateProfile?.profession === 'student' ? '📚 Student' : '💼 Professional'),
                                                    m.roommateProfile?.wfhPreference && m.roommateProfile?.wfhPreference !== 'any' && `${m.roommateProfile.wfhPreference === 'full-wfh' ? '🏠 WFH' : m.roommateProfile.wfhPreference === 'hybrid' ? '🔄 Hybrid' : '🏢 Office'}`,
                                                    m.roommateProfile?.noiseTolerance && m.roommateProfile?.noiseTolerance !== 'moderate' && `${m.roommateProfile.noiseTolerance === 'silent' ? '🤫 Silent' : '🎵 Lively'}`,
                                                    m.roommateProfile?.pets !== 'open-to-pets' && `🐾 ${FIELDS.pets.options.find(o=>o.v===m.roommateProfile.pets)?.l.slice(3) || 'Pets'}`
                                                ].filter(Boolean).map((trait, i) => (
                                                    <span key={i} className="px-3 py-1.5 rounded-lg bg-surface border border-borderSubtle/30 text-xs text-primary font-medium shadow-sm">
                                                        {trait}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Score & Budget */}
                                            <div className="bg-surface rounded-2xl p-5 mb-6 border border-borderSubtle/20 flex items-center justify-between gap-4">
                                                <div>
                                                    <div className="text-muted text-xs font-bold uppercase tracking-wider mb-1">Budget Range</div>
                                                    <div className="text-primary font-bold text-lg">
                                                        ₹{m.roommateProfile?.budgetMin?.toLocaleString()} – ₹{m.roommateProfile?.budgetMax?.toLocaleString()}<span className="text-sm font-medium text-muted">/mo</span>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 scale-90 origin-right">
                                                    <CompatibilityRing score={compatibilityScore} />
                                                </div>
                                            </div>

                                            {m.roommateProfile?.bio && (
                                                <div className="mb-6">
                                                    <p className="text-sm text-muted italic line-clamp-3 leading-relaxed border-l-2 border-primary/30 pl-3 py-1">
                                                        "{m.roommateProfile.bio}"
                                                    </p>
                                                </div>
                                            )}

                                            {/* Connect Button */}
                                            <motion.button 
                                                whileHover={{ scale: 1.02 }} 
                                                whileTap={{ scale: 0.98 }} 
                                                onClick={() => handleConnect({user: m, name: m.name, compatibilityScore, roommateProfile: m.roommateProfile, _id: m._id})}
                                                className={`w-full py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-all shadow-sm border ${isConnected ? 'bg-primary text-white border-primary' : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'}`}
                                            >
                                                {isConnected ? <><MessageCircle className="w-5 h-5" /> Chat on WhatsApp</> : <><Heart className="w-5 h-5" /> Request to Connect</>}
                                            </motion.button>
                                            
                                        </motion.div>
                                    )})}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
