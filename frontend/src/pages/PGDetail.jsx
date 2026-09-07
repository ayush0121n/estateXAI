/* eslint-disable */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowLeft, Star, Wifi, UtensilsCrossed, AirVent, Tv, WashingMachine, Dumbbell, Shield, Clock, Users, Eye, Sparkles, Footprints, Link2 } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { PGCard } from '../components/ListingCard';
import toast from 'react-hot-toast';
import CommuteScorer from '../components/CommuteScorer';
import NeighborhoodCard from '../components/NeighborhoodCard';

export default function PGDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [pg, setPG] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);
    const [showInquiry, setShowInquiry] = useState(false);
    const [inquiry, setInquiry] = useState({ message: '', phone: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [pgRes, simRes] = await Promise.all([
                    api.get(`/pgs/${id}`),
                    api.get(`/recommendations/similar/pg/${id}`)
                ]);
                setPG(pgRes.data.pg);
                setSimilar(simRes.data.similar || []);
            } catch { navigate('/pgs'); }
            finally { setLoading(false); }
        };
        fetch();
    }, [id]);

    const handleInquiry = async (e) => {
        e.preventDefault();
        if (!user) { toast.error('Please login'); navigate('/login'); return; }
        setSubmitting(true);
        try {
            await api.post('/inquiries', { propertyType: 'pg', propertyId: id, message: inquiry.message, phone: inquiry.phone || user.phone });
            toast.success('Inquiry sent!');
            setShowInquiry(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        } finally { setSubmitting(false); }
    };

    if (loading) return <div className="loader"><div className="spinner" /></div>;
    if (!pg) return null;

    const images = pg.images?.length > 0 ? pg.images : [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80'
    ];

    const amenityList = [
        { key: 'wifi', label: 'WiFi', icon: <Wifi size={15} /> },
        { key: 'food', label: 'Food', icon: <UtensilsCrossed size={15} /> },
        { key: 'ac', label: 'AC', icon: <AirVent size={15} /> },
        { key: 'tv', label: 'TV', icon: <Tv size={15} /> },
        { key: 'laundry', label: 'Laundry', icon: <WashingMachine size={15} /> },
        { key: 'gym', label: 'Gym', icon: <Dumbbell size={15} /> },
        { key: 'cctv', label: 'CCTV', icon: <Shield size={15} /> },
        { key: 'hotWater', label: 'Hot Water', icon: '🚿' },
        { key: 'studyRoom', label: 'Study Room', icon: '📚' },
        { key: 'housekeeping', label: 'Housekeeping', icon: '🧹' },
        { key: 'parking', label: 'Parking', icon: '🚗' },
        { key: 'refrigerator', label: 'Refrigerator', icon: '🧊' }
    ];

    return (
        <div style={{ paddingTop: 90, minHeight: '100vh' }}>
            <div className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>
                <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: '#b0b7d3', cursor: 'pointer', fontSize: 14, marginBottom: 24, fontFamily: 'inherit', padding: 0 }}>
                    <ArrowLeft size={16} /> Back to PGs
                </button>

                <div className="detail-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}>
                    <div>
                        {/* Gallery */}
                        <div className="glass-card" style={{ overflow: 'hidden', marginBottom: 24 }}>
                            <div style={{ height: 380, position: 'relative', overflow: 'hidden' }}>
                                <img src={images[activeImg]} alt={pg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=80'; }} />
                                <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 }}>
                                    <span className={`badge ${pg.genderType === 'male' ? 'badge-primary' : pg.genderType === 'female' ? 'badge-danger' : 'badge-success'}`}>
                                        {pg.genderType === 'male' ? '♂ Boys PG' : pg.genderType === 'female' ? '♀ Girls PG' : '⚥ Unisex'}
                                    </span>
                                    <span className={`badge ${pg.availableRooms > 0 ? 'badge-success' : 'badge-danger'}`}>
                                        {pg.availableRooms > 0 ? `${pg.availableRooms} Available` : 'Full'}
                                    </span>
                                </div>
                            </div>
                            {images.length > 1 && (
                                <div style={{ display: 'flex', gap: 8, padding: 12 }}>
                                    {images.map((img, i) => (
                                        <img key={i} src={img} alt="" onClick={() => setActiveImg(i)}
                                            style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: activeImg === i ? '2px solid var(--primary)' : '2px solid transparent', opacity: activeImg === i ? 1 : 0.6 }}
                                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=300&q=80'; }} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                                <div>
                                    <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 8 }}>{pg.name}</h1>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7298', fontSize: 14, marginBottom: 8 }}>
                                        <MapPin size={14} color="var(--primary)" /> {pg.location?.address}, {pg.location?.city}
                                    </div>
                                    {pg.rating > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ffd700', fontSize: 14 }}>
                                            <Star size={14} fill="#ffd700" /> {pg.rating?.toFixed(1)} <span style={{ color: '#6b7298' }}>({pg.reviewCount} reviews)</span>
                                        </div>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'Outfit, sans-serif', background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                        ₹{pg.rentPerMonth?.toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#6b7298' }}>per month</div>
                                    {pg.securityDeposit > 0 && <div style={{ fontSize: 12, color: '#6b7298', marginTop: 4 }}>Deposit: ₹{pg.securityDeposit?.toLocaleString()}</div>}
                                </div>
                            </div>

                            {/* Quick stats */}
                            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', padding: 20, background: 'rgba(201, 163, 94,0.07)', borderRadius: 14, marginBottom: 20 }}>
                                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>{pg.totalRooms}</div><div style={{ fontSize: 12, color: '#6b7298' }}>Total Rooms</div></div>
                                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 18, fontWeight: 700, color: '#22d3a5' }}>{pg.availableRooms}</div><div style={{ fontSize: 12, color: '#6b7298' }}>Available</div></div>
                                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 18, fontWeight: 700, color: 'white', textTransform: 'capitalize' }}>{pg.type}</div><div style={{ fontSize: 12, color: '#6b7298' }}>Type</div></div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>{pg.sharingType?.join(', ')}</div>
                                    <div style={{ fontSize: 12, color: '#6b7298' }}>Sharing</div>
                                </div>
                            </div>

                            <p style={{ color: '#b0b7d3', lineHeight: 1.8, marginBottom: 20 }}>{pg.description}</p>

                            {/* Amenities */}
                            <div className="divider" />
                            <h3 style={{ fontWeight: 600, color: 'white', marginBottom: 14 }}>Amenities</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {amenityList.filter(a => pg.amenities?.[a.key]).map(a => (
                                    <span key={a.key} className="amenity-chip" style={{ color: '#22d3a5', borderColor: 'rgba(34,211,165,0.3)', background: 'rgba(34,211,165,0.08)' }}>
                                        {a.icon} {a.label}
                                    </span>
                                ))}
                            </div>

                            {/* Meals */}
                            {(pg.meals?.breakfast || pg.meals?.lunch || pg.meals?.dinner) && (
                                <>
                                    <div className="divider" />
                                    <h3 style={{ fontWeight: 600, color: 'white', marginBottom: 14 }}>Meals Included</h3>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        {pg.meals?.breakfast && <span className="amenity-chip">🌅 Breakfast</span>}
                                        {pg.meals?.lunch && <span className="amenity-chip">☀️ Lunch</span>}
                                        {pg.meals?.dinner && <span className="amenity-chip">🌙 Dinner</span>}
                                    </div>
                                </>
                            )}

                            {/* Rules */}
                            {pg.rules?.curfewTime && (
                                <>
                                    <div className="divider" />
                                    <h3 style={{ fontWeight: 600, color: 'white', marginBottom: 14 }}>House Rules</h3>
                                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                                        {pg.rules?.curfewTime && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#b0b7d3' }}><Clock size={13} color="#ffd700" /> Curfew: {pg.rules.curfewTime}</div>}
                                        <div style={{ fontSize: 13, color: pg.rules?.guestsAllowed ? '#22d3a5' : '#ef4444' }}>{pg.rules?.guestsAllowed ? '✓ Guests Allowed' : '✗ No Guests'}</div>
                                        <div style={{ fontSize: 13, color: pg.rules?.smokingAllowed ? '#22d3a5' : '#ef4444' }}>{pg.rules?.smokingAllowed ? '✓ Smoking Allowed' : '✗ No Smoking'}</div>
                                    </div>
                                </>
                            )}

                            {/* Nearby Institutions */}
                            {pg.location?.nearbyInstitutions?.length > 0 && (
                                <>
                                    <div className="divider" />
                                    <h3 style={{ fontWeight: 600, color: 'white', marginBottom: 14 }}>Nearby Institutions</h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {pg.location.nearbyInstitutions.map((inst, i) => (
                                            <span key={i} className="amenity-chip">🏛️ {inst}</span>
                                        ))}
                                    </div>
                                </>
                            )}

                            <div className="divider" />
                            <div style={{ fontSize: 13, color: '#6b7298', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Eye size={13} /> {pg.views} people viewed this listing
                            </div>

                            {/* Reviews Section */}
                            {pg.reviews && pg.reviews.length > 0 && (
                                <>
                                    <div className="divider" />
                                    <h3 style={{ fontWeight: 600, color: 'white', marginBottom: 16, fontSize: 20 }}>Reviews & Ratings</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {pg.reviews.map((r, i) => (
                                            <div key={i} style={{ background: 'var(--dark-bg)', padding: 16, borderRadius: 12, border: '1px solid var(--dark-border)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: r.userType === 'owner' ? 'var(--primary)' : '#2a2d3e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                            {r.user.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ color: 'white', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                {r.user}
                                                                {r.userType === 'owner' && <span style={{ fontSize: 10, background: 'rgba(201,163,94,0.2)', color: 'var(--primary)', padding: '2px 6px', borderRadius: 4 }}>Owner</span>}
                                                            </div>
                                                            <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                                                                {new Date(r.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ color: '#fbbf24', fontSize: 16, letterSpacing: 2 }}>
                                                        {'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}
                                                    </div>
                                                </div>
                                                <p style={{ color: '#a0aabf', fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                                                    "{r.comment}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="detail-sidebar" style={{ position: 'sticky', top: 90 }}>
                        <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
                            <h3 style={{ fontWeight: 600, color: 'white', marginBottom: 16, fontSize: 16 }}>Contact Owner</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                                <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'white' }}>
                                    {pg.owner?.name?.[0]?.toUpperCase() || 'O'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'white' }}>{pg.owner?.name}</div>
                                    <div style={{ fontSize: 12, color: '#22d3a5' }}>Verified Owner ✓</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                                {pg.owner?.phone && (
                                    <a href={`tel:${pg.owner.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(34,211,165,0.1)', border: '1px solid rgba(34,211,165,0.3)', borderRadius: 10, padding: 12, color: '#22d3a5', fontSize: 14 }}>
                                        <Phone size={16} /> {pg.owner.phone}
                                    </a>
                                )}
                            </div>
                            <button onClick={() => setShowInquiry(!showInquiry)} className="btn btn-primary" style={{ width: '100%', borderRadius: 12 }}>
                                Send Inquiry
                            </button>
                        </div>

                        {showInquiry && (
                            <div className="glass-card" style={{ padding: 24 }}>
                                <h3 style={{ fontWeight: 600, color: 'white', marginBottom: 16, fontSize: 16 }}>Send Message</h3>
                                <form onSubmit={handleInquiry} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <textarea required placeholder="Hi, I'm interested in this PG..." value={inquiry.message}
                                        onChange={e => setInquiry(p => ({ ...p, message: e.target.value }))}
                                        className="input" style={{ resize: 'vertical', minHeight: 100 }} />
                                    <input type="tel" placeholder="Your phone number" value={inquiry.phone}
                                        onChange={e => setInquiry(p => ({ ...p, phone: e.target.value }))} className="input" />
                                    <button type="submit" disabled={submitting} className="btn btn-primary" style={{ borderRadius: 10 }}>
                                        {submitting ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {similar.length > 0 && (
                    <div style={{ marginTop: 60 }}>
                        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 28 }}>Similar PGs</h2>
                        <div className="grid-3">
                            {similar.map(p => <PGCard key={p._id} pg={p} />)}
                        </div>
                    </div>
                )}

                {/* AI Commute Scorer & Neighborhood */}
                <div style={{ marginTop: 40, marginBottom: 24 }}>
                    <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 24 }}>Location Intelligence</h2>
                    
                    <div className="location-intel-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
                        {/* Walkability & Connectivity */}
                        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 16, padding: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(201,163,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Sparkles size={20} color="var(--primary)" />
                                </div>
                                <div>
                                    <h3 style={{ color: 'white', fontSize: 16, fontWeight: 600, margin: 0 }}>Area Analysis</h3>
                                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Smart scores based on surroundings</div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14 }}>
                                            <Footprints size={16} color="var(--primary)" /> Walkability Score
                                        </div>
                                        <div style={{ color: 'white', fontWeight: 600 }}>{pg.walkabilityScore || 85}/100</div>
                                    </div>
                                    <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ width: `${pg.walkabilityScore || 85}%`, height: '100%', background: 'var(--primary)', borderRadius: 3 }} />
                                    </div>
                                </div>
                                
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14 }}>
                                            <Link2 size={16} color="var(--primary)" /> Connectivity Score
                                        </div>
                                        <div style={{ color: 'white', fontWeight: 600 }}>{pg.connectivityScore || 88}/100</div>
                                    </div>
                                    <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ width: `${pg.connectivityScore || 88}%`, height: '100%', background: '#4CAF50', borderRadius: 3 }} />
                                    </div>
                                </div>
                                
                                {pg.futureDevelopment && (
                                    <div style={{ marginTop: 8, padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)', borderRadius: 8 }}>
                                        <div style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>NEIGHBORHOOD VIBE</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>"{pg.futureDevelopment}"</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <NeighborhoodCard
                            area={pg?.location?.city || pg?.location?.address}
                            city={pg?.location?.city}
                        />
                    </div>

                    <CommuteScorer
                        propertyLat={pg?.location?.coordinates?.lat}
                        propertyLng={pg?.location?.coordinates?.lng}
                    />
                </div>
            </div>
        </div>
    );
}

