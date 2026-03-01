import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Users } from 'lucide-react';
import api from '../utils/api';
import { PGCard } from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function PGs() {
    const [searchParams] = useSearchParams();
    const { user } = useAuth();

    const [pgs, setPGs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        genderType: searchParams.get('genderType') || '',
        city: searchParams.get('city') || 'Pune',
        minRent: '',
        maxRent: '',
        wifi: '',
        food: '',
        ac: '',
        sharingType: '',
        sort: '-rating'
    });

    const [savedPGs, setSavedPGs] = useState(JSON.parse(localStorage.getItem('savedPGs') || '[]'));

    const fetchPGs = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
            params.append('page', page);
            params.append('limit', 12);
            const { data } = await api.get(`/pgs?${params.toString()}`);
            setPGs(data.pgs || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
            setCurrentPage(page);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchPGs(1); }, [filters]);

    const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
    const clearFilters = () => setFilters({ search: '', genderType: '', city: '', minRent: '', maxRent: '', wifi: '', food: '', ac: '', sharingType: '', sort: '-rating' });

    const handleSave = async (id) => {
        if (!user) { toast.error('Please login to save'); return; }
        try {
            await api.post(`/auth/save-pg/${id}`);
            setSavedPGs(prev => {
                const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
                localStorage.setItem('savedPGs', JSON.stringify(updated));
                return updated;
            });
            toast.success(savedPGs.includes(id) ? 'Removed from saved' : 'Saved!');
        } catch { toast.error('Failed to save'); }
    };

    const AmenityToggle = ({ label, filterKey, icon }) => (
        <button
            onClick={() => handleFilterChange(filterKey, filters[filterKey] === 'true' ? '' : 'true')}
            style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                background: filters[filterKey] === 'true' ? 'rgba(108,99,255,0.25)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${filters[filterKey] === 'true' ? 'rgba(108,99,255,0.6)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 20, color: filters[filterKey] === 'true' ? '#6c63ff' : '#b0b7d3',
                cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', transition: 'all 0.2s'
            }}>
            {icon} {label}
        </button>
    );

    return (
        <div style={{ paddingTop: 90, minHeight: '100vh' }}>
            <div className="container" style={{ paddingTop: 24 }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, color: 'white', marginBottom: 8 }}>
                        PGs & Hostels
                    </h1>
                    <p style={{ color: '#6b7298' }}>{total} listings found</p>
                </div>

                {/* Search Bar */}
                <div className="glass-card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 16px', minWidth: 200 }}>
                        <Search size={16} color="#6b7298" />
                        <input type="text" placeholder="Search name, area, institution..." value={filters.search} onChange={e => handleFilterChange('search', e.target.value)}
                            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 14, fontFamily: 'inherit' }} />
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        {['', 'male', 'female', 'unisex'].map(g => (
                            <button key={g} onClick={() => handleFilterChange('genderType', g)}
                                style={{ padding: '8px 14px', borderRadius: 20, border: `1px solid ${filters.genderType === g ? 'rgba(108,99,255,0.6)' : 'rgba(255,255,255,0.1)'}`, background: filters.genderType === g ? 'rgba(108,99,255,0.2)' : 'transparent', color: filters.genderType === g ? '#6c63ff' : '#b0b7d3', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', transition: 'all 0.2s' }}>
                                {g === '' ? 'All' : g === 'male' ? '♂ Boys' : g === 'female' ? '♀ Girls' : '⚥ Unisex'}
                            </button>
                        ))}
                    </div>

                    <select value={filters.sort} onChange={e => handleFilterChange('sort', e.target.value)} className="input" style={{ width: 'auto' }}>
                        <option value="-rating">Top Rated</option>
                        <option value="rentPerMonth">Rent: Low to High</option>
                        <option value="-rentPerMonth">Rent: High to Low</option>
                        <option value="-createdAt">Newest</option>
                    </select>

                    <button onClick={() => setShowFilters(!showFilters)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, background: showFilters ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${showFilters ? 'rgba(108,99,255,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, padding: '10px 16px', color: showFilters ? '#6c63ff' : '#b0b7d3', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
                        <SlidersHorizontal size={16} /> Filters
                    </button>

                    {(filters.minRent || filters.maxRent || filters.wifi || filters.food || filters.ac || filters.city) && (
                        <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                            <X size={14} /> Clear
                        </button>
                    )}
                </div>

                {/* Amenity Quick Toggles */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                    <AmenityToggle label="WiFi" filterKey="wifi" icon="📶" />
                    <AmenityToggle label="Food Included" filterKey="food" icon="🍽️" />
                    <AmenityToggle label="AC" filterKey="ac" icon="❄️" />
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="glass-card" style={{ padding: 24, marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: '#6b7298', textTransform: 'uppercase', letterSpacing: 1 }}>City</label>
                            <input type="text" placeholder="Pune" value={filters.city} onChange={e => handleFilterChange('city', e.target.value)} className="input" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: '#6b7298', textTransform: 'uppercase', letterSpacing: 1 }}>Min Rent (₹)</label>
                            <input type="number" placeholder="0" value={filters.minRent} onChange={e => handleFilterChange('minRent', e.target.value)} className="input" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: '#6b7298', textTransform: 'uppercase', letterSpacing: 1 }}>Max Rent (₹)</label>
                            <input type="number" placeholder="Any" value={filters.maxRent} onChange={e => handleFilterChange('maxRent', e.target.value)} className="input" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: '#6b7298', textTransform: 'uppercase', letterSpacing: 1 }}>Sharing Type</label>
                            <select value={filters.sharingType} onChange={e => handleFilterChange('sharingType', e.target.value)} className="input">
                                <option value="">Any</option>
                                <option value="single">Single</option>
                                <option value="double">Double</option>
                                <option value="triple">Triple</option>
                                <option value="quad">Quad</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Results */}
                {loading ? (
                    <div className="grid-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="glass-card" style={{ height: 420, animation: 'glow-pulse 1.5s ease-in-out infinite' }} />
                        ))}
                    </div>
                ) : pgs.length > 0 ? (
                    <>
                        <div className="grid-3">
                            {pgs.map(pg => <PGCard key={pg._id} pg={pg} onSave={handleSave} saved={savedPGs.includes(pg._id)} />)}
                        </div>
                        {pages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
                                {[...Array(pages)].map((_, i) => (
                                    <button key={i} onClick={() => fetchPGs(i + 1)}
                                        style={{ background: currentPage === i + 1 ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.05)', border: `1px solid ${currentPage === i + 1 ? 'rgba(108,99,255,0.6)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, width: 40, height: 40, color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state">
                        <Users size={64} color="#6b7298" />
                        <h3 style={{ color: '#b0b7d3' }}>No PGs found</h3>
                        <p>Try adjusting your filters.</p>
                        <button onClick={clearFilters} className="btn btn-primary">Clear Filters</button>
                    </div>
                )}
            </div>
        </div>
    );
}
