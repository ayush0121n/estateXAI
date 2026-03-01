import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Square, Phone, Mail, ArrowLeft, Heart, Share2, Eye, Calendar, Shield, Wifi, Car, Dumbbell, Waves } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { PropertyCard } from '../components/ListingCard';
import toast from 'react-hot-toast';

const amenityIcons = { parking: <Car size={14} />, gym: <Dumbbell size={14} />, pool: <Waves size={14} />, security: <Shield size={14} />, wifi: <Wifi size={14} /> };

const formatPrice = (price, type) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString()}${type === 'rent' ? '/month' : ''}`;
};

export default function PropertyDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);
    const [showInquiry, setShowInquiry] = useState(false);
    const [inquiry, setInquiry] = useState({ message: '', phone: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [propRes, simRes] = await Promise.all([
                    api.get(`/properties/${id}`),
                    api.get(`/recommendations/similar/property/${id}`)
                ]);
                setProperty(propRes.data.property);
                setSimilar(simRes.data.similar || []);
            } catch (err) {
                toast.error('Property not found');
                navigate('/properties');
            } finally { setLoading(false); }
        };
        fetchData();
    }, [id]);

    const handleInquiry = async (e) => {
        e.preventDefault();
        if (!user) { toast.error('Please login to send inquiry'); navigate('/login'); return; }
        setSubmitting(true);
        try {
            await api.post('/inquiries', {
                propertyType: 'property', propertyId: id,
                message: inquiry.message, phone: inquiry.phone || user.phone
            });
            toast.success('Inquiry sent! The owner will contact you.');
            setShowInquiry(false);
            setInquiry({ message: '', phone: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send inquiry');
        } finally { setSubmitting(false); }
    };

    if (loading) return <div className="loader"><div className="spinner" /></div>;
    if (!property) return null;

    const images = property.images?.length > 0 ? property.images : [
        `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80`,
        `https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80`,
        `https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=900&q=80`
    ];

    return (
        <div style={{ paddingTop: 90, minHeight: '100vh' }}>
            <div className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>
                {/* Back */}
                <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: '#b0b7d3', cursor: 'pointer', fontSize: 14, marginBottom: 24, fontFamily: 'inherit', padding: 0 }}>
                    <ArrowLeft size={16} /> Back to Properties
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}>
                    {/* Left Content */}
                    <div>
                        {/* Image Gallery */}
                        <div className="glass-card" style={{ overflow: 'hidden', marginBottom: 24 }}>
                            <div style={{ height: 420, overflow: 'hidden', position: 'relative' }}>
                                <img src={images[activeImg]} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80'; }} />
                                <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 }}>
                                    <span className={`badge ${property.listingType === 'sale' ? 'badge-primary' : 'badge-success'}`}>
                                        {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                                    </span>
                                    {property.isFeatured && <span className="badge badge-warning">⭐ Featured</span>}
                                </div>
                                <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
                                    <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                                        style={{ background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
                                        <Share2 size={16} color="white" />
                                    </button>
                                </div>
                            </div>
                            {images.length > 1 && (
                                <div style={{ display: 'flex', gap: 8, padding: 12, overflowX: 'auto' }}>
                                    {images.map((img, i) => (
                                        <img key={i} src={img} alt="" onClick={() => setActiveImg(i)}
                                            style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: activeImg === i ? '2px solid #6c63ff' : '2px solid transparent', opacity: activeImg === i ? 1 : 0.6, transition: 'all 0.2s' }}
                                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&q=80'; }} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                                <div>
                                    <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 8 }}>{property.title}</h1>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7298', fontSize: 14 }}>
                                        <MapPin size={14} color="#6c63ff" /> {property.location?.address}, {property.location?.city}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'Outfit, sans-serif', background: 'linear-gradient(135deg, #6c63ff, #43e5f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                        {formatPrice(property.price, property.listingType)}
                                    </div>
                                    {property.listingType === 'rent' && <div style={{ fontSize: 12, color: '#6b7298' }}>per month</div>}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', padding: 20, background: 'rgba(108,99,255,0.07)', borderRadius: 14, marginBottom: 20 }}>
                                {property.bhk && <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{property.bhk}</div><div style={{ fontSize: 12, color: '#6b7298' }}>BHK</div></div>}
                                {property.bathrooms && <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{property.bathrooms}</div><div style={{ fontSize: 12, color: '#6b7298' }}>Bathrooms</div></div>}
                                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{property.area}</div><div style={{ fontSize: 12, color: '#6b7298' }}>Sq. Ft.</div></div>
                                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{property.floor || 1}</div><div style={{ fontSize: 12, color: '#6b7298' }}>Floor</div></div>
                                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 700, color: 'white', textTransform: 'capitalize' }}>{property.furnishing?.split('-')[0]}</div><div style={{ fontSize: 12, color: '#6b7298' }}>Furnished</div></div>
                                {property.facing && <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 700, color: 'white', textTransform: 'capitalize' }}>{property.facing}</div><div style={{ fontSize: 12, color: '#6b7298' }}>Facing</div></div>}
                            </div>

                            <div className="divider" />

                            <h3 style={{ fontWeight: 600, color: 'white', marginBottom: 12 }}>Description</h3>
                            <p style={{ color: '#b0b7d3', lineHeight: 1.8 }}>{property.description}</p>

                            {/* Amenities */}
                            {property.amenities?.length > 0 && (
                                <>
                                    <div className="divider" />
                                    <h3 style={{ fontWeight: 600, color: 'white', marginBottom: 14 }}>Amenities</h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {property.amenities.map(a => (
                                            <span key={a} className="amenity-chip" style={{ textTransform: 'capitalize' }}>
                                                {amenityIcons[a] || '✓'} {a.replace('_', ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Meta */}
                            <div className="divider" />
                            <div style={{ display: 'flex', gap: 24, color: '#6b7298', fontSize: 13 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Eye size={13} /> {property.views} views</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={13} /> {new Date(property.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div style={{ position: 'sticky', top: 90 }}>
                        {/* Owner Card */}
                        <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
                            <h3 style={{ fontWeight: 600, color: 'white', marginBottom: 16, fontSize: 16 }}>Posted By</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                                <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #43e5f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'white' }}>
                                    {property.owner?.name?.[0]?.toUpperCase() || 'O'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'white' }}>{property.owner?.name || 'Owner'}</div>
                                    <div style={{ fontSize: 12, color: '#22d3a5' }}>Verified Owner ✓</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                                {property.owner?.phone && (
                                    <a href={`tel:${property.owner.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(34,211,165,0.1)', border: '1px solid rgba(34,211,165,0.3)', borderRadius: 10, padding: 12, color: '#22d3a5', fontSize: 14 }}>
                                        <Phone size={16} /> {property.owner.phone}
                                    </a>
                                )}
                                {property.owner?.email && (
                                    <a href={`mailto:${property.owner.email}`} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 10, padding: 12, color: '#6c63ff', fontSize: 14 }}>
                                        <Mail size={16} /> {property.owner.email}
                                    </a>
                                )}
                            </div>

                            <button onClick={() => setShowInquiry(!showInquiry)} className="btn btn-primary" style={{ width: '100%', borderRadius: 12 }}>
                                Send Inquiry
                            </button>
                        </div>

                        {/* Inquiry Form */}
                        {showInquiry && (
                            <div className="glass-card" style={{ padding: 24 }}>
                                <h3 style={{ fontWeight: 600, color: 'white', marginBottom: 16, fontSize: 16 }}>Send a Message</h3>
                                <form onSubmit={handleInquiry} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <textarea
                                        required
                                        placeholder="Hi, I'm interested in this property..."
                                        value={inquiry.message}
                                        onChange={e => setInquiry(p => ({ ...p, message: e.target.value }))}
                                        className="input"
                                        style={{ resize: 'vertical', minHeight: 100 }}
                                    />
                                    <input type="tel" placeholder="Your phone number" value={inquiry.phone}
                                        onChange={e => setInquiry(p => ({ ...p, phone: e.target.value }))}
                                        className="input" />
                                    <button type="submit" disabled={submitting} className="btn btn-primary" style={{ borderRadius: 10 }}>
                                        {submitting ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* Similar */}
                {similar.length > 0 && (
                    <div style={{ marginTop: 60 }}>
                        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 28 }}>Similar Properties</h2>
                        <div className="grid-3">
                            {similar.map(p => <PropertyCard key={p._id} property={p} />)}
                        </div>
                    </div>
                )}
            </div>
            <style>{`@media(max-width:1024px){.container > div:nth-child(2){grid-template-columns:1fr !important}}`}</style>
        </div>
    );
}
