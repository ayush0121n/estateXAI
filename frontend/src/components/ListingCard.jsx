import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Square, Heart, Star, Wifi, UtensilsCrossed, AirVent } from 'lucide-react';

const formatPrice = (price, type) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString()}${type === 'rent' ? '/mo' : ''}`;
};

export function PropertyCard({ property, onSave, saved }) {
    const img = property.images?.[0] || `https://source.unsplash.com/600x400/?apartment,building&sig=${property._id}`;

    return (
        <div className="glass-card" style={{ overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)'; }}
        >
            <Link to={`/properties/${property._id}`} style={{ display: 'block' }}>
                {/* Image */}
                <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                    <img src={img} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80'; }}
                    />
                    {/* Badges */}
                    <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8 }}>
                        <span className={`badge ${property.listingType === 'sale' ? 'badge-primary' : 'badge-success'}`}>
                            {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                        </span>
                        {property.isFeatured && <span className="badge badge-warning">⭐ Featured</span>}
                    </div>
                    {/* Save */}
                    {onSave && (
                        <button onClick={e => { e.preventDefault(); e.stopPropagation(); onSave(property._id); }}
                            style={{ position: 'absolute', top: 12, right: 12, background: saved ? 'rgba(239,68,68,0.9)' : 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(10px)' }}>
                            <Heart size={16} color="white" fill={saved ? 'white' : 'transparent'} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div style={{ padding: '16px' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#6c63ff', fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>
                        {formatPrice(property.price, property.listingType)}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 8, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {property.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7298', fontSize: 13, marginBottom: 14 }}>
                        <MapPin size={13} color="#6c63ff" />
                        {property.location?.address}
                    </div>

                    <div style={{ display: 'flex', gap: 16, color: '#b0b7d3', fontSize: 13 }}>
                        {property.bhk && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <BedDouble size={14} color="#6c63ff" /> {property.bhk} BHK
                            </span>
                        )}
                        {property.bathrooms && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Bath size={14} color="#6c63ff" /> {property.bathrooms} Bath
                            </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Square size={14} color="#6c63ff" /> {property.area} sqft
                        </span>
                    </div>

                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(108,99,255,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#6b7298' }}>
                        <span style={{ textTransform: 'capitalize', color: '#b0b7d3' }}>{property.type}</span>
                        <span style={{ textTransform: 'capitalize' }}>{property.furnishing?.replace('-', ' ')}</span>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export function PGCard({ pg, onSave, saved }) {
    const img = pg.images?.[0] || `https://source.unsplash.com/600x400/?hostel,room&sig=${pg._id}`;

    return (
        <div className="glass-card" style={{ overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)'; }}
        >
            <Link to={`/pgs/${pg._id}`} style={{ display: 'block' }}>
                {/* Image */}
                <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                    <img src={img} alt={pg.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'; }}
                    />
                    <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span className={`badge ${pg.genderType === 'male' ? 'badge-primary' : pg.genderType === 'female' ? 'badge-danger' : 'badge-success'}`}>
                            {pg.genderType === 'male' ? '♂ Boys' : pg.genderType === 'female' ? '♀ Girls' : '⚥ Unisex'}
                        </span>
                        {pg.isFeatured && <span className="badge badge-warning">⭐ Featured</span>}
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
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#6c63ff', fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>
                        ₹{pg.rentPerMonth?.toLocaleString()}<span style={{ fontSize: 13, fontWeight: 400, color: '#6b7298' }}>/month</span>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pg.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7298', fontSize: 13, marginBottom: 14 }}>
                        <MapPin size={13} color="#6c63ff" />
                        {pg.location?.address}
                    </div>

                    {/* Amenities quick view */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {pg.amenities?.wifi && <span className="amenity-chip"><Wifi size={12} /> WiFi</span>}
                        {pg.amenities?.food && <span className="amenity-chip"><UtensilsCrossed size={12} /> Food</span>}
                        {pg.amenities?.ac && <span className="amenity-chip"><AirVent size={12} /> AC</span>}
                    </div>

                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(108,99,255,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ffd700', fontSize: 13 }}>
                            <Star size={13} fill="#ffd700" />
                            {pg.rating?.toFixed(1)} <span style={{ color: '#6b7298' }}>({pg.reviewCount})</span>
                        </div>
                        <span style={{ fontSize: 12, color: '#6b7298', textTransform: 'capitalize' }}>{pg.type}</span>
                    </div>
                </div>
            </Link>
        </div>
    );
}
