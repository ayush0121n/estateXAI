/* eslint-disable */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Plus, GitCompare, Check, ChevronRight, Wifi, Car, Dumbbell, Waves, Shield, Zap, TreePine, Building } from 'lucide-react';
import api from '../utils/api';

const AMENITY_ICONS = {
    wifi: <Wifi size={14} />, parking: <Car size={14} />, gym: <Dumbbell size={14} />,
    pool: <Waves size={14} />, security: <Shield size={14} />, power_backup: <Zap size={14} />,
    garden: <TreePine size={14} />, elevator: <Building size={14} />,
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
        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <td style={{ padding: '10px 16px', fontSize: 12, color: '#888', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</td>
            {values.map((val, i) => {
                const isMax = typeof val === 'number' && val === max && max > 0;
                return (
                    <td key={i} style={{
                        padding: '10px 16px', textAlign: 'center', fontSize: 13,
                        color: isMax && highlight ? '#22d3a5' : '#ddd',
                        fontWeight: isMax && highlight ? 700 : 400,
                    }}>
                        {val === null || val === undefined ? <span style={{ color: '#555' }}>—</span> : String(val)}
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
        <div style={{ minHeight: '100vh', background: '#0a0d1a', padding: '100px 24px 60px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,var(--primary),#22d3a5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <GitCompare size={22} color="#fff" />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Property Comparison</h1>
                            <p style={{ margin: 0, color: '#888', fontSize: 14 }}>Compare up to 3 properties side-by-side</p>
                        </div>
                    </div>
                </motion.div>

                {/* Search */}
                <div style={{ background: 'rgba(201, 163, 94,0.06)', border: '1px solid rgba(201, 163, 94,0.2)', borderRadius: 16, padding: 20, marginBottom: 28 }}>
                    <form onSubmit={handleSearch} className="compare-search-form" style={{ display: 'flex', gap: 10 }}>
                        <input
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search for a property to compare..."
                            style={{ flex: 1, padding: '10px 16px', borderRadius: 10, background: '#0f1124', border: '1px solid rgba(201, 163, 94,0.3)', color: '#fff', fontSize: 14 }}
                        />
                        <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={searching || selected.length >= MAX_COMPARE}
                            style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--primary)', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                            {searching ? 'Searching...' : <><Plus size={16} /> Add Property</>}
                        </motion.button>
                    </form>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {searchResults.map(prop => {
                                const isAdded = !!selected.find(p => p._id === prop._id);
                                return (
                                    <div key={prop._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#0f1124', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: 14 }}>{prop.title}</div>
                                            <div style={{ fontSize: 12, color: '#888' }}>{prop.location?.address} · {formatPrice(prop.price, prop.listingType)}</div>
                                        </div>
                                        <motion.button whileTap={{ scale: 0.95 }}
                                            onClick={() => addToCompare(prop)} disabled={isAdded || selected.length >= MAX_COMPARE}
                                            style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: isAdded ? '#22d3a5' : 'var(--primary)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            {isAdded ? <><Check size={12} /> Added</> : <><Plus size={12} /> Compare</>}
                                        </motion.button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Comparison Table */}
                {selected.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
                        <GitCompare size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
                        <p style={{ fontSize: 16 }}>Search and add properties to compare them side-by-side.</p>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
                        <div className="compare-table-wrap" style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                                <thead>
                                    <tr style={{ background: 'rgba(201, 163, 94,0.1)' }}>
                                        <th style={{ width: 160, padding: '14px 16px', textAlign: 'left', fontSize: 12, color: '#aaa', fontWeight: 600 }}>Feature</th>
                                        {selected.map(prop => (
                                            <th key={prop._id} style={{ padding: '14px 16px', textAlign: 'center' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <button onClick={() => removeFromCompare(prop._id)}
                                                        style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                                                        <X size={12} color="#fff" />
                                                    </button>
                                                    {prop.images?.[0] && (
                                                        <img src={prop.images[0]} alt={prop.title} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 10, marginBottom: 8 }} />
                                                    )}
                                                    <div style={{ fontWeight: 700, fontSize: 13 }}>{prop.title}</div>
                                                    <div style={{ color: '#22d3a5', fontWeight: 800, fontSize: 15, marginTop: 4 }}>{formatPrice(prop.price, prop.listingType)}</div>
                                                    <button onClick={() => navigate(`/properties/${prop._id}`)}
                                                        style={{ marginTop: 8, padding: '4px 12px', borderRadius: 8, border: '1px solid rgba(201, 163, 94,0.4)', background: 'transparent', color: 'var(--primary)', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, margin: '8px auto 0' }}>
                                                        View <ChevronRight size={11} />
                                                    </button>
                                                </div>
                                            </th>
                                        ))}
                                        {/* Empty slots */}
                                        {Array.from({ length: emptySlots }).map((_, i) => (
                                            <th key={`empty-${i}`} style={{ padding: '14px 16px', textAlign: 'center' }}>
                                                <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(201, 163, 94,0.3)', borderRadius: 10, color: '#555', fontSize: 13 }}>
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
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '10px 16px', fontSize: 12, color: '#888', fontWeight: 600 }}>Amenities</td>
                                        {selected.map(prop => (
                                            <td key={prop._id} style={{ padding: '10px 16px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                                                    {(prop.amenities || []).map(a => (
                                                        <span key={a} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'rgba(201, 163, 94,0.15)', color: '#aaa', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            {AMENITY_ICONS[a]} {a}
                                                        </span>
                                                    ))}
                                                    {(prop.amenities || []).length === 0 && <span style={{ color: '#555' }}>None</span>}
                                                </div>
                                            </td>
                                        ))}
                                        {Array.from({ length: emptySlots }).map((_, i) => <td key={i} />)}
                                    </tr>
                                    <CompareRow label="Walkability" values={selected.map(p => p.walkabilityScore != null ? `${p.walkabilityScore}/100` : '—')} />
                                    <CompareRow label="Year Built" values={selected.map(p => p.yearBuilt || '—')} />
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}



