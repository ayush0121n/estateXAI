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
    const cls = ratio <= 2 ? 'bg-green-100 text-green-700 border-green-200' : ratio <= 4 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-red-100 text-red-700 border-red-200';
    const label = ratio <= 2 ? 'Low Deposit' : ratio <= 4 ? '' : 'High Deposit';
    return { ratio: ratio.toFixed(1), cls, label };
};

export function PropertyCard({ property, onSave, saved }) {
    const img = property.images?.[0] || `https://source.unsplash.com/600x400/?apartment,building&sig=${property._id}`;
    const depositInfo = property.listingType === 'rent' ? getDepositInfo(property.deposit, property.price) : null;
    const isAvailableNow = property.availableFrom && new Date(property.availableFrom) <= new Date();

    return (
        <motion.div 
            className="bg-elevated rounded-card overflow-hidden cursor-pointer border border-borderSubtle/20 flex flex-col"
            whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            initial={{ boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}
        >
            <Link to={`/properties/${property._id}`} className="block flex-1 flex flex-col">
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                    <img src={img} alt={property.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80'; }}
                    />
                    {/* Top badges */}
                    <div className="absolute top-3 left-3 flex gap-2 flex-wrap max-w-[calc(100%-60px)]">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${property.listingType === 'sale' ? 'bg-primary text-white' : 'bg-accent text-white'}`}>
                            {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                        </span>
                        {property.isFeatured && <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-yellow-900 shadow-sm">⭐ Featured</span>}
                        {property.verified && <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 flex items-center gap-1 shadow-sm"><ShieldCheck size={12} /> Verified</span>}
                        {property.zeroBrokerage && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500 text-white flex items-center gap-1 shadow-sm"><Tag size={12} /> ZERO BROKERAGE</span>}
                    </div>
                    {/* Save */}
                    {onSave && (
                        <button onClick={e => { e.preventDefault(); e.stopPropagation(); onSave(property._id); }}
                            className={`absolute top-3 right-3 rounded-full w-9 h-9 flex items-center justify-center transition-all backdrop-blur-md shadow-sm ${saved ? 'bg-red-500 text-white' : 'bg-black/30 text-white hover:bg-black/50'}`}>
                            <Heart size={18} fill={saved ? 'currentColor' : 'transparent'} />
                        </button>
                    )}
                    {/* Available Now badge */}
                    {isAvailableNow && (
                        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1 shadow-sm">
                            <Calendar size={12} /> Available Now
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-baseline justify-between mb-1">
                        <div className="text-2xl font-bold text-primary font-sans tracking-tight">
                            {formatPrice(property.price, property.listingType)}
                        </div>
                        {/* Deposit indicator */}
                        {depositInfo && (
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border flex items-center gap-0.5 ${depositInfo.cls}`}>
                                <IndianRupee size={10} /> Dep: {depositInfo.ratio}×
                            </span>
                        )}
                    </div>
                    <h3 className="text-base font-semibold text-primary mb-2 line-clamp-1 leading-snug">
                        {property.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted mb-3.5">
                        <MapPin size={14} className="text-accent shrink-0" />
                        <span className="truncate">{property.location?.address}</span>
                    </div>

                    <div className="flex gap-4 text-sm text-primary/80 font-medium mb-auto">
                        {property.bhk && (
                            <span className="flex items-center gap-1.5">
                                <BedDouble size={16} className="text-accent" /> {property.bhk} BHK
                            </span>
                        )}
                        {property.bathrooms && (
                            <span className="flex items-center gap-1.5">
                                <Bath size={16} className="text-accent" /> {property.bathrooms} Bath
                            </span>
                        )}
                        <span className="flex items-center gap-1.5">
                            <Square size={16} className="text-accent" /> {property.area} sqft
                        </span>
                    </div>

                    <div className="flex gap-2 flex-wrap mt-4">
                        {property.owner?.role === 'owner' && <span className="px-2 py-1 bg-orange-100 text-orange-700 border border-orange-200 rounded text-xs font-medium">👤 Direct Owner</span>}
                        {property.bachelorFriendly && property.petFriendly && property.societyRules?.nonVegAllowed !== false ? (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 border border-purple-200 rounded text-xs font-medium">🌈 All Welcome</span>
                        ) : (
                            <>
                                {property.bachelorFriendly && <span className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded text-xs font-medium">👨‍🎓 Bachelor Friendly</span>}
                                {property.petFriendly && <span className="px-2 py-1 bg-teal-50 text-teal-600 border border-teal-100 rounded text-xs font-medium">🐾 Pet Friendly</span>}
                            </>
                        )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-borderSubtle/15 flex justify-between items-center text-xs text-muted font-medium">
                        <span className="capitalize">{property.type}</span>
                        <span className="capitalize">{property.furnishing?.replace('-', ' ')}</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export function PGCard({ pg, onSave, saved }) {
    const img = pg.images?.[0] || `https://source.unsplash.com/600x400/?hostel,room&sig=${pg._id}`;
    const qualityScores = [pg.foodQuality, pg.cleanlinessRating, pg.safetyRating, pg.waterSupply, pg.powerBackup, pg.hygieneRating].filter(Boolean);
    const avgQuality = qualityScores.length > 0 ? (qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length) : null;

    return (
        <motion.div 
            className="bg-elevated rounded-card overflow-hidden cursor-pointer border border-borderSubtle/20 flex flex-col"
            whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            initial={{ boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}
        >
            <Link to={`/pgs/${pg._id}`} className="block flex-1 flex flex-col">
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                    <img src={img} alt={pg.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'; }}
                    />
                    <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm text-white ${pg.genderType === 'male' ? 'bg-blue-600' : pg.genderType === 'female' ? 'bg-pink-500' : 'bg-purple-500'}`}>
                            {pg.genderType === 'male' ? '♂ Boys' : pg.genderType === 'female' ? '♀ Girls' : '⚥ Unisex'}
                        </span>
                        {pg.isFeatured && <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-yellow-900 shadow-sm">⭐ Featured</span>}
                        {pg.verified && <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 flex items-center gap-1 shadow-sm"><ShieldCheck size={12} /> Verified</span>}
                    </div>
                    {onSave && (
                        <button onClick={e => { e.preventDefault(); e.stopPropagation(); onSave(pg._id); }}
                            className={`absolute top-3 right-3 rounded-full w-9 h-9 flex items-center justify-center transition-all backdrop-blur-md shadow-sm ${saved ? 'bg-red-500 text-white' : 'bg-black/30 text-white hover:bg-black/50'}`}>
                            <Heart size={18} fill={saved ? 'currentColor' : 'transparent'} />
                        </button>
                    )}
                    {pg.availableRooms > 0 ? (
                        <span className="absolute bottom-3 right-3 bg-green-500 text-white rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm">
                            {pg.availableRooms} Rooms Avail
                        </span>
                    ) : (
                        <span className="absolute bottom-3 right-3 bg-red-500 text-white rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm">
                            Full
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-baseline justify-between mb-1">
                        <div className="text-2xl font-bold text-primary font-sans tracking-tight">
                            ₹{pg.rentPerMonth?.toLocaleString()}<span className="text-sm font-medium text-muted">/mo</span>
                        </div>
                        {/* Quality Index badge */}
                        {avgQuality && (
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                                avgQuality >= 4 ? 'bg-green-100 text-green-700 border-green-200' : 
                                avgQuality >= 3 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                                'bg-red-100 text-red-700 border-red-200'
                            }`}>
                                QI {avgQuality.toFixed(1)}/5
                            </span>
                        )}
                    </div>
                    <h3 className="text-base font-semibold text-primary mb-2 line-clamp-1 leading-snug">
                        {pg.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted mb-3.5">
                        <MapPin size={14} className="text-accent shrink-0" />
                        <span className="truncate">{pg.location?.address}</span>
                    </div>

                    {/* Amenities quick view */}
                    <div className="flex gap-2 flex-wrap mb-auto">
                        {pg.amenities?.wifi && <span className="flex items-center gap-1 text-xs font-medium text-primary/70 bg-surface px-2 py-1 rounded border border-borderSubtle/10"><Wifi size={12} /> WiFi</span>}
                        {pg.amenities?.food && <span className="flex items-center gap-1 text-xs font-medium text-primary/70 bg-surface px-2 py-1 rounded border border-borderSubtle/10"><UtensilsCrossed size={12} /> Food</span>}
                        {pg.amenities?.ac && <span className="flex items-center gap-1 text-xs font-medium text-primary/70 bg-surface px-2 py-1 rounded border border-borderSubtle/10"><AirVent size={12} /> AC</span>}
                    </div>

                    <div className="mt-4 pt-3 border-t border-borderSubtle/15 flex justify-between items-center">
                        <div className="flex items-center gap-1 text-sm font-medium text-yellow-600">
                            <Star size={14} fill="currentColor" />
                            {pg.rating?.toFixed(1)} <span className="text-muted text-xs">({pg.reviewCount})</span>
                        </div>
                        <span className="text-xs font-medium text-muted capitalize">{pg.type}</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

// Skeleton loading component for cards
export function SkeletonCard() {
    return (
        <div className="bg-elevated rounded-card overflow-hidden border border-borderSubtle/20 h-[380px] animate-pulse flex flex-col">
            <div className="h-56 bg-borderSubtle/20" />
            <div className="p-4 flex-1 flex flex-col gap-3">
                <div className="h-6 bg-borderSubtle/20 rounded w-1/3" />
                <div className="h-5 bg-borderSubtle/20 rounded w-3/4" />
                <div className="h-4 bg-borderSubtle/20 rounded w-full mt-2" />
                <div className="flex gap-2 mt-auto">
                    <div className="h-6 bg-borderSubtle/20 rounded w-16" />
                    <div className="h-6 bg-borderSubtle/20 rounded w-16" />
                </div>
            </div>
        </div>
    );
}
