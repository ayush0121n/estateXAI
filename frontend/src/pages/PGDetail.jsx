/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowLeft, Star, Wifi, UtensilsCrossed, AirVent, Tv, WashingMachine, Dumbbell, Shield, Clock, Users, Eye, Sparkles, Footprints, Link2 } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { PGCard } from '../components/ListingCard';
import toast from 'react-hot-toast';
import CommuteScorer from '../components/CommuteScorer';
import NeighborhoodCard from '../components/NeighborhoodCard';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, staggerContainer, staggerItem } from '../utils/animations';

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

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-surface"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
    if (!pg) return null;

    const images = pg.images?.length > 0 ? pg.images : [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80'
    ];

    const amenityList = [
        { key: 'wifi', label: 'WiFi', icon: <Wifi className="w-3.5 h-3.5" /> },
        { key: 'food', label: 'Food', icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
        { key: 'ac', label: 'AC', icon: <AirVent className="w-3.5 h-3.5" /> },
        { key: 'tv', label: 'TV', icon: <Tv className="w-3.5 h-3.5" /> },
        { key: 'laundry', label: 'Laundry', icon: <WashingMachine className="w-3.5 h-3.5" /> },
        { key: 'gym', label: 'Gym', icon: <Dumbbell className="w-3.5 h-3.5" /> },
        { key: 'cctv', label: 'CCTV', icon: <Shield className="w-3.5 h-3.5" /> },
        { key: 'hotWater', label: 'Hot Water', icon: '🚿' },
        { key: 'studyRoom', label: 'Study Room', icon: '📚' },
        { key: 'housekeeping', label: 'Housekeeping', icon: '🧹' },
        { key: 'parking', label: 'Parking', icon: '🚗' },
        { key: 'refrigerator', label: 'Refrigerator', icon: '🧊' }
    ];

    return (
        <div className="light-page min-h-screen pt-6 pb-20 font-sans">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-muted hover:text-primary transition-colors text-sm font-medium mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to PGs
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="lg:col-span-2">
                        {/* Gallery */}
                        <motion.div variants={staggerItem} className="bg-elevated border border-borderSubtle/20 rounded-card overflow-hidden shadow-sm mb-6">
                            <div className="h-[380px] relative overflow-hidden group">
                                <img src={images[activeImg]} alt={pg.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=80'; }} />
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md shadow-sm ${pg.genderType === 'male' ? 'bg-blue-500 text-white' : pg.genderType === 'female' ? 'bg-pink-500 text-white' : 'bg-emerald-500 text-white'}`}>
                                        {pg.genderType === 'male' ? '♂ Boys PG' : pg.genderType === 'female' ? '♀ Girls PG' : '⚥ Unisex'}
                                    </span>
                                    <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md shadow-sm ${pg.availableRooms > 0 ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                        {pg.availableRooms > 0 ? `${pg.availableRooms} Available` : 'Full'}
                                    </span>
                                </div>
                            </div>
                            {images.length > 1 && (
                                <div className="flex gap-2 p-3 overflow-x-auto">
                                    {images.map((img, i) => (
                                        <img key={i} src={img} alt="" onClick={() => setActiveImg(i)}
                                            className={`w-20 h-16 object-cover rounded-lg cursor-pointer transition-all border-2 ${activeImg === i ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=300&q=80'; }} />
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Details */}
                        <motion.div variants={staggerItem} className="bg-elevated border border-borderSubtle/20 rounded-card p-6 md:p-8 shadow-sm mb-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div>
                                    <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-2">{pg.name}</h1>
                                    <div className="flex items-center gap-1.5 text-muted text-sm font-medium mb-2">
                                        <MapPin className="w-4 h-4 text-primary" /> {pg.location?.address}, {pg.location?.city}
                                    </div>
                                    {pg.rating > 0 && (
                                        <div className="flex items-center gap-1.5 text-amber-500 text-sm font-bold">
                                            <Star className="w-4 h-4 fill-current" /> {pg.rating?.toFixed(1)} <span className="text-muted font-medium">({pg.reviewCount} reviews)</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-left md:text-right">
                                    <div className="text-4xl font-bold text-primary font-serif">
                                        ₹{pg.rentPerMonth?.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-muted font-medium mt-1">per month</div>
                                    {pg.securityDeposit > 0 && <div className="text-xs text-emerald-600 font-bold mt-1">Deposit: ₹{pg.securityDeposit?.toLocaleString()}</div>}
                                </div>
                            </div>

                            {/* Quick stats */}
                            <div className="flex flex-wrap gap-4 md:gap-8 p-5 bg-surface border border-borderSubtle/10 rounded-xl mb-8">
                                <div className="text-center flex-1"><div className="text-xl font-bold text-primary">{pg.totalRooms}</div><div className="text-xs font-semibold text-muted">Total Rooms</div></div>
                                <div className="text-center flex-1"><div className="text-xl font-bold text-emerald-600">{pg.availableRooms}</div><div className="text-xs font-semibold text-muted">Available</div></div>
                                <div className="text-center flex-1"><div className="text-xl font-bold text-primary capitalize">{pg.type}</div><div className="text-xs font-semibold text-muted">Type</div></div>
                                <div className="text-center flex-1">
                                    <div className="text-sm font-bold text-primary capitalize leading-tight">{pg.sharingType?.join(', ')}</div>
                                    <div className="text-xs font-semibold text-muted mt-1">Sharing</div>
                                </div>
                            </div>

                            <p className="text-muted leading-relaxed whitespace-pre-line mb-8">{pg.description}</p>

                            {/* Amenities */}
                            <hr className="border-borderSubtle/20 my-8" />
                            <h3 className="font-bold text-primary text-lg mb-4">Amenities</h3>
                            <div className="flex flex-wrap gap-2.5">
                                {amenityList.filter(a => pg.amenities?.[a.key]).map(a => (
                                    <span key={a.key} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-semibold">
                                        {a.icon} {a.label}
                                    </span>
                                ))}
                            </div>

                            {/* Meals */}
                            {(pg.meals?.breakfast || pg.meals?.lunch || pg.meals?.dinner) && (
                                <>
                                    <hr className="border-borderSubtle/20 my-8" />
                                    <h3 className="font-bold text-primary text-lg mb-4">Meals Included</h3>
                                    <div className="flex gap-2.5">
                                        {pg.meals?.breakfast && <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-xs font-semibold">🌅 Breakfast</span>}
                                        {pg.meals?.lunch && <span className="px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full text-orange-700 text-xs font-semibold">☀️ Lunch</span>}
                                        {pg.meals?.dinner && <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-700 text-xs font-semibold">🌙 Dinner</span>}
                                    </div>
                                </>
                            )}

                            {/* Rules */}
                            {pg.rules?.curfewTime && (
                                <>
                                    <hr className="border-borderSubtle/20 my-8" />
                                    <h3 className="font-bold text-primary text-lg mb-4">House Rules</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {pg.rules?.curfewTime && <div className="flex items-center gap-1.5 text-sm font-medium text-muted"><Clock className="w-4 h-4 text-amber-500" /> Curfew: {pg.rules.curfewTime}</div>}
                                        <div className={`text-sm font-semibold flex items-center gap-1.5 ${pg.rules?.guestsAllowed ? 'text-emerald-600' : 'text-red-500'}`}>{pg.rules?.guestsAllowed ? '✓ Guests Allowed' : '✗ No Guests'}</div>
                                        <div className={`text-sm font-semibold flex items-center gap-1.5 ${pg.rules?.smokingAllowed ? 'text-emerald-600' : 'text-red-500'}`}>{pg.rules?.smokingAllowed ? '✓ Smoking Allowed' : '✗ No Smoking'}</div>
                                    </div>
                                </>
                            )}

                            {/* Nearby Institutions */}
                            {pg.location?.nearbyInstitutions?.length > 0 && (
                                <>
                                    <hr className="border-borderSubtle/20 my-8" />
                                    <h3 className="font-bold text-primary text-lg mb-4">Nearby Institutions</h3>
                                    <div className="flex flex-wrap gap-2.5">
                                        {pg.location.nearbyInstitutions.map((inst, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-surface border border-borderSubtle/20 rounded-full text-primary text-xs font-semibold flex items-center gap-1.5">
                                                🏛️ {inst}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}

                            <hr className="border-borderSubtle/20 my-8" />
                            <div className="text-sm text-muted font-medium flex items-center gap-1.5">
                                <Eye className="w-4 h-4" /> {pg.views} people viewed this listing
                            </div>

                            {/* Reviews Section */}
                            {pg.reviews && pg.reviews.length > 0 && (
                                <>
                                    <hr className="border-borderSubtle/20 my-8" />
                                    <h3 className="font-bold text-primary text-xl mb-6">Reviews & Ratings</h3>
                                    <div className="flex flex-col gap-4">
                                        {pg.reviews.map((r, i) => (
                                            <div key={i} className="bg-surface border border-borderSubtle/10 p-5 rounded-xl">
                                                <div className="flex justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${r.userType === 'owner' ? 'bg-primary' : 'bg-accent'}`}>
                                                            {r.user.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="text-primary font-bold text-sm flex items-center gap-2">
                                                                {r.user}
                                                                {r.userType === 'owner' && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Owner</span>}
                                                            </div>
                                                            <div className="text-muted text-xs font-medium">
                                                                {new Date(r.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-amber-400 text-lg tracking-widest drop-shadow-sm">
                                                        {'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}
                                                    </div>
                                                </div>
                                                <p className="text-muted text-sm leading-relaxed italic m-0">
                                                    "{r.comment}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div variants={fadeIn} initial="initial" animate="animate" className="lg:sticky lg:top-24 flex flex-col gap-6">
                        <div className="bg-elevated border border-borderSubtle/20 rounded-card p-6 shadow-sm">
                            <h3 className="font-bold text-primary mb-5 text-base">Contact Owner</h3>
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl shadow-inner">
                                    {pg.owner?.name?.[0]?.toUpperCase() || 'O'}
                                </div>
                                <div>
                                    <div className="font-bold text-primary">{pg.owner?.name}</div>
                                    <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">Verified Owner <Shield className="w-3 h-3" /></div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 mb-6">
                                {pg.owner?.phone && (
                                    <a href={`tel:${pg.owner.phone}`} className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-btn p-3 text-emerald-700 text-sm font-bold hover:bg-emerald-100 transition-colors">
                                        <Phone className="w-4 h-4" /> {pg.owner.phone}
                                    </a>
                                )}
                            </div>
                            {!showInquiry ? (
                                <button onClick={() => setShowInquiry(true)} className="btn btn-primary w-full shadow-md hover:shadow-lg">
                                    Send Inquiry
                                </button>
                            ) : (
                                <AnimatePresence>
                                    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={handleInquiry} className="flex flex-col gap-3">
                                        <textarea required placeholder="Hi, I'm interested in this PG..." value={inquiry.message}
                                            onChange={e => setInquiry(p => ({ ...p, message: e.target.value }))}
                                            className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary text-sm min-h-[100px] resize-y" />
                                        <input type="tel" placeholder="Your phone number" value={inquiry.phone}
                                            onChange={e => setInquiry(p => ({ ...p, phone: e.target.value }))} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-2 outline-none focus:border-primary text-primary text-sm" />
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setShowInquiry(false)} className="btn btn-secondary bg-surface flex-1">Cancel</button>
                                            <button type="submit" disabled={submitting} className="btn btn-primary flex-[2]">
                                                {submitting ? 'Sending...' : 'Send'}
                                            </button>
                                        </div>
                                    </motion.form>
                                </AnimatePresence>
                            )}
                        </div>
                    </motion.div>
                </div>

                {similar.length > 0 && (
                    <motion.div variants={fadeIn} initial="initial" animate="animate" className="mt-16">
                        <h2 className="font-serif text-2xl font-bold text-primary mb-6">Similar PGs</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {similar.map(p => <PGCard key={p._id} pg={p} />)}
                        </div>
                    </motion.div>
                )}

                {/* AI Commute Scorer & Neighborhood */}
                <motion.div variants={fadeIn} initial="initial" animate="animate" className="mt-16 mb-8">
                    <h2 className="font-serif text-2xl font-bold text-primary mb-6">Location Intelligence</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Walkability & Connectivity */}
                        <div className="bg-elevated border border-borderSubtle/20 rounded-card p-6 md:p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-primary font-bold text-lg">Area Analysis</h3>
                                    <div className="text-muted text-sm font-medium">Smart scores based on surroundings</div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-6">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <div className="flex items-center gap-2 text-muted text-sm font-semibold">
                                            <Footprints className="w-4 h-4 text-primary" /> Walkability Score
                                        </div>
                                        <div className="text-primary font-bold">{pg.walkabilityScore || 85}/100</div>
                                    </div>
                                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${pg.walkabilityScore || 85}%` }} />
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <div className="flex items-center gap-2 text-muted text-sm font-semibold">
                                            <Link2 className="w-4 h-4 text-emerald-600" /> Connectivity Score
                                        </div>
                                        <div className="text-primary font-bold">{pg.connectivityScore || 88}/100</div>
                                    </div>
                                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${pg.connectivityScore || 88}%` }} />
                                    </div>
                                </div>
                                
                                {pg.futureDevelopment && (
                                    <div className="mt-2 p-4 bg-surface border border-borderSubtle/10 rounded-xl">
                                        <div className="text-primary text-xs font-bold uppercase tracking-wider mb-2">NEIGHBORHOOD VIBE</div>
                                        <div className="text-muted text-sm leading-relaxed font-medium italic">"{pg.futureDevelopment}"</div>
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
                </motion.div>
            </div>
        </div>
    );
}
