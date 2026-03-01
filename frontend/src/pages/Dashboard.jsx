import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Building2, Users, MessageSquare, TrendingUp, Plus, Star, Eye, MapPin, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const { user } = useAuth();
    const [myProperties, setMyProperties] = useState([]);
    const [myPGs, setMyPGs] = useState([]);
    const [myInquiries, setMyInquiries] = useState([]);
    const [receivedInquiries, setReceivedInquiries] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const promises = [
                    api.get('/inquiries/my'),
                    api.get('/recommendations/pgs')
                ];
                if (user.role === 'owner' || user.role === 'admin') {
                    promises.push(api.get('/properties/owner/listings'));
                    promises.push(api.get('/pgs/owner/listings'));
                    promises.push(api.get('/inquiries/received'));
                }
                const results = await Promise.allSettled(promises);
                if (results[0].status === 'fulfilled') setMyInquiries(results[0].value.data.inquiries || []);
                if (results[1].status === 'fulfilled') setRecommendations(results[1].value.data.pgs || []);
                if (results[2]?.status === 'fulfilled') setMyProperties(results[2].value.data.properties || []);
                if (results[3]?.status === 'fulfilled') setMyPGs(results[3].value.data.pgs || []);
                if (results[4]?.status === 'fulfilled') setReceivedInquiries(results[4].value.data.inquiries || []);
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
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, transition: 'all 0.2s', background: activeTab === id ? 'rgba(108,99,255,0.2)' : 'transparent', color: activeTab === id ? '#6c63ff' : '#6b7298', borderBottom: activeTab === id ? '2px solid #6c63ff' : '2px solid transparent' }}>
            <Icon size={16} /> {label}
        </button>
    );

    if (loading) return <div className="loader"><div className="spinner" /></div>;

    return (
        <div style={{ paddingTop: 90, minHeight: '100vh' }}>
            <div className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
                    <div>
                        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, color: 'white', marginBottom: 4 }}>
                            Welcome back, {user.name?.split(' ')[0]}! 👋
                        </h1>
                        <p style={{ color: '#6b7298' }}>
                            {user.role === 'admin' ? '🛡️ Admin Dashboard' : user.role === 'owner' ? '🏠 Owner Dashboard' : '🔍 Your Personal Dashboard'}
                        </p>
                    </div>
                    {(user.role === 'owner' || user.role === 'admin') && (
                        <div style={{ display: 'flex', gap: 12 }}>
                            <Link to="/list-property" className="btn btn-primary" style={{ fontSize: 14 }}>
                                <Plus size={16} /> List Property
                            </Link>
                            <Link to="/list-pg" className="btn btn-secondary" style={{ fontSize: 14 }}>
                                <Plus size={16} /> List PG
                            </Link>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 36 }}>
                    {[
                        { icon: Building2, label: 'My Properties', value: myProperties.length, color: '#6c63ff' },
                        { icon: Users, label: 'PG Listings', value: myPGs.length, color: '#43e5f7' },
                        { icon: MessageSquare, label: 'My Inquiries', value: myInquiries.length, color: '#ff6584' },
                        { icon: TrendingUp, label: 'Received', value: receivedInquiries.length, color: '#ffd700' }
                    ].map((stat, i) => (
                        <div key={i} className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${stat.color}20`, border: `1px solid ${stat.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <stat.icon size={22} color={stat.color} />
                            </div>
                            <div>
                                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'white' }}>{stat.value}</div>
                                <div style={{ fontSize: 12, color: '#6b7298' }}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(108,99,255,0.15)', marginBottom: 28, flexWrap: 'wrap' }}>
                    <Tab id="overview" label="Overview" icon={TrendingUp} />
                    {recommendations.length > 0 && <Tab id="recommended" label="AI Recommendations" icon={Zap} />}
                    {(user.role === 'owner' || user.role === 'admin') && <Tab id="listings" label="My Listings" icon={Building2} />}
                    <Tab id="inquiries" label="My Inquiries" icon={MessageSquare} />
                    {receivedInquiries.length > 0 && <Tab id="received" label="Received Inquiries" icon={MessageSquare} />}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div>
                        {/* Quick stats big */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 28 }}>
                            <div className="glass-card" style={{ padding: 28 }}>
                                <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 16, fontSize: 16 }}>Account Info</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {[
                                        { label: 'Email', value: user.email },
                                        { label: 'Phone', value: user.phone || 'Not set' },
                                        { label: 'Role', value: user.role },
                                        { label: 'Institution', value: user.institution || 'Not set' }
                                    ].map(info => (
                                        <div key={info.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                            <span style={{ color: '#6b7298' }}>{info.label}</span>
                                            <span style={{ color: '#b0b7d3', textTransform: 'capitalize' }}>{info.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <Link to="/profile" className="btn btn-ghost" style={{ width: '100%', marginTop: 16, fontSize: 13 }}>Edit Profile</Link>
                            </div>
                            <div className="glass-card" style={{ padding: 28 }}>
                                <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 16, fontSize: 16 }}>Quick Links</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <Link to="/properties" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'rgba(108,99,255,0.08)', borderRadius: 10, color: '#b0b7d3', fontSize: 14 }}>
                                        <Building2 size={16} color="#6c63ff" /> Browse Properties
                                    </Link>
                                    <Link to="/pgs" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'rgba(67,229,247,0.08)', borderRadius: 10, color: '#b0b7d3', fontSize: 14 }}>
                                        <Users size={16} color="#43e5f7" /> Browse PGs & Hostels
                                    </Link>
                                    {user.role === 'user' && (
                                        <div style={{ padding: 12, background: 'rgba(255,101,132,0.08)', borderRadius: 10, fontSize: 13, color: '#b0b7d3' }}>
                                            💡 Tip: Set your institution to get AI-powered PG recommendations near your college!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'recommended' && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                            <Zap size={20} color="#ffd700" />
                            <div>
                                <h2 style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>AI Recommendations for You</h2>
                                <p style={{ color: '#6b7298', fontSize: 13 }}>Based on: <strong style={{ color: '#6c63ff' }}>{user.institution || user.workplace || 'Pune'}</strong></p>
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
                                            <MapPin size={12} color="#6c63ff" /> {pg.location?.address}
                                        </div>
                                        <div style={{ fontSize: 18, fontWeight: 700, color: '#6c63ff', fontFamily: 'Outfit, sans-serif' }}>₹{pg.rentPerMonth?.toLocaleString()}/mo</div>
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
                                <Building2 size={48} color="#6b7298" />
                                <h3 style={{ color: '#b0b7d3' }}>No listings yet</h3>
                                <p>Start listing your properties to reach thousands of buyers!</p>
                                <Link to="/list-property" className="btn btn-primary">+ Add Your First Property</Link>
                            </div>
                        ) : (
                            <>
                                {myProperties.length > 0 && (
                                    <>
                                        <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 16 }}>Properties ({myProperties.length})</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                                            {myProperties.map(prop => (
                                                <Link to={`/properties/${prop._id}`} key={prop._id} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 16, padding: 16, alignItems: 'center', textDecoration: 'none' }}>
                                                    <img src={prop.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80'} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80'; }} />
                                                    <div>
                                                        <h4 style={{ color: 'white', fontWeight: 600, marginBottom: 4 }}>{prop.title}</h4>
                                                        <div style={{ fontSize: 12, color: '#6b7298', display: 'flex', gap: 12 }}>
                                                            <span><MapPin size={11} style={{ display: 'inline' }} /> {prop.location?.city}</span>
                                                            <span><Eye size={11} style={{ display: 'inline' }} /> {prop.views} views</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#6c63ff', fontFamily: 'Outfit, sans-serif' }}>
                                                            ₹{prop.price >= 100000 ? `${(prop.price / 100000).toFixed(1)}L` : prop.price?.toLocaleString()}
                                                        </div>
                                                        <span className={`badge ${prop.isAvailable ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 11 }}>
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
                                        <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 16 }}>PG Listings ({myPGs.length})</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            {myPGs.map(pg => (
                                                <Link to={`/pgs/${pg._id}`} key={pg._id} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 16, padding: 16, alignItems: 'center', textDecoration: 'none' }}>
                                                    <img src={pg.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=80'} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=80'; }} />
                                                    <div>
                                                        <h4 style={{ color: 'white', fontWeight: 600, marginBottom: 4 }}>{pg.name}</h4>
                                                        <div style={{ fontSize: 12, color: '#6b7298', display: 'flex', gap: 12 }}>
                                                            <span><MapPin size={11} style={{ display: 'inline' }} /> {pg.location?.city}</span>
                                                            <span><Star size={11} style={{ display: 'inline', color: '#ffd700' }} /> {pg.rating}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#6c63ff', fontFamily: 'Outfit, sans-serif' }}>₹{pg.rentPerMonth?.toLocaleString()}/mo</div>
                                                        <div style={{ fontSize: 12, color: '#22d3a5' }}>{pg.availableRooms} rooms free</div>
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
                                <MessageSquare size={48} color="#6b7298" />
                                <h3 style={{ color: '#b0b7d3' }}>No inquiries sent yet</h3>
                                <p>Browse properties and send inquiries to owners.</p>
                                <Link to="/properties" className="btn btn-primary">Browse Properties</Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {myInquiries.map(inq => (
                                    <div key={inq._id} className="glass-card" style={{ padding: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
                                            <div>
                                                <h4 style={{ color: 'white', fontWeight: 600, marginBottom: 4 }}>
                                                    {inq.property?.title || inq.pg?.name || 'Listing'}
                                                </h4>
                                                <p style={{ color: '#6b7298', fontSize: 13 }}>{new Date(inq.createdAt).toLocaleDateString('en-IN')}</p>
                                            </div>
                                            <span className={`badge ${inq.status === 'responded' ? 'badge-success' : inq.status === 'closed' ? 'badge-danger' : 'badge-warning'}`}>
                                                {inq.status}
                                            </span>
                                        </div>
                                        <p style={{ color: '#b0b7d3', fontSize: 14, marginBottom: inq.ownerResponse ? 12 : 0 }}>{inq.message}</p>
                                        {inq.ownerResponse && (
                                            <div style={{ background: 'rgba(34,211,165,0.08)', border: '1px solid rgba(34,211,165,0.2)', borderRadius: 10, padding: 14, marginTop: 10 }}>
                                                <p style={{ color: '#22d3a5', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Owner Response:</p>
                                                <p style={{ color: '#b0b7d3', fontSize: 14 }}>{inq.ownerResponse}</p>
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
                                <MessageSquare size={48} color="#6b7298" />
                                <p>No inquiries received yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {receivedInquiries.map(inq => (
                                    <div key={inq._id} className="glass-card" style={{ padding: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #43e5f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white' }}>
                                                    {inq.user?.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ color: 'white', fontWeight: 600 }}>{inq.user?.name}</div>
                                                    <div style={{ color: '#6b7298', fontSize: 12 }}>{inq.user?.phone} • {inq.user?.email}</div>
                                                </div>
                                            </div>
                                            <span className={`badge ${inq.status === 'responded' ? 'badge-success' : 'badge-warning'}`}>{inq.status}</span>
                                        </div>
                                        <p style={{ color: '#b0b7d3', fontSize: 14, marginBottom: 12 }}>{inq.message}</p>
                                        <div style={{ fontSize: 12, color: '#6b7298', marginBottom: 12 }}>
                                            Re: {inq.property?.title || inq.pg?.name} • {new Date(inq.createdAt).toLocaleDateString('en-IN')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
