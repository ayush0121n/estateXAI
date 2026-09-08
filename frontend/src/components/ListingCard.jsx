/* eslint-disable */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Square, Heart, Star, Wifi, UtensilsCrossed, AirVent, ShieldCheck, Tag, Calendar, IndianRupee } from 'lucide-react';

const formatPrice = (price, type) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString()}${type === 'rent' ? '/mo' : ''}`;
};

const getDepositInfo = (deposit, rent) => {
    if (!deposit || !rent || rent === 0) return null;
    const ratio = deposit / rent;
    const cls = ratio <= 2 ? 'deposit-low' : ratio <= 4 ? 'deposit-medium' : 'deposit-high';
    const label = ratio <= 2 ? 'Low Deposit' : ratio <= 4 ? '' : 'High Deposit';
    return { ratio: ratio.toFixed(1), cls, label };
};

export function PropertyCard({ property, onSave, saved }) {
    const img = property.images?.[0] || `https://source.unsplash.com/600x400/?apartment,building&sig=${property._id}`;
    const depositInfo = property.listingType === 'rent' ? getDepositInfo(property.deposit, property.price) : null;
    const isAvailableNow = property.availableFrom && new Date(property.availableFrom) <= new Date();

    return (
        <motion.div className="glass-card" style={{ overflow: 'hidden', cursor: 'pointer' }}
            whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            initial={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
        >
            <Link to={`/properties/${property._id}`} style={{ display: 'block' }}>
                {/* Image */}
                <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                    <img src={img} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80'; }}
                    />
                    {/* Top badges */}
                    <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 'calc(100% - 60px)' }}>
                        <span className={`badge ${property.listingType === 'sale' ? 'badge-primary' : 'badge-success'}`}>
                            {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                        </span>
                        {property.isFeatured && <span className="badge badge-warning">⭐ Featured</span>}
                        {property.verified && <span className="trust-badge trust-badge-verified"><ShieldCheck size={11} /> Verified</span>}
                        {property.zeroBrokerage && <span className="trust-badge trust-badge-zero-brokerage"><Tag size={11} /> Zero Brokerage</span>}
                    </div>
                    {/* Save */}
                    {onSave && (
                        <button onClick={e => { e.preventDefault(); e.stopPropagation(); onSave(property._id); }}
                            style={{ position: 'absolute', top: 12, right: 12, background: saved ? 'rgba(239,68,68,0.9)' : 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(10px)' }}>
                            <Heart size={16} color="white" fill={saved ? 'white' : 'transparent'} />
                        </button>
                    )}
                    {/* Available Now badge */}
                    {isAvailableNow && (
                        <span className="trust-badge trust-badge-available" style={{ position: 'absolute', bottom: 12, right: 12 }}>
                            <Calendar size={11} /> Available Now
                        </span>
                    )}
                </div>

                {/* Content */}
                <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>
                            {formatPrice(property.price, property.listingType)}
                        </div>
                        {/* Deposit indicator */}
                        {depositInfo && (
                            <span className={`deposit-indicator ${depositInfo.cls}`}>
                                <IndianRupee size={10} /> Deposit {depositInfo.ratio}× rent
                            </span>
                        )}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 8, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {property.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7298', fontSize: 13, marginBottom: 14 }}>
                        <MapPin size={13} color="var(--primary)" />
                        {property.location?.address}
                    </div>

                    <div style={{ display: 'flex', gap: 16, color: '#b0b7d3', fontSize: 13 }}>
                        {property.bhk && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <BedDouble size={14} color="var(--primary)" /> {property.bhk} BHK
                            </span>
                        )}
                        {property.bathrooms && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Bath size={14} color="var(--primary)" /> {property.bathrooms} Bath
                            </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Square size={14} color="var(--primary)" /> {property.area} sqft
                        </span>
                    </div>

                    {/* India-specific trust tags */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                        {property.bachelorFriendly && <span className="trust-badge trust-badge-bachelor">👨‍🎓 Bachelor Friendly</span>}
                        {property.petFriendly && <span className="trust-badge trust-badge-pet">🐾 Pet Friendly</span>}
                        {property.deposit > 0 && property.price > 0 && property.deposit / property.price <= 2 && (
                            <span className="trust-badge trust-badge-low-deposit">💰 Low Deposit</span>
                        )}
                    </div>

                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(201, 163, 94,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#6b7298' }}>
                        <span style={{ textTransform: 'capitalize', color: '#b0b7d3' }}>{property.type}</span>
                        <span style={{ textTransform: 'capitalize' }}>{property.furnishing?.replace('-', ' ')}</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export function PGCard({ pg, onSave, saved }) {
    const img = pg.images?.[0] || `https://source.unsplash.com/600x400/?hostel,room&sig=${pg._id}`;
    // Quality score (average of available quality ratings)
    const qualityScores = [pg.foodQuality, pg.cleanlinessRating, pg.safetyRating, pg.waterSupply, pg.powerBackup, pg.hygieneRating].filter(Boolean);
    const avgQuality = qualityScores.length > 0 ? (qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length) : null;

    return (
        <motion.div className="glass-card" style={{ overflow: 'hidden', cursor: 'pointer' }}
            whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            initial={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
        >
            <Link to={`/pgs/${pg._id}`} style={{ display: 'block' }}>
                {/* Image */}
                <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                    <img src={img} alt={pg.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'; }}
                    />
                    <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span className={`badge ${pg.genderType === 'male' ? 'badge-primary' : pg.genderType === 'female' ? 'badge-danger' : 'badge-success'}`}>
                            {pg.genderType === 'male' ? '♂ Boys' : pg.genderType === 'female' ? '♀ Girls' : '⚥ Unisex'}
                        </span>
                        {pg.isFeatured && <span className="badge badge-warning">⭐ Featured</span>}
                        {pg.verified && <span className="trust-badge trust-badge-verified"><ShieldCheck size={11} /> Verified</span>}
                    </div>
                    {onSave && (
                        <button onClick={e => { e.preventDefault(); e.stopPropagation(); onSave(pg._id); }}
                            style={{ position: 'absolute', top: 12, right: 12, background: saved ? 'rgba(239,68,68,0.9)' : 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(10px)' }}>
                            <Heart size={16} color="white" fill={saved ? 'white' : 'transparent'} />
                        </button>
                    )}
                    {pg.availableRooms > 0 ? (
                        <span style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(34,211,165,0.9)', color: 'white', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>
                            {pg.availableRooms} Rooms Available
                        </span>
                    ) : (
                        <span style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(239,68,68,0.9)', color: 'white', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>Full</span>
                    )}
                </div>

                {/* Content */}
                <div style={{ padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>
                            ₹{pg.rentPerMonth?.toLocaleString()}<span style={{ fontSize: 13, fontWeight: 400, color: '#6b7298' }}>/month</span>
                        </div>
                        {/* Quality Index badge */}
                        {avgQuality && (
                            <span style={{
                                fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                                background: avgQuality >= 4 ? 'rgba(34,197,94,0.12)' : avgQuality >= 3 ? 'rgba(251,191,36,0.12)' : 'rgba(239,68,68,0.12)',
                                color: avgQuality >= 4 ? '#4ade80' : avgQuality >= 3 ? '#fbbf24' : '#f87171',
                                border: `1px solid ${avgQuality >= 4 ? 'rgba(34,197,94,0.3)' : avgQuality >= 3 ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)'}`
                            }}>
                                QI {avgQuality.toFixed(1)}/5
                            </span>
                        )}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pg.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7298', fontSize: 13, marginBottom: 14 }}>
                        <MapPin size={13} color="var(--primary)" />
                        {pg.location?.address}
                    </div>

                    {/* Amenities quick view */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {pg.amenities?.wifi && <span className="amenity-chip"><Wifi size={12} /> WiFi</span>}
                        {pg.amenities?.food && <span className="amenity-chip"><UtensilsCrossed size={12} /> Food</span>}
                        {pg.amenities?.ac && <span className="amenity-chip"><AirVent size={12} /> AC</span>}
                    </div>

                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(201, 163, 94,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ffd700', fontSize: 13 }}>
                            <Star size={13} fill="#ffd700" />
                            {pg.rating?.toFixed(1)} <span style={{ color: '#6b7298' }}>({pg.reviewCount})</span>
                        </div>
                        <span style={{ fontSize: 12, color: '#6b7298', textTransform: 'capitalize' }}>{pg.type}</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

// Skeleton loading component for cards
export function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <div className="skeleton-image" />
            <div className="skeleton-content">
                <div className="skeleton-line short" />
                <div className="skeleton-line medium" />
                <div className="skeleton-line" />
                <div className="skeleton-line short" />
            </div>
        </div>
    );
}
