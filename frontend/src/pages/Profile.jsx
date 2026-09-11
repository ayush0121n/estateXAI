import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Building2, Briefcase, Save, Heart, Bookmark, History, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import api from '../utils/api';
import { PropertyCard, PGCard } from '../components/ListingCard';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, staggerContainer, staggerItem } from '../utils/animations';

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

    return (
        <div className="light-page min-h-screen pt-24 pb-20 font-sans">
            <div className="max-w-4xl mx-auto px-6 lg:px-8">
                <motion.div variants={fadeIn} initial="initial" animate="animate" className="mb-8">
                    <h1 className="font-serif text-3xl font-bold text-primary mb-1">My Profile</h1>
                    <p className="text-muted text-sm">Manage your preferences, saved items, and search history</p>
                </motion.div>

                {/* Top Profile Card */}
                <motion.div variants={fadeIn} initial="initial" animate="animate" className="bg-elevated border border-borderSubtle/20 rounded-card p-6 md:p-8 flex items-center gap-6 flex-wrap shadow-sm mb-8">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-md ${user?.role === 'admin' ? 'bg-amber-500' : user?.role === 'owner' ? 'bg-emerald-500' : 'bg-primary'}`}>
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <h2 className="font-bold text-xl text-primary flex items-center gap-2 mb-1">
                            {user?.name} 
                            {profileData?.isPhoneVerified && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Verified</span>}
                        </h2>
                        <p className="text-muted text-sm font-medium mb-3">{user?.email}</p>
                        <div className="flex flex-wrap gap-2.5 items-center">
                            <span className="px-3 py-1 rounded-full bg-surface border border-borderSubtle/20 text-xs font-bold text-primary uppercase tracking-wider">
                                {user?.role === 'admin' ? '🛡️ Admin' : user?.role === 'owner' ? '🏠 Owner' : '🔍 User'}
                            </span>
                            {profileData?.trustScore !== undefined && (
                                <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700">
                                    🏆 Trust Score: {profileData.trustScore}/100
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div variants={fadeIn} initial="initial" animate="animate" className="flex gap-2 overflow-x-auto mb-8 pb-2 hide-scrollbar">
                    {[
                        { id: 'info', label: 'Edit Info', icon: <User className="w-4 h-4" /> },
                        { id: 'preferences', label: 'Preferences', icon: <SlidersHorizontal className="w-4 h-4" /> },
                        { id: 'favorites', label: 'Saved Favorites', icon: <Heart className="w-4 h-4" /> },
                        { id: 'searches', label: 'Saved Searches', icon: <Bookmark className="w-4 h-4" /> },
                        { id: 'history', label: 'Activity History', icon: <History className="w-4 h-4" /> },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 whitespace-nowrap transition-colors ${
                                activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'bg-surface border border-borderSubtle/20 text-muted hover:border-primary/40 hover:text-primary'
                            }`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'info' && (
                        <motion.div key="info" variants={staggerContainer} initial="initial" animate="animate" exit="exit" className="bg-elevated border border-borderSubtle/20 rounded-card p-6 md:p-8 shadow-sm">
                            <h3 className="font-bold text-primary text-lg mb-6 pb-3 border-b border-borderSubtle/10">Personal Information</h3>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                <motion.div variants={staggerItem}>
                                    <label className="flex items-center gap-1.5 text-sm font-semibold text-primary mb-2"><User className="w-4 h-4" /> Full Name</label>
                                    <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" value={form.name} onChange={e => set('name', e.target.value)} />
                                </motion.div>
                                <motion.div variants={staggerItem}>
                                    <label className="flex items-center gap-1.5 text-sm font-semibold text-primary mb-2"><Mail className="w-4 h-4" /> Email <span className="text-muted text-xs font-normal">(read-only)</span></label>
                                    <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none text-muted bg-opacity-50 cursor-not-allowed" value={user?.email} disabled />
                                </motion.div>
                                <motion.div variants={staggerItem}>
                                    <label className="flex items-center gap-1.5 text-sm font-semibold text-primary mb-2"><Phone className="w-4 h-4" /> Phone Number</label>
                                    <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
                                </motion.div>
                                <motion.div variants={staggerItem}>
                                    <label className="flex items-center gap-1.5 text-sm font-semibold text-primary mb-2"><Building2 className="w-4 h-4" /> College / Institution <span className="text-emerald-600 text-xs">(AI PG Match)</span></label>
                                    <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" placeholder="e.g. Delhi University, IIT Bombay" value={form.institution} onChange={e => set('institution', e.target.value)} />
                                </motion.div>
                                <motion.div variants={staggerItem}>
                                    <label className="flex items-center gap-1.5 text-sm font-semibold text-primary mb-2"><Briefcase className="w-4 h-4" /> Workplace</label>
                                    <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" placeholder="e.g. Infosys, TCS" value={form.workplace} onChange={e => set('workplace', e.target.value)} />
                                </motion.div>
                                <motion.div variants={staggerItem}>
                                    <label className="flex items-center gap-1.5 text-sm font-semibold text-primary mb-2"><ShieldCheck className="w-4 h-4" /> ID Verification</label>
                                    {profileData?.isPhoneVerified ? (
                                        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-btn text-emerald-700 text-sm font-bold">
                                            <ShieldCheck className="w-5 h-5" /> Your account is fully verified.
                                        </div>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <input type="file" className="flex-1 bg-surface border border-borderSubtle/30 rounded-btn p-2 outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" accept="image/*,.pdf" />
                                            <button type="button" className="btn btn-primary sm:w-auto w-full" onClick={(e) => { e.preventDefault(); toast.success('ID uploaded for verification! Approval pending.'); }}>Upload ID</button>
                                        </div>
                                    )}
                                </motion.div>

                                <motion.button variants={staggerItem} type="submit" disabled={loading} className="btn btn-primary mt-4 py-3 text-base flex items-center justify-center gap-2 shadow-md">
                                    <Save className="w-5 h-5" /> {loading ? 'Saving...' : 'Save Changes'}
                                </motion.button>
                            </form>
                        </motion.div>
                    )}

                    {activeTab === 'preferences' && (
                        <motion.div key="preferences" variants={staggerContainer} initial="initial" animate="animate" exit="exit" className="bg-elevated border border-borderSubtle/20 rounded-card p-6 md:p-8 shadow-sm">
                            <h3 className="font-bold text-primary text-lg mb-6 pb-3 border-b border-borderSubtle/10">Property Search Preferences</h3>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-primary mb-2">Min Budget (₹)</label>
                                        <input type="number" className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" value={form.preferences.budgetMin} onChange={e => setPref('budgetMin', Number(e.target.value))} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-primary mb-2">Max Budget (₹)</label>
                                        <input type="number" className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" value={form.preferences.budgetMax} onChange={e => setPref('budgetMax', Number(e.target.value))} />
                                    </div>
                                </motion.div>
                                <motion.div variants={staggerItem}>
                                    <label className="block text-sm font-semibold text-primary mb-2">Preferred Listing Type</label>
                                    <select className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" value={form.preferences.listingType} onChange={e => setPref('listingType', e.target.value)}>
                                        <option value="any">Any (Buy or Rent)</option>
                                        <option value="sale">Buy Only</option>
                                        <option value="rent">Rent Only</option>
                                    </select>
                                </motion.div>
                                <motion.div variants={staggerItem}>
                                    <label className="block text-sm font-semibold text-primary mb-2">Preferred Cities (comma-separated)</label>
                                    <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary" value={form.preferences.preferredCities} onChange={e => setPref('preferredCities', e.target.value)} />
                                </motion.div>

                                <motion.button variants={staggerItem} type="submit" disabled={loading} className="btn btn-primary mt-4 py-3 text-base flex items-center justify-center gap-2 shadow-md">
                                    <Save className="w-5 h-5" /> {loading ? 'Saving...' : 'Save Preferences'}
                                </motion.button>
                            </form>
                        </motion.div>
                    )}

                    {activeTab === 'favorites' && (
                        <motion.div key="favorites" variants={staggerContainer} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-8">
                            <div>
                                <h3 className="font-serif text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                                    Saved Properties <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-sm">{profileData?.savedProperties?.length || 0}</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {(profileData?.savedProperties || []).map(p => <PropertyCard key={p._id} property={p} />)}
                                </div>
                                {(profileData?.savedProperties || []).length === 0 && (
                                    <div className="p-8 text-center bg-surface border border-borderSubtle/20 rounded-card text-muted font-medium">
                                        No saved properties yet. Click the heart icon on any listing!
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="font-serif text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                                    Saved PGs <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-sm">{profileData?.savedPGs?.length || 0}</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {(profileData?.savedPGs || []).map(pg => <PGCard key={pg._id} pg={pg} />)}
                                </div>
                                {(profileData?.savedPGs || []).length === 0 && (
                                    <div className="p-8 text-center bg-surface border border-borderSubtle/20 rounded-card text-muted font-medium">
                                        No saved PGs yet.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'searches' && (
                        <motion.div key="searches" variants={staggerContainer} initial="initial" animate="animate" exit="exit" className="bg-elevated border border-borderSubtle/20 rounded-card p-6 md:p-8 shadow-sm">
                            <h3 className="font-bold text-primary text-lg mb-6 pb-3 border-b border-borderSubtle/10">Saved Searches</h3>
                            {savedSearches.length === 0 ? (
                                <div className="p-6 text-center bg-surface border border-borderSubtle/20 rounded-xl text-muted font-medium">
                                    No saved searches. Save your frequent search criteria from the search page!
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {savedSearches.map((s, i) => (
                                        <motion.div variants={staggerItem} key={i} className="bg-surface border border-borderSubtle/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <div className="font-bold text-primary text-sm mb-1">{s.name || `Search #${i + 1}`}</div>
                                                <div className="text-xs text-muted font-medium">{new Date(s.createdAt).toLocaleDateString()}</div>
                                            </div>
                                            <button className="btn btn-secondary bg-elevated px-4 py-1.5 text-xs whitespace-nowrap self-start sm:self-auto">Run Search</button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div key="history" variants={staggerContainer} initial="initial" animate="animate" exit="exit" className="bg-elevated border border-borderSubtle/20 rounded-card p-6 md:p-8 shadow-sm">
                            <h3 className="font-bold text-primary text-lg mb-6 pb-3 border-b border-borderSubtle/10 flex items-center gap-2">
                                Activity History <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">{history.length}</span>
                            </h3>
                            {history.length === 0 ? (
                                <div className="p-6 text-center bg-surface border border-borderSubtle/20 rounded-xl text-muted font-medium">
                                    No activity history recorded yet.
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {history.map((h, i) => (
                                        <motion.div variants={staggerItem} key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4 bg-surface border border-borderSubtle/10 rounded-lg text-sm">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded ${h.interactionType === 'favorite' ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'}`}>
                                                    {h.interactionType}
                                                </span>
                                                <span className="font-semibold text-primary">{h.itemType} <span className="text-muted text-xs font-normal">({h.itemId.substring(0, 8)}...)</span></span>
                                            </div>
                                            <span className="text-muted text-xs font-medium sm:ml-auto">{new Date(h.createdAt).toLocaleString()}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Danger Zone */}
                <motion.div variants={fadeIn} initial="initial" animate="animate" className="bg-red-50 border border-red-200 rounded-card p-6 md:p-8 mt-12 mb-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-red-700 mb-1">Account Actions</h3>
                        <p className="text-red-600/70 text-sm font-medium">Log out of your current session</p>
                    </div>
                    <button onClick={logout} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-btn font-bold text-sm shadow-sm transition-colors w-full sm:w-auto">
                        Log Out
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
