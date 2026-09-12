/* eslint-disable */
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import { PropertyCard } from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const propertyTypes = ['apartment', 'villa', 'studio', 'house', 'plot', 'commercial'];
const listingTypes = ['sale', 'rent'];
const bhkOptions = [1, 2, 3, 4];
const furnishingOptions = ['unfurnished', 'semi-furnished', 'fully-furnished'];

export default function Properties() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    const getInitialCity = () => {
        const qCity = searchParams.get('city');
        if (qCity && qCity !== 'All Cities' && qCity.toLowerCase() !== 'all') return qCity;
        return '';
    };

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        type: searchParams.get('type') || '',
        listingType: searchParams.get('listingType') || '',
        city: getInitialCity(),
        bhk: searchParams.get('bhk') || '',
        minPrice: '',
        maxPrice: '',
        furnishing: '',
        bachelorFriendly: '',
        zeroBrokerage: '',
        petFriendly: '',
        verified: '',
        lowDeposit: '',
        sort: '-createdAt'
    });

    const [savedProperties, setSavedProperties] = useState(
        JSON.parse(localStorage.getItem('savedProperties') || '[]')
    );

    const fetchProperties = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
            params.append('page', page);
            params.append('limit', 12);
            const { data } = await api.get(`/properties?${params.toString()}`);
            setProperties(data.properties || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
            setCurrentPage(page);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchProperties(1);
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ search: '', type: '', listingType: '', city: '', bhk: '', minPrice: '', maxPrice: '', furnishing: '', bachelorFriendly: '', zeroBrokerage: '', petFriendly: '', verified: '', lowDeposit: '', sort: '-createdAt' });
    };

    const handleSave = async (id) => {
        if (!user) { toast.error('Please login to save properties'); return; }
        try {
            await api.post(`/auth/save-property/${id}`);
            setSavedProperties(prev => {
                const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
                localStorage.setItem('savedProperties', JSON.stringify(updated));
                return updated;
            });
            toast.success(savedProperties.includes(id) ? 'Removed from saved' : 'Saved!');
        } catch (err) {
            toast.error('Failed to save property');
        }
    };

    const activeFiltersCount = Object.entries(filters).filter(([k, v]) => v && k !== 'sort' && k !== 'search').length;

    return (
        <div className="light-page min-h-screen pt-6 pb-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-serif text-4xl font-bold text-primary mb-2">
                        Explore Properties
                    </h1>
                    <p className="text-muted">{total} properties found</p>
                </div>

                {/* Search + Filter Bar */}
                <div className="bg-elevated border border-borderSubtle/20 rounded-card p-4 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[240px] flex items-center gap-3 bg-surface border border-borderSubtle/30 rounded-btn px-4 py-2.5 focus-within:border-primary transition-colors">
                        <Search className="w-4 h-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search title, location..."
                            value={filters.search}
                            onChange={e => handleFilterChange('search', e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-primary placeholder-muted flex-1"
                        />
                    </div>

                    <select value={filters.listingType} onChange={e => handleFilterChange('listingType', e.target.value)} className="bg-surface border border-borderSubtle/30 rounded-btn px-4 py-2.5 text-sm text-primary outline-none focus:border-primary cursor-pointer transition-colors">
                        <option value="">All Types</option>
                        {listingTypes.map(t => <option key={t} value={t}>{t === 'sale' ? 'For Sale' : 'For Rent'}</option>)}
                    </select>

                    <select value={filters.sort} onChange={e => handleFilterChange('sort', e.target.value)} className="bg-surface border border-borderSubtle/30 rounded-btn px-4 py-2.5 text-sm text-primary outline-none focus:border-primary cursor-pointer transition-colors">
                        <option value="-createdAt">Newest First</option>
                        <option value="price">Price: Low to High</option>
                        <option value="-price">Price: High to Low</option>
                        <option value="-views">Most Viewed</option>
                    </select>

                    <button onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-btn text-sm font-medium transition-colors border ${showFilters ? 'bg-primary text-white border-primary' : 'bg-surface text-primary border-borderSubtle/30 hover:border-borderSubtle/60'}`}>
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters {activeFiltersCount > 0 && <span className={`rounded-full w-5 h-5 flex items-center justify-center text-xs ${showFilters ? 'bg-white text-primary' : 'bg-primary text-white'}`}>{activeFiltersCount}</span>}
                    </button>

                    {activeFiltersCount > 0 && (
                        <button onClick={clearFilters} className="flex items-center gap-1.5 text-red-500 hover:text-red-600 text-sm font-medium px-2 transition-colors">
                            <X className="w-4 h-4" /> Clear All
                        </button>
                    )}
                </div>

                {/* Advanced Filters Panel */}
                {showFilters && (
                    <div className="bg-elevated border border-borderSubtle/20 rounded-card p-6 shadow-sm mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Property Type</label>
                            <select value={filters.type} onChange={e => handleFilterChange('type', e.target.value)} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-3 py-2 text-sm text-primary outline-none focus:border-primary transition-colors">
                                <option value="">All</option>
                                {propertyTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">City</label>
                            <select value={filters.city} onChange={e => handleFilterChange('city', e.target.value)} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-3 py-2 text-sm text-primary outline-none focus:border-primary transition-colors">
                                <option value="">All Cities</option>
                                {['Bangalore', 'Pune', 'Hyderabad', 'Mumbai', 'Delhi NCR', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Indore', 'Lucknow', 'Chandigarh', 'Kochi', 'Goa'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">BHK</label>
                            <select value={filters.bhk} onChange={e => handleFilterChange('bhk', e.target.value)} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-3 py-2 text-sm text-primary outline-none focus:border-primary transition-colors">
                                <option value="">Any</option>
                                {bhkOptions.map(b => <option key={b} value={b}>{b} BHK</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Min Price (₹)</label>
                            <input type="number" placeholder="0" value={filters.minPrice} onChange={e => handleFilterChange('minPrice', e.target.value)} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-3 py-2 text-sm text-primary outline-none focus:border-primary transition-colors placeholder-muted" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Max Price (₹)</label>
                            <input type="number" placeholder="Any" value={filters.maxPrice} onChange={e => handleFilterChange('maxPrice', e.target.value)} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-3 py-2 text-sm text-primary outline-none focus:border-primary transition-colors placeholder-muted" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Furnishing</label>
                            <select value={filters.furnishing} onChange={e => handleFilterChange('furnishing', e.target.value)} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-3 py-2 text-sm text-primary outline-none focus:border-primary transition-colors">
                                <option value="">Any</option>
                                {furnishingOptions.map(f => <option key={f} value={f}>{f.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}</option>)}
                            </select>
                        </div>
                        
                        {/* Indian-specific quick filters */}
                        <div className="col-span-full flex flex-wrap gap-3 pt-4 mt-2 border-t border-borderSubtle/15">
                            {[
                                { key: 'bachelorFriendly', label: '👨‍🎓 Bachelor Friendly', colorClass: 'text-blue-700 bg-blue-50 border-blue-200' },
                                { key: 'zeroBrokerage', label: '🏷️ Zero Brokerage', colorClass: 'text-green-700 bg-green-50 border-green-200' },
                                { key: 'petFriendly', label: '🐾 Pet Friendly', colorClass: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
                                { key: 'verified', label: '✅ Verified Only', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                                { key: 'lowDeposit', label: '💰 Low Deposit', colorClass: 'text-purple-700 bg-purple-50 border-purple-200' },
                            ].map(f => {
                                const isActive = filters[f.key] === 'true';
                                return (
                                    <button key={f.key} onClick={() => handleFilterChange(f.key, isActive ? '' : 'true')}
                                        className={`px-4 py-2 rounded-btn text-sm font-medium transition-colors border ${
                                            isActive 
                                                ? f.colorClass 
                                                : 'bg-surface text-muted border-borderSubtle/30 hover:border-borderSubtle/60 hover:text-primary'
                                        }`}>
                                        {f.label}
                                    </button>
                                );
                            })}
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
                ) : properties.length > 0 ? (
                    <>
                        <motion.div 
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ staggerChildren: 0.1 }}
                        >
                            {properties.map(p => (
                                <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                                    <PropertyCard property={p} onSave={handleSave} saved={savedProperties.includes(p._id)} />
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Pagination */}
                        {pages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-12 mb-8">
                                <button
                                    onClick={() => fetchProperties(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 bg-elevated border border-borderSubtle/20 rounded-btn text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="text-sm font-medium text-muted px-4">
                                    Page <strong className="text-primary">{currentPage}</strong> of {pages}
                                </span>
                                <button
                                    onClick={() => fetchProperties(currentPage + 1)}
                                    disabled={currentPage === pages}
                                    className="p-2 bg-elevated border border-borderSubtle/20 rounded-btn text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-elevated border border-borderSubtle/20 rounded-card p-12 text-center flex flex-col items-center">
                        <Building2 className="w-16 h-16 text-borderSubtle/40 mb-4" />
                        <h2 className="text-2xl font-bold text-primary mb-2">No Properties Found</h2>
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
