/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Plus, GitCompare, Check, ChevronRight, Wifi, Car, Dumbbell, Waves, Shield, Zap, TreePine, Building } from 'lucide-react';
import api from '../utils/api';
import { fadeIn } from '../utils/animations';

const AMENITY_ICONS = {
    wifi: <Wifi className="w-3.5 h-3.5" />, parking: <Car className="w-3.5 h-3.5" />, gym: <Dumbbell className="w-3.5 h-3.5" />,
    pool: <Waves className="w-3.5 h-3.5" />, security: <Shield className="w-3.5 h-3.5" />, power_backup: <Zap className="w-3.5 h-3.5" />,
    garden: <TreePine className="w-3.5 h-3.5" />, elevator: <Building className="w-3.5 h-3.5" />,
};

const MAX_COMPARE = 3;

function formatPrice(price, listingType) {
    if (listingType === 'rent') return `₹${price?.toLocaleString('en-IN')}/mo`;
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price?.toLocaleString('en-IN')}`;
}

function CompareRow({ label, values, highlight }) {
    const max = Math.max(...values.filter(v => typeof v === 'number'));
    return (
        <tr className="border-b border-borderSubtle/10">
            <td className="py-3 px-4 text-sm font-semibold text-muted whitespace-nowrap">{label}</td>
            {values.map((val, i) => {
                const isMax = typeof val === 'number' && val === max && max > 0;
                return (
                    <td key={i} className={`py-3 px-4 text-center text-sm ${isMax && highlight ? 'text-emerald-600 font-bold' : 'text-primary font-medium'}`}>
                        {val === null || val === undefined ? <span className="text-muted">—</span> : String(val)}
                    </td>
                );
            })}
        </tr>
    );
}

export default function Compare() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selected, setSelected] = useState([]);
    const [searching, setSearching] = useState(false);
    const navigate = useNavigate();

    // Load from sessionStorage on mount
    useEffect(() => {
        const stored = sessionStorage.getItem('compareList');
        if (stored) {
            try {
                const ids = JSON.parse(stored);
                // Fetch properties by ID
                Promise.all(ids.map(id => api.get(`/properties/${id}`).then(r => r.data.property).catch(() => null)))
                    .then(props => setSelected(props.filter(Boolean)));
            } catch {}
        }
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const { data } = await api.get(`/properties?search=${encodeURIComponent(searchQuery)}&limit=6`);
            setSearchResults(data.properties || []);
        } catch {}
        setSearching(false);
    };

    const addToCompare = (prop) => {
        if (selected.length >= MAX_COMPARE) return;
        if (selected.find(p => p._id === prop._id)) return;
        setSelected(prev => [...prev, prop]);
    };

    const removeFromCompare = (id) => {
        setSelected(prev => prev.filter(p => p._id !== id));
    };

    const numCols = selected.length;
    const emptySlots = MAX_COMPARE - numCols;

    return (
        <div className="light-page min-h-screen pt-24 pb-20 font-sans">
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <motion.div variants={fadeIn} initial="initial" animate="animate" className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
                            <GitCompare className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="font-serif text-3xl font-bold text-primary mb-1">Property Comparison</h1>
                            <p className="text-muted text-sm">Compare up to 3 properties side-by-side</p>
                        </div>
                    </div>
                </motion.div>

                {/* Search */}
                <div className="bg-elevated border border-borderSubtle/20 rounded-card p-6 shadow-sm mb-8">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <input
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search for a property to compare..."
                            className="flex-1 bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary"
                        />
                        <button type="submit" disabled={searching || selected.length >= MAX_COMPARE}
                            className="btn btn-primary px-6 whitespace-nowrap shadow-sm disabled:opacity-50">
                            {searching ? 'Searching...' : <><Plus className="w-4 h-4" /> Add Property</>}
                        </button>
                    </form>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="mt-4 flex flex-col gap-2">
                            {searchResults.map(prop => {
                                const isAdded = !!selected.find(p => p._id === prop._id);
                                return (
                                    <div key={prop._id} className="flex items-center gap-3 p-3 bg-surface border border-borderSubtle/10 rounded-lg">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-primary text-sm truncate">{prop.title}</div>
                                            <div className="text-xs text-muted truncate">{prop.location?.address} · {formatPrice(prop.price, prop.listingType)}</div>
                                        </div>
                                        <button 
                                            onClick={() => addToCompare(prop)} disabled={isAdded || selected.length >= MAX_COMPARE}
                                            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                                isAdded ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                                            }`}>
                                            {isAdded ? <><Check className="w-3.5 h-3.5" /> Added</> : <><Plus className="w-3.5 h-3.5" /> Compare</>}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Comparison Table */}
                {selected.length === 0 ? (
                    <div className="text-center py-16 text-muted">
                        <GitCompare className="w-12 h-12 mx-auto mb-4 opacity-40 text-borderSubtle" />
                        <p className="text-base font-medium">Search and add properties to compare them side-by-side.</p>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-elevated border border-borderSubtle/20 rounded-card overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="bg-primary/5">
                                        <th className="w-40 py-4 px-4 text-left text-sm font-semibold text-muted">Feature</th>
                                        {selected.map(prop => (
                                            <th key={prop._id} className="py-4 px-4 text-center align-top relative">
                                                <div className="relative">
                                                    <button onClick={() => removeFromCompare(prop._id)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                    {prop.images?.[0] && (
                                                        <img src={prop.images[0]} alt={prop.title} className="w-full h-28 object-cover rounded-xl mb-3 shadow-sm" />
                                                    )}
                                                    <div className="font-bold text-primary text-sm line-clamp-2 leading-snug">{prop.title}</div>
                                                    <div className="text-emerald-600 font-serif font-bold text-lg mt-1">{formatPrice(prop.price, prop.listingType)}</div>
                                                    <button onClick={() => navigate(`/properties/${prop._id}`)}
                                                        className="mt-3 px-3 py-1.5 rounded-full border border-primary/20 text-primary text-xs font-medium inline-flex items-center gap-1 hover:bg-primary/5 transition-colors mx-auto">
                                                        View <ChevronRight className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </th>
                                        ))}
                                        {/* Empty slots */}
                                        {Array.from({ length: emptySlots }).map((_, i) => (
                                            <th key={`empty-${i}`} className="py-4 px-4 text-center align-top">
                                                <div className="h-[160px] flex items-center justify-center border-2 border-dashed border-borderSubtle/30 rounded-xl text-muted text-sm font-medium">
                                                    + Add Property
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <CompareRow label="Type" values={selected.map(p => p.type)} />
                                    <CompareRow label="Listing" values={selected.map(p => p.listingType)} />
                                    <CompareRow label="BHK" values={selected.map(p => p.bhk)} highlight />
                                    <CompareRow label="Bathrooms" values={selected.map(p => p.bathrooms)} />
                                    <CompareRow label="Area (sq ft)" values={selected.map(p => p.area)} highlight />
                                    <CompareRow label="Furnishing" values={selected.map(p => p.furnishing)} />
                                    <CompareRow label="Floor" values={selected.map(p => p.floor)} />
                                    <CompareRow label="Total Floors" values={selected.map(p => p.totalFloors)} />
                                    <CompareRow label="City" values={selected.map(p => p.location?.city)} />
                                    <CompareRow label="Views" values={selected.map(p => p.views)} highlight />
                                    <CompareRow label="Featured" values={selected.map(p => p.isFeatured ? '⭐ Yes' : 'No')} />
                                    <tr className="border-b border-borderSubtle/10">
                                        <td className="py-3 px-4 text-sm font-semibold text-muted">Amenities</td>
                                        {selected.map(prop => (
                                            <td key={prop._id} className="py-3 px-4 text-center">
                                                <div className="flex flex-wrap gap-1.5 justify-center">
                                                    {(prop.amenities || []).map(a => (
                                                        <span key={a} title={a} className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                                            {AMENITY_ICONS[a] || <Check className="w-3.5 h-3.5" />}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                        ))}
                                        {Array.from({ length: emptySlots }).map((_, i) => <td key={`empty-am-${i}`} />)}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
