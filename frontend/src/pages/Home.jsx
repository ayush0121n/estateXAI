/* eslint-disable */
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Search, Building2, Users, TrendingUp, MapPin, ArrowRight, Star, Shield, Zap, BarChart3, Heart, FileText, Tag, ShieldCheck, UserCheck, Home as HomeIcon, BadgeCheck, Banknote } from 'lucide-react';
import api from '../utils/api';
import { PropertyCard, PGCard, SkeletonCard } from '../components/ListingCard';
import DepthCarousel from '../components/DepthCarousel';
import HeroParallaxDemo from '../components/HeroParallaxDemo';

const carouselItems = [
  { image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800', alt: 'Luxury Home 1' },
  { image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800', alt: 'Luxury Home 2' },
  { image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800', alt: 'Luxury Home 3' },
  { image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800', alt: 'Luxury Home 4' },
  { image: 'https://images.unsplash.com/photo-1600566753086-00f18efc2294?auto=format&fit=crop&q=80&w=800', alt: 'Luxury Home 5' }
];

const CITIES = [
    { name: 'Bangalore', emoji: '🏙️', localities: ['Koramangala', 'Whitefield', 'Indiranagar', 'HSR Layout', 'Electronic City'] },
    { name: 'Pune', emoji: '🏔️', localities: ['Hinjewadi', 'Kothrud', 'Viman Nagar', 'Baner', 'Koregaon Park'] },
    { name: 'Hyderabad', emoji: '🕌', localities: ['Gachibowli', 'Hitech City', 'Madhapur', 'Kondapur', 'Kukatpally'] },
    { name: 'Mumbai', emoji: '🌊', localities: ['Andheri', 'Bandra', 'Powai', 'Malad', 'Thane'] },
    { name: 'Delhi NCR', emoji: '🏛️', localities: ['Gurgaon', 'Noida', 'Dwarka', 'Saket', 'Greater Noida'] },
    { name: 'Chennai', emoji: '🛕', localities: ['OMR', 'Velachery', 'T Nagar', 'Anna Nagar', 'Adyar'] },
    { name: 'Kolkata', emoji: '🌉', localities: ['Salt Lake', 'New Town', 'Park Street', 'Howrah', 'Dumdum'] },
    { name: 'Ahmedabad', emoji: '🏗️', localities: ['SG Highway', 'Prahlad Nagar', 'Satellite', 'Vastrapur', 'Bodakdev'] },
    { name: 'Jaipur', emoji: '🏰', localities: ['Malviya Nagar', 'Vaishali', 'C Scheme', 'Mansarovar'] },
    { name: 'Indore', emoji: '🍜', localities: ['Vijay Nagar', 'AB Road', 'Palasia', 'Scheme 78'] },
];

const stats = [
    { icon: Building2, label: 'Verified Properties', value: '2,400+', color: 'var(--primary)' },
    { icon: Users, label: 'Active Users', value: '8,500+', color: '#94a3b8' },
    { icon: MapPin, label: 'Cities Covered', value: '10+', color: 'var(--primary-light)' },
    { icon: TrendingUp, label: 'Zero Brokerage Deals', value: '1,200+', color: '#f59e0b' }
];

const problemSolutions = [
    { icon: Banknote, problem: 'High Deposits (6-10× rent)', solution: 'Deposit Calculator + Low Deposit filter', color: '#f59e0b' },
    { icon: Tag, problem: 'Heavy Brokerage (1 month rent)', solution: 'Strong Zero Brokerage badge + Direct Owner', color: '#4ade80' },
    { icon: UserCheck, problem: 'Bachelor / Single Discrimination', solution: 'Bachelor Friendly & All Welcome tags', color: '#c084fc' },
    { icon: ShieldCheck, problem: 'Fake Listings & Scams', solution: 'Verified listings + ID verification', color: '#60a5fa' },
    { icon: Heart, problem: 'Bad Roommate Matches', solution: 'AI lifestyle matching with compatibility %', color: '#f87171' },
    { icon: BadgeCheck, problem: 'No Rental Reputation', solution: 'Tenant Trust Score system', color: 'var(--primary)' },
];

const features = [
    { icon: Zap, title: 'Lifestyle Matching', desc: 'Our AI matches flatmates on diet, sleep, cleanliness, budget & more — not just location.', color: 'var(--primary)' },
    { icon: Shield, title: 'Verified & Trusted', desc: 'Every listing can be verified. Trust badges show Zero Brokerage, Bachelor Friendly, and more.', color: '#94a3b8' },
    { icon: BarChart3, title: 'AI Rent Predictor', desc: 'Know the fair rent for any locality. Get negotiation tips backed by real market data.', color: 'var(--primary)' }
];

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [searchCity, setSearchCity] = useState(localStorage.getItem('userCity') || '');
    const [featuredProperties, setFeaturedProperties] = useState([]);
    const [featuredPGs, setFeaturedPGs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredCity, setHoveredCity] = useState(null);
    const navigate = useNavigate();

    const handleCityChange = (val) => {
        setSearchCity(val);
        localStorage.setItem('userCity', val);
    };

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
        const cityParam = searchCity ? `&city=${encodeURIComponent(searchCity)}` : '';
        if (searchType === 'pg') {
            navigate(`/pgs?search=${encodeURIComponent(searchQuery)}${cityParam}`);
        } else if (searchType === 'flatmate') {
            navigate(`/roommates`);
        } else {
            navigate(`/properties?search=${encodeURIComponent(searchQuery)}${cityParam}`);
        }
    };

    return (
        <div style={{ paddingTop: 0 }}>
            <HeroParallaxDemo />
            
            {/* HERO */}
            <section className="hero-section" style={{
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
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}
                    >
                        {/* Tag */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid var(--primary)', borderRadius: 2, padding: '6px 16px', marginBottom: 28, fontSize: 11, textTransform: 'uppercase', letterSpacing: 3, color: 'var(--primary)' }}>
                            <Building2 size={14} />
                            India's Most Trusted Rental Platform
                        </div>

                        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(36px, 7vw, 68px)', fontWeight: 400, lineHeight: 1.1, marginBottom: 20, color: 'white' }}>
                            Find Your
                            <span style={{ display: 'block', color: 'var(--primary)', fontWeight: 600, fontStyle: 'italic' }}>
                                Perfect Home
                            </span>
                        </h1>

                        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.8, maxWidth: 580, margin: '0 auto 40px' }}>
                            Properties, PGs, and Flatmates across 10+ Indian cities. Zero brokerage. Verified listings. Lifestyle-matched roommates.
                        </p>

                        {/* Search Box with City Selector */}
                        <form onSubmit={handleSearch} className="hero-search-form" style={{
                            background: 'rgba(20, 20, 21, 0.95)',
                            border: '1px solid var(--dark-border)',
                            borderRadius: 4,
                            padding: 8,
                            display: 'flex',
                            gap: 8,
                            alignItems: 'center',
                            maxWidth: 720,
                            margin: '0 auto',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                            flexWrap: 'wrap'
                        }}>
                            <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: 12 }}>
                                <MapPin size={20} color="#b0b7d3" />
                                <select value={searchCity} onChange={e => handleCityChange(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', color: searchCity ? 'white' : '#b0b7d3', outline: 'none', fontSize: 16 }}>
                                    <option value="">All Cities</option>
                                    {CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <select
                                value={searchType}
                                onChange={e => setSearchType(e.target.value)}
                                style={{ background: 'transparent', border: '1px solid var(--dark-border)', borderRadius: 4, color: 'var(--primary)', padding: '10px 14px', fontSize: 14, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                            >
                                <option value="all">All</option>
                                <option value="property">Property</option>
                                <option value="pg">PG / Hostel</option>
                                <option value="flatmate">Flatmate</option>
                            </select>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', minWidth: 180 }}>
                                <Search size={18} color="#6b7298" />
                                <input
                                    type="text"
                                    placeholder="Search by locality, area, or landmark..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 15, fontFamily: 'inherit' }}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ borderRadius: 4, padding: '12px 28px', whiteSpace: 'nowrap' }}>
                                Search
                            </button>
                        </form>

                        {/* Quick search tags - city-aware */}
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
                            {(searchCity ? (CITIES.find(c => c.name === searchCity)?.localities || []).slice(0, 5) : ['Koramangala', 'Hinjewadi', 'Hitech City', 'Bandra', 'Gurgaon']).map(area => (
                                <button key={area} onClick={() => navigate(`/properties?city=${encodeURIComponent(searchCity || area)}&search=${encodeURIComponent(area)}`)}
                                    style={{ background: 'transparent', border: '1px solid var(--dark-border)', borderRadius: 4, padding: '6px 16px', color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
                                    onMouseEnter={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.color = 'var(--primary)'; }}
                                    onMouseLeave={e => { e.target.style.borderColor = 'var(--dark-border)'; e.target.style.color = 'var(--text-secondary)'; }}>
                                    {area}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* STATS */}
            <section style={{ padding: 'clamp(40px, 5vw, 60px) 0', background: 'var(--dark-card)', borderTop: '1px solid var(--dark-border)', borderBottom: '1px solid var(--dark-border)' }}>
                <div className="container">
                    <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
                        {stats.map((stat, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                style={{ textAlign: 'center', padding: '24px 16px' }}
                            >
                                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'transparent', border: `1px solid ${stat.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                                    <stat.icon size={22} color={stat.color} />
                                </div>
                                <div style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 300, fontFamily: 'Outfit, sans-serif', color: stat.color, marginBottom: 4 }}>{stat.value}</div>
                                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-secondary)' }}>{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PAN-INDIA CITY SELECTOR */}
            <section style={{ padding: 'clamp(40px, 5vw, 70px) 0', background: 'var(--dark)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>Pan-India Coverage</p>
                    <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: 400, color: 'white', lineHeight: 1.2, marginBottom: 12 }}>Explore Properties Across <span style={{ color: 'var(--primary)', fontWeight: 600 }}>India</span></h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 500, margin: '0 auto 36px' }}>Select your city to find properties, PGs, and flatmates near you.</p>
                    
                    <div className="city-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, maxWidth: 900, margin: '0 auto' }}>
                        {CITIES.map(city => (
                            <motion.button
                                key={city.name}
                                onClick={() => navigate(`/properties?city=${encodeURIComponent(city.name)}`)}
                                onMouseEnter={() => setHoveredCity(city.name)}
                                onMouseLeave={() => setHoveredCity(null)}
                                whileHover={{ y: -4, borderColor: 'var(--primary)' }}
                                whileTap={{ scale: 0.97 }}
                                className="city-card"
                            >
                                <div style={{ fontSize: 28, marginBottom: 8 }}>{city.emoji}</div>
                                <div style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{city.name}</div>
                                {hoveredCity === city.name && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                        {city.localities.slice(0, 3).join(' • ')}
                                    </motion.div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </section>

            {/* WHY ESTATEXAI – SOLVING REAL INDIAN PROBLEMS */}
            <section style={{ padding: 'clamp(40px, 5vw, 70px) 0', background: 'var(--dark-card)', borderTop: '1px solid var(--dark-border)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <p style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>Why EstateXAi?</p>
                        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: 400, color: 'white', lineHeight: 1.2, marginBottom: 12 }}>
                            We Solve <span style={{ color: 'var(--primary)', fontWeight: 600, fontStyle: 'italic' }}>Real Problems</span> Indian Renters Face
                        </h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, maxWidth: 1000, margin: '0 auto' }}>
                        {problemSolutions.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.08 }}
                                style={{
                                    display: 'flex', gap: 16, padding: '20px', borderRadius: 12,
                                    border: '1px solid var(--dark-border)', background: 'rgba(255,255,255,0.02)',
                                    transition: 'border-color 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = `${item.color}40`}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--dark-border)'}
                            >
                                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${item.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <item.icon size={20} color={item.color} />
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, textDecoration: 'line-through', opacity: 0.7 }}>
                                        {item.problem}
                                    </div>
                                    <div style={{ color: item.color, fontSize: 14, fontWeight: 600 }}>
                                        ✓ {item.solution}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* VISUAL CAROUSEL */}
            <section className="section" style={{ padding: 'clamp(40px, 8vw, 80px) 0', background: 'var(--dark)', borderBottom: '1px solid var(--dark-border)' }}>
                <div className="container" style={{ textAlign: 'center', marginBottom: 'clamp(20px, 5vw, 40px)', padding: '0 20px' }}>
                    <p style={{ color: 'var(--primary)', fontSize: 'clamp(10px, 2vw, 11px)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>Visual Tour</p>
                    <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(28px, 6vw, 42px)', fontWeight: 400, color: 'white', lineHeight: 1.2 }}>Exceptional Architecture</h2>
                </div>
                <div style={{ height: 'clamp(380px, 60vh, 500px)', position: 'relative', width: '100%', overflow: 'hidden' }}>
                  <DepthCarousel
                    items={carouselItems}
                    depth={220}
                    spread={90}
                    tilt={22}
                    tiltDirection="right"
                    perspective={1400}
                    visibleCards={typeof window !== 'undefined' && window.innerWidth < 768 ? 2 : 4}
                    falloff={0.2}
                    blur={6}
                    autoplay={true}
                    loop
                    cardWidth={typeof window !== 'undefined' && window.innerWidth < 768 ? 260 : 300}
                    cardHeight={typeof window !== 'undefined' && window.innerWidth < 768 ? 340 : 380}
                    radius={18}
                    tint="#05060a"
                    duration={700}
                    ease="power3.out"
                    autoplayDelay={3200}
                    showControls={typeof window !== 'undefined' && window.innerWidth > 768}
                    showIndicators
                  />
                </div>
            </section>

            {/* FEATURED PROPERTIES */}
            <section className="section">
                <div className="container">
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, borderBottom: '1px solid var(--dark-border)', paddingBottom: 16 }}>
                        <div>
                            <p style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>Curated Collection</p>
                            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 400, color: 'white' }}>Featured Residences</h2>
                        </div>
                        <Link to="/properties" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
                            View Portfolio <ArrowRight size={16} />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="grid-3">
                            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
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
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, borderBottom: '1px solid var(--dark-border)', paddingBottom: 16 }}>
                        <div>
                            <p style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>Executive Living</p>
                            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 400, color: 'white' }}>Premium Accommodations</h2>
                        </div>
                        <Link to="/pgs" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
                            View Directory <ArrowRight size={16} />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="grid-3">
                            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
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

            {/* DIGITAL RENTAL TOOLKIT PROMO */}
            <section className="section" style={{ paddingTop: 0 }}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(201,163,94,0.08), rgba(201,163,94,0.02))',
                            border: '1px solid rgba(201,163,94,0.2)',
                            borderRadius: 16,
                            padding: 'clamp(32px, 5vw, 56px)',
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: 40,
                            alignItems: 'center'
                        }}
                    >
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(201,163,94,0.1)', borderRadius: 20, padding: '4px 14px', marginBottom: 16 }}>
                                <FileText size={14} color="var(--primary)" />
                                <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>FREE TOOLS</span>
                            </div>
                            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 600, color: 'white', marginBottom: 12 }}>
                                Digital Rental Toolkit
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 24, maxWidth: 500 }}>
                                Free rental agreement generator, rent receipts for tax benefits, police verification checklist, and move-in checklist. Everything an Indian renter needs.
                            </p>
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                <Link to="/rental-toolkit" className="btn btn-primary" style={{ borderRadius: 8, padding: '12px 28px' }}>
                                    Open Toolkit <ArrowRight size={16} />
                                </Link>
                                <Link to="/roommates" className="btn btn-ghost" style={{ borderRadius: 8, padding: '12px 28px', border: '1px solid var(--dark-border)' }}>
                                    <Heart size={16} /> Find Flatmates
                                </Link>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="desktop-nav">
                            {[
                                { icon: '📝', label: 'Rental Agreement', sub: 'Generate in seconds' },
                                { icon: '🧾', label: 'Rent Receipts', sub: 'For tax benefits' },
                                { icon: '🛡️', label: 'Police Verification', sub: 'State-wise guide' },
                                { icon: '✅', label: 'Move-in Checklist', sub: 'Never miss anything' }
                            ].map((tool, i) => (
                                <div key={i} style={{ padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, marginBottom: 6 }}>{tool.icon}</div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{tool.label}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tool.sub}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* WHY ESTATEXAI FEATURES */}
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
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: i * 0.15 }}
                                className="glass-card" 
                                style={{ padding: 40, textAlign: 'center', borderRadius: 4, border: '1px solid var(--dark-border)' }}
                            >
                                <div style={{ width: 64, height: 64, borderRadius: '50%', border: `1px solid ${f.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                    <f.icon size={26} color={f.color} strokeWidth={1.5} />
                                </div>
                                <h3 style={{ fontSize: 16, fontWeight: 400, textTransform: 'uppercase', letterSpacing: 1, color: 'white', marginBottom: 16 }}>{f.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 14, fontWeight: 300 }}>{f.desc}</p>
                            </motion.div>
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
                        <div className="cta-buttons" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
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
