import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Building2, Users, TrendingUp, MapPin, ArrowRight, Star, Shield, Zap, BarChart3 } from 'lucide-react';
import api from '../utils/api';
import { PropertyCard, PGCard } from '../components/ListingCard';

const stats = [
    { icon: Building2, label: 'Properties Listed', value: '2,400+', color: '#6c63ff' },
    { icon: Users, label: 'Happy Tenants', value: '8,500+', color: '#43e5f7' },
    { icon: MapPin, label: 'Cities Covered', value: '15+', color: '#ff6584' },
    { icon: TrendingUp, label: 'Deals Closed', value: '1,200+', color: '#ffd700' }
];

const features = [
    { icon: Zap, title: 'AI-Smart Recommendations', desc: 'Our engine analyzes your institution & workplace to suggest the perfect PG near you — instantly.', color: '#6c63ff' },
    { icon: Shield, title: 'Verified Listings', desc: 'Every property and PG is verified with standardized details including amenities, food, and rules.', color: '#43e5f7' },
    { icon: BarChart3, title: 'Unified Platform', desc: 'Buy, rent, or find PGs. All in one platform. No more hopping between multiple portals.', color: '#ff6584' }
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
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: 'radial-gradient(ellipse at 20% 50%, rgba(108, 99, 255, 0.25) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(67, 229, 247, 0.12) 0%, transparent 50%), #0a0b1e'
            }}>
                {/* Animated bg circles */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            borderRadius: '50%',
                            background: `radial-gradient(circle, rgba(108,99,255,${0.05 + i * 0.02}) 0%, transparent 70%)`,
                            width: `${200 + i * 150}px`,
                            height: `${200 + i * 150}px`,
                            top: `${10 + i * 15}%`,
                            left: `${5 + i * 18}%`,
                            animation: `float ${4 + i * 1.5}s ease-in-out infinite`,
                            animationDelay: `${i * 0.8}s`
                        }} />
                    ))}
                </div>

                <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: 100, paddingBottom: 80 }}>
                    <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
                        {/* Tag */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 20, padding: '6px 16px', marginBottom: 28, fontSize: 13, color: '#8b85ff' }}>
                            <Zap size={14} />
                            AI-Powered Real Estate Platform
                        </div>

                        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20, color: 'white' }}>
                            Find Your
                            <span style={{ display: 'block', background: 'linear-gradient(135deg, #6c63ff 0%, #43e5f7 50%, #ff6584 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                Perfect Space
                            </span>
                        </h1>

                        <p style={{ fontSize: 18, color: '#b0b7d3', marginBottom: 40, lineHeight: 1.8, maxWidth: 580, margin: '0 auto 40px' }}>
                            Buy, rent properties or discover PGs & hostels near your college or workplace. All in one AI-powered platform.
                        </p>

                        {/* Search Box */}
                        <form onSubmit={handleSearch} style={{
                            background: 'rgba(17,19,38,0.8)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(108,99,255,0.3)',
                            borderRadius: 20,
                            padding: 8,
                            display: 'flex',
                            gap: 8,
                            alignItems: 'center',
                            maxWidth: 660,
                            margin: '0 auto',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(108,99,255,0.1)'
                        }}>
                            <select
                                value={searchType}
                                onChange={e => setSearchType(e.target.value)}
                                style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 12, color: 'white', padding: '10px 14px', fontSize: 14, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
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
                            <button type="submit" className="btn btn-primary" style={{ borderRadius: 12, padding: '12px 24px', whiteSpace: 'nowrap' }}>
                                Search
                            </button>
                        </form>

                        {/* Quick search tags */}
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
                            {['Kothrud', 'Hinjewadi', 'Viman Nagar', 'Koregaon Park', 'Baner'].map(area => (
                                <button key={area} onClick={() => navigate(`/properties?city=${area}`)}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '6px 14px', color: '#b0b7d3', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
                                    onMouseEnter={e => { e.target.style.background = 'rgba(108,99,255,0.15)'; e.target.style.borderColor = 'rgba(108,99,255,0.4)'; e.target.style.color = '#8b85ff'; }}
                                    onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.color = '#b0b7d3'; }}>
                                    {area}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS */}
            <section style={{ padding: '60px 0', background: 'rgba(17,19,38,0.5)', borderTop: '1px solid rgba(108,99,255,0.1)', borderBottom: '1px solid rgba(108,99,255,0.1)' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
                        {stats.map((stat, i) => (
                            <div key={i} style={{ textAlign: 'center', padding: '24px 16px' }}>
                                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${stat.color}20`, border: `1px solid ${stat.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                                    <stat.icon size={24} color={stat.color} />
                                </div>
                                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: stat.color, marginBottom: 4 }}>{stat.value}</div>
                                <div style={{ fontSize: 14, color: '#6b7298' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <style>{`@media(max-width:768px){.container > div { grid-template-columns: repeat(2,1fr) !important; }}`}</style>
            </section>

            {/* FEATURED PROPERTIES */}
            <section className="section">
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
                        <div>
                            <p style={{ color: '#6c63ff', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Handpicked for You</p>
                            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: 'white' }}>Featured Properties</h2>
                        </div>
                        <Link to="/properties" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6c63ff', fontSize: 14, fontWeight: 600 }}>
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    {loading ? (
                        <div style={{ display: 'flex', gap: 24 }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="glass-card" style={{ flex: 1, height: 400, background: 'rgba(108,99,255,0.05)' }} />
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
                        <div>
                            <p style={{ color: '#43e5f7', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Student & Professional Living</p>
                            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: 'white' }}>Top PGs & Hostels</h2>
                        </div>
                        <Link to="/pgs" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#43e5f7', fontSize: 14, fontWeight: 600 }}>
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    {loading ? (
                        <div style={{ display: 'flex', gap: 24 }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="glass-card" style={{ flex: 1, height: 400, background: 'rgba(108,99,255,0.05)' }} />
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
            <section className="section" style={{ background: 'rgba(17,19,38,0.4)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 60 }}>
                        <p style={{ color: '#6c63ff', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Why Choose Us</p>
                        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, color: 'white' }}>
                            The Smarter Way to
                            <span className="gradient-text"> Find Home</span>
                        </h2>
                    </div>
                    <div className="grid-3">
                        {features.map((f, i) => (
                            <div key={i} className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
                                <div style={{ width: 64, height: 64, borderRadius: 20, background: `${f.color}20`, border: `1px solid ${f.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'glow-pulse 3s ease-in-out infinite', animationDelay: `${i * 0.5}s` }}>
                                    <f.icon size={28} color={f.color} />
                                </div>
                                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 12 }}>{f.title}</h3>
                                <p style={{ color: '#6b7298', lineHeight: 1.8, fontSize: 14 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section">
                <div className="container">
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(108,99,255,0.3) 0%, rgba(67,229,247,0.15) 50%, rgba(255,101,132,0.1) 100%)',
                        border: '1px solid rgba(108,99,255,0.3)',
                        borderRadius: 28,
                        padding: 'clamp(40px, 6vw, 80px)',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
                        <p style={{ color: '#6c63ff', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Own a Property?</p>
                        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, color: 'white', marginBottom: 16 }}>
                            List Your Property for Free
                        </h2>
                        <p style={{ color: '#b0b7d3', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.8 }}>
                            Reach thousands of potential buyers and tenants. Manage inquiries from a single dashboard.
                        </p>
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 16, borderRadius: 14 }}>
                                Get Started — It's Free
                            </Link>
                            <Link to="/properties" className="btn btn-ghost" style={{ padding: '14px 32px', fontSize: 16, borderRadius: 14 }}>
                                Browse Listings
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
