import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import { PropertyCard } from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        type: searchParams.get('type') || '',
        listingType: searchParams.get('listingType') || '',
        city: searchParams.get('city') || '',
        bhk: searchParams.get('bhk') || '',
        minPrice: '',
        maxPrice: '',
        furnishing: '',
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
        setFilters({ search: '', type: '', listingType: '', city: '', bhk: '', minPrice: '', maxPrice: '', furnishing: '', sort: '-createdAt' });
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
        <div style={{ paddingTop: 90, minHeight: '100vh' }}>
            <div className="container" style={{ paddingTop: 24 }}>
                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, color: 'white', marginBottom: 8 }}>
                        Explore Properties
                    </h1>
                    <p style={{ color: '#6b7298' }}>{total} properties found</p>
                </div>

                {/* Search + Filter Bar */}
                <div className="glass-card" style={{ padding: 16, marginBottom: 28, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 16px', minWidth: 200 }}>
                        <Search size={16} color="#6b7298" />
                        <input
                            type="text"
                            placeholder="Search title, location..."
                            value={filters.search}
                            onChange={e => handleFilterChange('search', e.target.value)}
                            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 14, fontFamily: 'inherit' }}
                        />
                    </div>

                    <select value={filters.listingType} onChange={e => handleFilterChange('listingType', e.target.value)} className="input" style={{ width: 'auto' }}>
                        <option value="">All Types</option>
                        {listingTypes.map(t => <option key={t} value={t}>{t === 'sale' ? 'For Sale' : 'For Rent'}</option>)}
                    </select>

                    <select value={filters.sort} onChange={e => handleFilterChange('sort', e.target.value)} className="input" style={{ width: 'auto' }}>
                        <option value="-createdAt">Newest First</option>
                        <option value="price">Price: Low to High</option>
                        <option value="-price">Price: High to Low</option>
                        <option value="-views">Most Viewed</option>
                    </select>

                    <button onClick={() => setShowFilters(!showFilters)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, background: showFilters ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${showFilters ? 'rgba(108,99,255,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, padding: '10px 16px', color: showFilters ? '#6c63ff' : '#b0b7d3', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', transition: 'all 0.2s' }}>
                        <SlidersHorizontal size={16} />
                        Filters {activeFiltersCount > 0 && <span style={{ background: '#6c63ff', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>{activeFiltersCount}</span>}
                    </button>

                    {activeFiltersCount > 0 && (
                        <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                            <X size={14} /> Clear All
                        </button>
                    )}
                </div>

                {/* Advanced Filters Panel */}
                {showFilters && (
                    <div className="glass-card" style={{ padding: 24, marginBottom: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: '#6b7298', textTransform: 'uppercase', letterSpacing: 1 }}>Property Type</label>
                            <select value={filters.type} onChange={e => handleFilterChange('type', e.target.value)} className="input">
                                <option value="">All</option>
                                {propertyTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: '#6b7298', textTransform: 'uppercase', letterSpacing: 1 }}>City</label>
                            <input type="text" placeholder="e.g. Pune" value={filters.city} onChange={e => handleFilterChange('city', e.target.value)} className="input" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: '#6b7298', textTransform: 'uppercase', letterSpacing: 1 }}>BHK</label>
                            <select value={filters.bhk} onChange={e => handleFilterChange('bhk', e.target.value)} className="input">
                                <option value="">Any</option>
                                {bhkOptions.map(b => <option key={b} value={b}>{b} BHK</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: '#6b7298', textTransform: 'uppercase', letterSpacing: 1 }}>Min Price (₹)</label>
                            <input type="number" placeholder="0" value={filters.minPrice} onChange={e => handleFilterChange('minPrice', e.target.value)} className="input" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: '#6b7298', textTransform: 'uppercase', letterSpacing: 1 }}>Max Price (₹)</label>
                            <input type="number" placeholder="Any" value={filters.maxPrice} onChange={e => handleFilterChange('maxPrice', e.target.value)} className="input" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: '#6b7298', textTransform: 'uppercase', letterSpacing: 1 }}>Furnishing</label>
                            <select value={filters.furnishing} onChange={e => handleFilterChange('furnishing', e.target.value)} className="input">
                                <option value="">Any</option>
                                {furnishingOptions.map(f => <option key={f} value={f}>{f.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                {/* Results */}
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="glass-card" style={{ height: 400, background: 'rgba(108,99,255,0.05)', animation: 'glow-pulse 1.5s ease-in-out infinite' }} />
                        ))}
                    </div>
                ) : properties.length > 0 ? (
                    <>
                        <div className="grid-3">
                            {properties.map(prop => (
                                <PropertyCard key={prop._id} property={prop} onSave={handleSave} saved={savedProperties.includes(prop._id)} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 48 }}>
                                <button onClick={() => fetchProperties(currentPage - 1)} disabled={currentPage === 1}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 16px', color: currentPage === 1 ? '#6b7298' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
                                    <ChevronLeft size={16} /> Prev
                                </button>
                                {[...Array(pages)].map((_, i) => (
                                    <button key={i} onClick={() => fetchProperties(i + 1)}
                                        style={{ background: currentPage === i + 1 ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.05)', border: `1px solid ${currentPage === i + 1 ? 'rgba(108,99,255,0.6)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, width: 40, height: 40, color: currentPage === i + 1 ? '#6c63ff' : 'white', cursor: 'pointer', fontFamily: 'inherit', fontWeight: currentPage === i + 1 ? 700 : 400 }}>
                                        {i + 1}
                                    </button>
                                ))}
                                <button onClick={() => fetchProperties(currentPage + 1)} disabled={currentPage === pages}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 16px', color: currentPage === pages ? '#6b7298' : 'white', cursor: currentPage === pages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state">
                        <Building2 size={64} color="#6b7298" />
                        <h3 style={{ color: '#b0b7d3' }}>No properties found</h3>
                        <p style={{ color: '#6b7298' }}>Try adjusting your filters or search query.</p>
                        <button onClick={clearFilters} className="btn btn-primary">Clear Filters</button>
                    </div>
                )}
            </div>
        </div>
    );
}
