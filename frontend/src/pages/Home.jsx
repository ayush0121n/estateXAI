import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Building2, Users, TrendingUp, MapPin, ArrowRight, Star, Shield, Zap, BarChart3 } from 'lucide-react';
import api from '../utils/api';
import { PropertyCard, PGCard } from '../components/ListingCard';

const stats = [
    { icon: Building2, label: 'Exclusive Properties', value: '2,400+', color: 'var(--primary)' },
    { icon: Users, label: 'Premium Clients', value: '8,500+', color: '#94a3b8' },
    { icon: MapPin, label: 'Prime Locations', value: '25+', color: 'var(--primary-light)' },
    { icon: TrendingUp, label: 'Estates Sold', value: '1,200+', color: '#f59e0b' }
];

const features = [
    { icon: Zap, title: 'Smart Curation', desc: 'Our algorithm precisely matches your lifestyle preferences to exclusive properties and elegant PGs.', color: 'var(--primary)' },
    { icon: Shield, title: 'Verified Estates', desc: 'Every listed property undergoes a rigorous verification process to ensure unparalleled quality.', color: '#94a3b8' },
    { icon: BarChart3, title: 'Market Intelligence', desc: 'Make informed decisions backed by our robust real-time market data and predictive analytics.', color: 'var(--primary)' }
];

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [featuredProperties, setFeaturedProperties] = useState([]);
    const [featuredPGs, setFeaturedPGs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const [propRes, pgRes] = await Promise.all([
                    api.get('/properties/featured'),
                    api.get('/pgs/featured')
                ]);
                setFeaturedProperties(propRes.data.properties || []);
                setFeaturedPGs(pgRes.data.pgs || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchType === 'pg') {
            navigate(`/pgs?search=${encodeURIComponent(searchQuery)}`);
        } else {
            navigate(`/properties?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div style={{ paddingTop: 0 }}>
            {/* HERO */}
            <section style={{
                minHeight: '90vh',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                backgroundImage: 'linear-gradient(rgba(9, 9, 11, 0.7), rgba(9, 9, 11, 0.95)), url("https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}>

                <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: 100, paddingBottom: 80 }}>
                    <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
                        {/* Tag */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid var(--primary)', borderRadius: 2, padding: '6px 16px', marginBottom: 28, fontSize: 11, textTransform: 'uppercase', letterSpacing: 3, color: 'var(--primary)' }}>
                            <Building2 size={14} />
                            Premium Real Estate
                        </div>

                        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(36px, 7vw, 68px)', fontWeight: 400, lineHeight: 1.1, marginBottom: 20, color: 'white' }}>
                            Discover Your
                            <span style={{ display: 'block', color: 'var(--primary)', fontWeight: 600, fontStyle: 'italic' }}>
                                Extraordinary Home
                            </span>
                        </h1>

                        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.8, maxWidth: 580, margin: '0 auto 40px' }}>
                            Explore an exclusive collection of luxury properties, estates, and premium residences tailored to your distinguished lifestyle.
                        </p>

                        {/* Search Box */}
                        <form onSubmit={handleSearch} style={{
                            background: 'rgba(20, 20, 21, 0.95)',
                            border: '1px solid var(--dark-border)',
                            borderRadius: 4,
                            padding: 8,
                            display: 'flex',
                            gap: 8,
                            alignItems: 'center',
                            maxWidth: 660,
                            margin: '0 auto',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                        }}>
                            <select
                                value={searchType}
                                onChange={e => setSearchType(e.target.value)}
                                style={{ background: 'transparent', border: '1px solid var(--dark-border)', borderRadius: 4, color: 'var(--primary)', padding: '10px 14px', fontSize: 14, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                            >
                                <option value="all">All</option>
                                <option value="property">Property</option>
                                <option value="pg">PG / Hostel</option>
                            </select>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px' }}>
                                <Search size={18} color="#6b7298" />
                                <input
                                    type="text"
                                    placeholder="Search by location, area, or college..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 15, fontFamily: 'inherit' }}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ borderRadius: 4, padding: '12px 28px', whiteSpace: 'nowrap' }}>
                                Search
                            </button>
                        </form>

                        {/* Quick search tags */}
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
                            {['Kothrud', 'Hinjewadi', 'Viman Nagar', 'Koregaon Park', 'Baner'].map(area => (
                                <button key={area} onClick={() => navigate(`/properties?city=${area}`)}
                                    style={{ background: 'transparent', border: '1px solid var(--dark-border)', borderRadius: 4, padding: '6px 16px', color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
                                    onMouseEnter={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.color = 'var(--primary)'; }}
                                    onMouseLeave={e => { e.target.style.borderColor = 'var(--dark-border)'; e.target.style.color = 'var(--text-secondary)'; }}>
                                    {area}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS */}
            <section style={{ padding: '60px 0', background: 'var(--dark-card)', borderTop: '1px solid var(--dark-border)', borderBottom: '1px solid var(--dark-border)' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
                        {stats.map((stat, i) => (
                            <div key={i} style={{ textAlign: 'center', padding: '24px 16px' }}>
                                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'transparent', border: `1px solid ${stat.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                                    <stat.icon size={22} color={stat.color} />
                                </div>
                                <div style={{ fontSize: 26, fontWeight: 300, fontFamily: 'Outfit, sans-serif', color: stat.color, marginBottom: 4 }}>{stat.value}</div>
                                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-secondary)' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <style>{`@media(max-width:768px){.container > div { grid-template-columns: repeat(2,1fr) !important; }}`}</style>
            </section>

            {/* FEATURED PROPERTIES */}
            <section className="section">
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, borderBottom: '1px solid var(--dark-border)', paddingBottom: 16 }}>
                        <div>
                            <p style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>Curated Collection</p>
                            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 400, color: 'white' }}>Featured Residences</h2>
                        </div>
                        <Link to="/properties" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
                            View Portfolio <ArrowRight size={16} />
                        </Link>
                    </div>
                    {loading ? (
                        <div style={{ display: 'flex', gap: 24 }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="glass-card" style={{ flex: 1, height: 400, background: 'rgba(201, 163, 94,0.05)' }} />
                            ))}
                        </div>
                    ) : featuredProperties.length > 0 ? (
                        <div className="grid-3">
                            {featuredProperties.slice(0, 3).map(prop => (
                                <PropertyCard key={prop._id} property={prop} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Building2 size={48} color="#6b7298" />
                            <p>No featured properties yet. Check back soon!</p>
                            <Link to="/properties" className="btn btn-primary">Browse All Properties</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* FEATURED PGs */}
            <section className="section" style={{ paddingTop: 0 }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, borderBottom: '1px solid var(--dark-border)', paddingBottom: 16 }}>
                        <div>
                            <p style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>Executive Living</p>
                            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 400, color: 'white' }}>Premium Accommodations</h2>
                        </div>
                        <Link to="/pgs" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
                            View Directory <ArrowRight size={16} />
                        </Link>
                    </div>
                    {loading ? (
                        <div style={{ display: 'flex', gap: 24 }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="glass-card" style={{ flex: 1, height: 400, background: 'rgba(201, 163, 94,0.05)' }} />
                            ))}
                        </div>
                    ) : featuredPGs.length > 0 ? (
                        <div className="grid-3">
                            {featuredPGs.slice(0, 3).map(pg => (
                                <PGCard key={pg._id} pg={pg} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Users size={48} color="#6b7298" />
                            <p>No featured PGs yet. Connect your MongoDB to see data!</p>
                            <Link to="/pgs" className="btn btn-primary">Browse All PGs</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* WHY ESTATEXAI */}
            <section className="section" style={{ background: 'var(--dark-card)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 60 }}>
                        <p style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>The EstateXAi Difference</p>
                        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 300, color: 'white' }}>
                            Uncompromising <span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Quality</span>
                        </h2>
                    </div>
                    <div className="grid-3">
                        {features.map((f, i) => (
                            <div key={i} className="glass-card" style={{ padding: 40, textAlign: 'center', borderRadius: 4, border: '1px solid var(--dark-border)' }}>
                                <div style={{ width: 64, height: 64, borderRadius: '50%', border: `1px solid ${f.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                    <f.icon size={26} color={f.color} strokeWidth={1.5} />
                                </div>
                                <h3 style={{ fontSize: 16, fontWeight: 400, textTransform: 'uppercase', letterSpacing: 1, color: 'white', marginBottom: 16 }}>{f.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 14, fontWeight: 300 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section">
                <div className="container">
                    <div style={{
                        background: 'var(--dark-card)',
                        border: '1px solid var(--primary)',
                        borderRadius: 4,
                        padding: 'clamp(40px, 6vw, 80px)',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <p style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 16 }}>Exclusive Network</p>
                        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 300, color: 'white', marginBottom: 20 }}>
                            List Your Property with <span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>EstateXAi</span>
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 40, maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.8, fontWeight: 300 }}>
                            Join an elite directory of premium properties. Connect with qualified buyers and distinguished tenants effortlessly.
                        </p>
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, borderRadius: 2 }}>
                                Become a Partner
                            </Link>
                            <Link to="/properties" className="btn btn-ghost" style={{ padding: '14px 32px', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, borderRadius: 2, border: '1px solid var(--primary)', color: 'var(--primary)' }}>
                                Explore Directory
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
