/* eslint-disable */
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
        city: searchParams.get('city') || localStorage.getItem('userCity') || '',
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
                background: filters[filterKey] === 'true' ? 'rgba(201, 163, 94,0.25)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${filters[filterKey] === 'true' ? 'rgba(201, 163, 94,0.6)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 20, color: filters[filterKey] === 'true' ? 'var(--primary)' : '#b0b7d3',
                cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', transition: 'all 0.2s'
            }}>
            {icon} {label}
        </button>
    );

    return (
        <div className="light-page min-h-screen pt-6 pb-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-serif text-4xl font-bold text-primary mb-2">
                        PGs & Hostels
                    </h1>
                    <p className="text-muted">{total} listings found</p>
                </div>

                {/* Search Bar */}
                <div className="bg-elevated border border-borderSubtle/20 rounded-card p-4 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[240px] flex items-center gap-3 bg-surface border border-borderSubtle/30 rounded-btn px-4 py-2.5 focus-within:border-primary transition-colors">
                        <Search className="w-4 h-4 text-muted" />
                        <input type="text" placeholder="Search name, area, institution..." value={filters.search} onChange={e => handleFilterChange('search', e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-primary placeholder-muted flex-1" />
                    </div>

                    <div className="flex gap-2">
                        {['', 'male', 'female', 'unisex'].map(g => {
                            const isActive = filters.genderType === g;
                            return (
                                <button key={g} onClick={() => handleFilterChange('genderType', g)}
                                    className={`px-3 py-2 rounded-btn text-sm font-medium transition-colors border ${
                                        isActive 
                                            ? 'bg-primary text-white border-primary' 
                                            : 'bg-surface text-muted border-borderSubtle/30 hover:border-borderSubtle/60 hover:text-primary'
                                    }`}>
                                    {g === '' ? 'All' : g === 'male' ? '♂ Boys' : g === 'female' ? '♀ Girls' : '⚥ Unisex'}
                                </button>
                            );
                        })}
                    </div>

                    <select value={filters.sort} onChange={e => handleFilterChange('sort', e.target.value)} className="bg-surface border border-borderSubtle/30 rounded-btn px-4 py-2.5 text-sm text-primary outline-none focus:border-primary cursor-pointer transition-colors">
                        <option value="-rating">Top Rated</option>
                        <option value="rentPerMonth">Rent: Low to High</option>
                        <option value="-rentPerMonth">Rent: High to Low</option>
                        <option value="-createdAt">Newest</option>
                    </select>

                    <button onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-btn text-sm font-medium transition-colors border ${showFilters ? 'bg-primary text-white border-primary' : 'bg-surface text-primary border-borderSubtle/30 hover:border-borderSubtle/60'}`}>
                        <SlidersHorizontal className="w-4 h-4" /> Filters
                    </button>

                    {(filters.minRent || filters.maxRent || filters.wifi || filters.food || filters.ac || filters.city) && (
                        <button onClick={clearFilters} className="flex items-center gap-1.5 text-red-500 hover:text-red-600 text-sm font-medium px-2 transition-colors">
                            <X className="w-4 h-4" /> Clear All
                        </button>
                    )}
                </div>

                {/* Amenity Quick Toggles */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {[
                        { label: 'WiFi', filterKey: 'wifi', icon: '📶' },
                        { label: 'Food Included', filterKey: 'food', icon: '🍽️' },
                        { label: 'AC', filterKey: 'ac', icon: '❄️' },
                    ].map(f => {
                        const isActive = filters[f.filterKey] === 'true';
                        return (
                            <button key={f.filterKey} onClick={() => handleFilterChange(f.filterKey, isActive ? '' : 'true')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-btn text-sm font-medium transition-colors border ${
                                    isActive 
                                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                        : 'bg-surface text-muted border-borderSubtle/30 hover:border-borderSubtle/60 hover:text-primary'
                                }`}>
                                <span>{f.icon}</span> {f.label}
                            </button>
                        );
                    })}
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="bg-elevated border border-borderSubtle/20 rounded-card p-6 shadow-sm mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">City</label>
                            <select value={filters.city} onChange={e => handleFilterChange('city', e.target.value)} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-3 py-2 text-sm text-primary outline-none focus:border-primary transition-colors">
                                <option value="">All Cities</option>
                                <option value="Mumbai">Mumbai</option>
                                <option value="Pune">Pune</option>
                                <option value="Bangalore">Bangalore</option>
                                <option value="Delhi NCR">Delhi NCR</option>
                                <option value="Hyderabad">Hyderabad</option>
                                <option value="Chennai">Chennai</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Min Rent (₹)</label>
                            <input type="number" placeholder="0" value={filters.minRent} onChange={e => handleFilterChange('minRent', e.target.value)} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-3 py-2 text-sm text-primary outline-none focus:border-primary transition-colors placeholder-muted" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Max Rent (₹)</label>
                            <input type="number" placeholder="Any" value={filters.maxRent} onChange={e => handleFilterChange('maxRent', e.target.value)} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-3 py-2 text-sm text-primary outline-none focus:border-primary transition-colors placeholder-muted" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Sharing Type</label>
                            <select value={filters.sharingType} onChange={e => handleFilterChange('sharingType', e.target.value)} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-3 py-2 text-sm text-primary outline-none focus:border-primary transition-colors">
                                <option value="">Any</option>
                                <option value="single">Single</option>
                                <option value="double">Double</option>
                                <option value="triple">Triple</option>
                                <option value="quad">Quad</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-elevated border border-borderSubtle/20 rounded-card h-[380px] animate-pulse"></div>
                        ))}
                    </div>
                ) : pgs.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pgs.map(pg => <PGCard key={pg._id} pg={pg} onSave={handleSave} saved={savedPGs.includes(pg._id)} />)}
                        </div>
                        {/* Pagination */}
                        {pages > 1 && (
                            <div className="flex justify-center gap-2 mt-12 mb-8">
                                {[...Array(pages)].map((_, i) => {
                                    const isCurrent = currentPage === i + 1;
                                    return (
                                        <button key={i} onClick={() => fetchPGs(i + 1)}
                                            className={`w-10 h-10 rounded-btn border text-sm font-medium transition-colors ${
                                                isCurrent 
                                                    ? 'bg-primary border-primary text-white' 
                                                    : 'bg-elevated border-borderSubtle/20 text-primary hover:bg-surface'
                                            }`}>
                                            {i + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-elevated border border-borderSubtle/20 rounded-card p-12 text-center flex flex-col items-center">
                        <Users className="w-16 h-16 text-borderSubtle/40 mb-4" />
                        <h2 className="text-2xl font-bold text-primary mb-2">No PGs Found</h2>
                        <p className="text-muted mb-6 max-w-md">Try adjusting your filters or search terms to find what you're looking for.</p>
                        <button onClick={clearFilters} className="px-6 py-2.5 bg-primary text-white rounded-btn font-medium hover:bg-black transition-colors shadow-sm">
                            Clear All Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

