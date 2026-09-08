/* eslint-disable */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Building2, Users, MessageSquare, TrendingUp, Plus, Star, Eye, MapPin, Zap, ShieldCheck, Heart, FileText, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminDashboardTab from '../components/AdminDashboardTab';

export default function Dashboard() {
    const { user } = useAuth();
    const [myProperties, setMyProperties] = useState([]);
    const [myPGs, setMyPGs] = useState([]);
    const [myInquiries, setMyInquiries] = useState([]);
    const [receivedInquiries, setReceivedInquiries] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [savedProperties, setSavedProperties] = useState([]);
    const [savedPGs, setSavedPGs] = useState([]);
    const [fullProfile, setFullProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const promises = [
                    api.get('/inquiries/my'),
                    api.get('/recommendations/pgs'),
                    api.get('/user/profile')
                ];
                if (user.role === 'owner' || user.role === 'admin') {
                    promises.push(api.get('/properties/owner/listings'));
                    promises.push(api.get('/pgs/owner/listings'));
                    promises.push(api.get('/inquiries/received'));
                }
                const results = await Promise.allSettled(promises);
                if (results[0].status === 'fulfilled') setMyInquiries(results[0].value.data.inquiries || []);
                if (results[1].status === 'fulfilled') setRecommendations(results[1].value.data.pgs || []);
                if (results[2].status === 'fulfilled') {
                    setSavedProperties(results[2].value.data.user?.savedProperties || []);
                    setSavedPGs(results[2].value.data.user?.savedPGs || []);
                    setFullProfile(results[2].value.data.user);
                }
                if (results[3]?.status === 'fulfilled') setMyProperties(results[3].value.data.properties || []);
                if (results[4]?.status === 'fulfilled') setMyPGs(results[4].value.data.pgs || []);
                if (results[5]?.status === 'fulfilled') setReceivedInquiries(results[5].value.data.inquiries || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const Tab = ({ id, label, icon: Icon }) => (
        <button onClick={() => setActiveTab(id)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, transition: 'all 0.2s', background: activeTab === id ? 'rgba(201, 163, 94,0.2)' : 'transparent', color: activeTab === id ? 'var(--primary)' : '#6b7298', borderBottom: activeTab === id ? '2px solid var(--primary)' : '2px solid transparent' }}>
            <Icon size={16} /> {label}
        </button>
    );

    // Calculate a mock Trust Score based on profile completeness for now (Phase 3 will be actual backend score)
    const calculateTrustScore = () => {
        let score = 40; // Base score
        if (fullProfile?.isPhoneVerified) score += 20;
        if (fullProfile?.email) score += 10;
        if (fullProfile?.institution || fullProfile?.workplace) score += 15;
        if (fullProfile?.avatar) score += 5;
        if (fullProfile?.roommateProfile?.bio) score += 10;
        return Math.min(score, 100);
    };

    const trustScore = calculateTrustScore();
    const isOwner = user.role === 'owner' || user.role === 'admin';

    if (loading) return <div className="loader"><div className="spinner" /></div>;

    return (
        <div style={{ paddingTop: 90, minHeight: '100vh', background: 'var(--dark)' }}>
            <div className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>
                {/* Header */}
                <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
                    <div>
                        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, color: 'white', marginBottom: 4 }}>
                            Welcome back, {user.name?.split(' ')[0]}! 👋
                        </h1>
                        <p style={{ color: '#6b7298' }}>
                            {user.role === 'admin' ? '🛡️ Admin Dashboard' : isOwner ? '🏠 Owner Dashboard' : '🔍 Tenant Dashboard'}
                        </p>
                    </div>
                    {isOwner ? (
                        <div className="dashboard-actions" style={{ display: 'flex', gap: 12 }}>
                            <Link to="/list-property" className="btn btn-primary" style={{ fontSize: 14 }}>
                                <Plus size={16} /> List Property
                            </Link>
                            <Link to="/list-pg" className="btn btn-secondary" style={{ fontSize: 14 }}>
                                <Plus size={16} /> List PG
                            </Link>
                        </div>
                    ) : (
                        <div className="dashboard-actions" style={{ display: 'flex', gap: 12 }}>
                            <Link to="/toolkit" className="btn btn-primary" style={{ fontSize: 14 }}>
                                <FileText size={16} /> Rental Toolkit
                            </Link>
                            <Link to="/find-flatmates" className="btn btn-secondary" style={{ fontSize: 14 }}>
                                <Users size={16} /> Find Flatmates
                            </Link>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="stats-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 36 }}>
                    {isOwner ? (
                        <>
                            <div className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 14, background: `rgba(201,163,94,0.1)`, border: `1px solid rgba(201,163,94,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Building2 size={22} color="var(--primary)" />
                                </div>
                                <div>
                                    <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'white' }}>{myProperties.length}</div>
                                    <div style={{ fontSize: 12, color: '#6b7298' }}>Properties</div>
                                </div>
                            </div>
                            <div className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 14, background: `rgba(223,194,136,0.1)`, border: `1px solid rgba(223,194,136,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Users size={22} color="var(--primary-light)" />
                                </div>
                                <div>
                                    <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'white' }}>{myPGs.length}</div>
                                    <div style={{ fontSize: 12, color: '#6b7298' }}>PG Listings</div>
                                </div>
                            </div>
                            <div className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 14, background: `rgba(34,211,165,0.1)`, border: `1px solid rgba(34,211,165,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <TrendingUp size={22} color="#22d3a5" />
                                </div>
                                <div>
                                    <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'white' }}>{receivedInquiries.length}</div>
                                    <div style={{ fontSize: 12, color: '#6b7298' }}>Leads Received</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 14, background: `rgba(239,68,68,0.1)`, border: `1px solid rgba(239,68,68,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Heart size={22} color="#ef4444" />
                                </div>
                                <div>
                                    <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'white' }}>{savedProperties.length + savedPGs.length}</div>
                                    <div style={{ fontSize: 12, color: '#6b7298' }}>Saved Items</div>
                                </div>
                            </div>
                            <div className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 14, background: `rgba(201,163,94,0.1)`, border: `1px solid rgba(201,163,94,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MessageSquare size={22} color="var(--primary)" />
                                </div>
                                <div>
                                    <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'white' }}>{myInquiries.length}</div>
                                    <div style={{ fontSize: 12, color: '#6b7298' }}>Inquiries Sent</div>
                                </div>
                            </div>
                        </>
                    )}
                    
                    {/* Trust Score Card */}
                    <div className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(135deg, rgba(34,211,165,0.05), rgba(16,185,129,0.05))', border: '1px solid rgba(34,211,165,0.2)' }}>
                        <div style={{ position: 'relative', width: 56, height: 56 }}>
                            <svg width="56" height="56" viewBox="0 0 64 64">
                                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(34,211,165,0.1)" strokeWidth="6" />
                                <circle cx="32" cy="32" r="26" fill="none" stroke="#22d3a5" strokeWidth="6"
                                    strokeDasharray={`${(trustScore / 100) * 163} 163`}
                                    strokeLinecap="round" transform="rotate(-90 32 32)"
                                />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#22d3a5' }}>
                                {trustScore}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>Trust Score <ShieldCheck size={14} color="#22d3a5" /></div>
                            <div style={{ fontSize: 11, color: '#6b7298', marginTop: 2 }}>
                                {trustScore < 60 ? 'Complete profile to increase' : trustScore < 85 ? 'Good standing' : 'Excellent standing'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="dashboard-tabs" style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(201, 163, 94,0.15)', marginBottom: 28, flexWrap: 'wrap', overflowX: 'auto', paddingBottom: 4 }}>
                    <Tab id="overview" label="Overview" icon={Activity} />
                    {!isOwner && <Tab id="saved" label="Saved Items" icon={Heart} />}
                    {isOwner && <Tab id="listings" label="My Listings" icon={Building2} />}
                    <Tab id="inquiries" label="My Inquiries" icon={MessageSquare} />
                    {isOwner && <Tab id="received" label="Received Leads" icon={TrendingUp} />}
                    {!isOwner && recommendations.length > 0 && <Tab id="recommended" label="AI Matches" icon={Zap} />}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="overview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                        <div className="glass-card" style={{ padding: 28 }}>
                            <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 20, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={18} color="var(--primary)" /> Verification Status</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>Email Address</div>
                                        <div style={{ color: '#6b7298', fontSize: 12 }}>{user.email}</div>
                                    </div>
                                    <span className="badge badge-success">Verified</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>Phone Number</div>
                                        <div style={{ color: '#6b7298', fontSize: 12 }}>{user.phone || 'Not provided'}</div>
                                    </div>
                                    {fullProfile?.isPhoneVerified ? <span className="badge badge-success">Verified</span> : <span className="badge badge-warning">Pending</span>}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>{isOwner ? 'Owner ID' : 'Work/College ID'}</div>
                                        <div style={{ color: '#6b7298', fontSize: 12 }}>{fullProfile?.institution || fullProfile?.workplace || 'Not uploaded'}</div>
                                    </div>
                                    {fullProfile?.institution || fullProfile?.workplace ? <span className="badge badge-success">Verified</span> : <span className="badge badge-warning">Pending</span>}
                                </div>
                            </div>
                            <Link to="/profile" className="btn btn-ghost" style={{ width: '100%', marginTop: 24, fontSize: 13 }}>Complete Profile</Link>
                        </div>
                        
                        <div className="glass-card" style={{ padding: 28 }}>
                            <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 20, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={18} color="var(--primary-light)" /> Quick Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <Link to="/properties" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)', borderRadius: 10, color: 'white', fontSize: 14, textDecoration: 'none', transition: 'background 0.2s' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(201,163,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={16} color="var(--primary)" /></div>
                                    Explore Properties
                                </Link>
                                <Link to="/find-flatmates" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)', borderRadius: 10, color: 'white', fontSize: 14, textDecoration: 'none', transition: 'background 0.2s' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(223,194,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={16} color="var(--primary-light)" /></div>
                                    Find Flatmates
                                </Link>
                                <Link to="/toolkit" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)', borderRadius: 10, color: 'white', fontSize: 14, textDecoration: 'none', transition: 'background 0.2s' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(34,211,165,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={16} color="#22d3a5" /></div>
                                    Rental Agreements
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'saved' && (
                    <div>
                        {savedProperties.length === 0 && savedPGs.length === 0 ? (
                            <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
                                <Heart size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 16 }} />
                                <h3 style={{ color: 'white', marginBottom: 8 }}>No saved items yet</h3>
                                <p style={{ color: '#6b7298', marginBottom: 24 }}>Save properties and PGs you like to view them later.</p>
                                <Link to="/properties" className="btn btn-primary">Explore Properties</Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                {savedProperties.length > 0 && (
                                    <div>
                                        <h3 style={{ color: 'white', fontSize: 16, marginBottom: 16 }}>Saved Properties ({savedProperties.length})</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                                            {savedProperties.map(prop => (
                                                <Link to={`/properties/${prop._id}`} key={prop._id} className="glass-card" style={{ display: 'flex', gap: 16, padding: 12, textDecoration: 'none' }}>
                                                    <img src={prop.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'} alt="" style={{ width: 90, height: 80, borderRadius: 8, objectFit: 'cover' }} />
                                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                        <h4 style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{prop.title}</h4>
                                                        <div style={{ color: '#6b7298', fontSize: 12, marginBottom: 6 }}><MapPin size={10} style={{ display: 'inline' }}/> {prop.location?.city}</div>
                                                        <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>₹{prop.price?.toLocaleString()}</div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {savedPGs.length > 0 && (
                                    <div>
                                        <h3 style={{ color: 'white', fontSize: 16, marginBottom: 16 }}>Saved PGs ({savedPGs.length})</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                                            {savedPGs.map(pg => (
                                                <Link to={`/pgs/${pg._id}`} key={pg._id} className="glass-card" style={{ display: 'flex', gap: 16, padding: 12, textDecoration: 'none' }}>
                                                    <img src={pg.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5'} alt="" style={{ width: 90, height: 80, borderRadius: 8, objectFit: 'cover' }} />
                                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                        <h4 style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{pg.name}</h4>
                                                        <div style={{ color: '#6b7298', fontSize: 12, marginBottom: 6 }}><MapPin size={10} style={{ display: 'inline' }}/> {pg.location?.city} • {pg.genderType}</div>
                                                        <div style={{ color: 'var(--primary-light)', fontWeight: 700, fontSize: 15 }}>₹{pg.rentPerMonth?.toLocaleString()}/mo</div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'recommended' && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                            <Zap size={20} color="#ffd700" />
                            <div>
                                <h2 style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>AI Recommendations</h2>
                                <p style={{ color: '#6b7298', fontSize: 13 }}>Based on: <strong style={{ color: 'var(--primary)' }}>{user.institution || user.workplace || 'your activity'}</strong></p>
                            </div>
                        </div>
                        <div className="grid-3">
                            {recommendations.map(pg => (
                                <Link to={`/pgs/${pg._id}`} key={pg._id} className="glass-card" style={{ display: 'block', overflow: 'hidden', textDecoration: 'none' }}>
                                    <div style={{ height: 160, overflow: 'hidden' }}>
                                        <img src={`https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80&sig=${pg._id}`} alt={pg.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'; }} />
                                    </div>
                                    <div style={{ padding: 16 }}>
                                        <h4 style={{ color: 'white', fontWeight: 600, marginBottom: 6 }}>{pg.name}</h4>
                                        <div style={{ fontSize: 13, color: '#6b7298', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                                            <MapPin size={12} color="var(--primary)" /> {pg.location?.address}
                                        </div>
                                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>₹{pg.rentPerMonth?.toLocaleString()}/mo</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'listings' && (
                    <div>
                        {myProperties.length === 0 && myPGs.length === 0 ? (
                            <div className="empty-state">
                                <Building2 size={48} color="rgba(255,255,255,0.1)" />
                                <h3 style={{ color: 'white' }}>No listings yet</h3>
                                <p style={{ color: '#6b7298', marginBottom: 20 }}>Start listing your properties to reach thousands of tenants!</p>
                                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                    <Link to="/list-property" className="btn btn-primary">List Property</Link>
                                    <Link to="/list-pg" className="btn btn-secondary">List PG</Link>
                                </div>
                            </div>
                        ) : (
                            <>
                                {myProperties.length > 0 && (
                                    <>
                                        <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 16, fontSize: 16 }}>Properties ({myProperties.length})</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                                            {myProperties.map(prop => (
                                                <Link to={`/properties/${prop._id}`} key={prop._id} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 16, padding: 16, alignItems: 'center', textDecoration: 'none' }}>
                                                    <img src={prop.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80'} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80'; }} />
                                                    <div>
                                                        <h4 style={{ color: 'white', fontWeight: 600, marginBottom: 4, fontSize: 14 }}>{prop.title}</h4>
                                                        <div style={{ fontSize: 12, color: '#6b7298', display: 'flex', gap: 12 }}>
                                                            <span><MapPin size={11} style={{ display: 'inline' }} /> {prop.location?.city}</span>
                                                            <span><Eye size={11} style={{ display: 'inline' }} /> {prop.views} views</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>
                                                            ₹{prop.price >= 100000 ? `${(prop.price / 100000).toFixed(1)}L` : prop.price?.toLocaleString()}
                                                        </div>
                                                        <span className={`badge ${prop.isAvailable ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 10, padding: '2px 6px' }}>
                                                            {prop.isAvailable ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                )}
                                {myPGs.length > 0 && (
                                    <>
                                        <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 16, fontSize: 16 }}>PG Listings ({myPGs.length})</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            {myPGs.map(pg => (
                                                <Link to={`/pgs/${pg._id}`} key={pg._id} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 16, padding: 16, alignItems: 'center', textDecoration: 'none' }}>
                                                    <img src={pg.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=80'} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=80'; }} />
                                                    <div>
                                                        <h4 style={{ color: 'white', fontWeight: 600, marginBottom: 4, fontSize: 14 }}>{pg.name}</h4>
                                                        <div style={{ fontSize: 12, color: '#6b7298', display: 'flex', gap: 12 }}>
                                                            <span><MapPin size={11} style={{ display: 'inline' }} /> {pg.location?.city}</span>
                                                            <span><Star size={11} style={{ display: 'inline', color: '#ffd700' }} /> {pg.rating}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-light)', fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>₹{pg.rentPerMonth?.toLocaleString()}/mo</div>
                                                        <span className="badge badge-success" style={{ fontSize: 10, padding: '2px 6px' }}>{pg.availableRooms} rooms</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'inquiries' && (
                    <div>
                        {myInquiries.length === 0 ? (
                            <div className="empty-state">
                                <MessageSquare size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 16 }} />
                                <h3 style={{ color: 'white' }}>No inquiries sent yet</h3>
                                <p style={{ color: '#6b7298', marginBottom: 20 }}>Browse properties and contact owners directly without brokers.</p>
                                <Link to="/properties" className="btn btn-primary">Browse Properties</Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {myInquiries.map(inq => (
                                    <div key={inq._id} className="glass-card" style={{ padding: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                                            <div>
                                                <h4 style={{ color: 'white', fontWeight: 600, marginBottom: 4, fontSize: 15 }}>
                                                    {inq.property?.title || inq.pg?.name || 'Deleted Listing'}
                                                </h4>
                                                <p style={{ color: '#6b7298', fontSize: 12 }}>Sent on {new Date(inq.createdAt).toLocaleDateString('en-IN')}</p>
                                            </div>
                                            <span className={`badge ${inq.status === 'responded' ? 'badge-success' : inq.status === 'closed' ? 'badge-danger' : 'badge-warning'}`}>
                                                {inq.status}
                                            </span>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, border: '1px solid var(--dark-border)', marginBottom: inq.ownerResponse ? 12 : 0 }}>
                                            <p style={{ color: '#b0b7d3', fontSize: 13, margin: 0 }}>"{inq.message}"</p>
                                        </div>
                                        {inq.ownerResponse && (
                                            <div style={{ background: 'rgba(34,211,165,0.05)', border: '1px solid rgba(34,211,165,0.2)', borderRadius: 8, padding: 12 }}>
                                                <p style={{ color: '#22d3a5', fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={12} /> Owner Response:</p>
                                                <p style={{ color: 'white', fontSize: 13, margin: 0 }}>{inq.ownerResponse}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'received' && (
                    <div>
                        {receivedInquiries.length === 0 ? (
                            <div className="empty-state">
                                <MessageSquare size={48} color="rgba(255,255,255,0.1)" />
                                <h3 style={{ color: 'white', marginTop: 16 }}>No leads received yet</h3>
                                <p style={{ color: '#6b7298' }}>Inquiries for your properties will appear here.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {receivedInquiries.map(inq => (
                                    <div key={inq._id} className="glass-card" style={{ padding: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(201,163,94,0.2), rgba(223,194,136,0.1))', border: '1px solid rgba(201,163,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>
                                                    {inq.user?.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>{inq.user?.name}</div>
                                                    <div style={{ color: '#6b7298', fontSize: 12, display: 'flex', gap: 8 }}>
                                                        <span>{inq.user?.phone}</span> • <span>{inq.user?.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`badge ${inq.status === 'responded' ? 'badge-success' : 'badge-warning'}`}>{inq.status}</span>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, border: '1px solid var(--dark-border)', marginBottom: 12 }}>
                                            <p style={{ color: '#b0b7d3', fontSize: 13, margin: 0 }}>"{inq.message}"</p>
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
                                            Interest in: {inq.property?.title || inq.pg?.name} • {new Date(inq.createdAt).toLocaleDateString('en-IN')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {user.role === 'admin' && (
                    <div style={{ marginTop: 24 }}>
                        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 24, paddingBottom: 12 }}>
                            <h3 style={{ color: '#ffd700', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ShieldCheck size={20} /> Admin Control Panel
                            </h3>
                        </div>
                        <AdminDashboardTab />
                    </div>
                )}
            </div>
        </div>
    );
}
