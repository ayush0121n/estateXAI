/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Share2, Eye, Calendar, Shield, Wifi, Car, Dumbbell, Waves, GitCompare, Footprints, Link2, Sparkles, Phone, Mail } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { PropertyCard } from '../components/ListingCard';
import toast from 'react-hot-toast';
import PricePredictionWidget from '../components/PricePredictionWidget';
import PropertyMap from '../components/PropertyMap';
import CommuteScorer from '../components/CommuteScorer';
import NeighborhoodCard from '../components/NeighborhoodCard';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, staggerContainer, staggerItem } from '../utils/animations';

const amenityIcons = { parking: <Car className="w-3.5 h-3.5" />, gym: <Dumbbell className="w-3.5 h-3.5" />, pool: <Waves className="w-3.5 h-3.5" />, security: <Shield className="w-3.5 h-3.5" />, wifi: <Wifi className="w-3.5 h-3.5" /> };

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
    const [isEditingFutureDev, setIsEditingFutureDev] = useState(false);
    const [futureDevInput, setFutureDevInput] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [propRes, simRes] = await Promise.all([
                    api.get(`/properties/${id}`),
                    api.get(`/recommendations/similar/property/${id}`)
                ]);
                let propData = propRes.data.property;
                
                if (!propData.walkabilityScore || propData.walkabilityScore === 0) {
                    try {
                        const liRes = await api.get(`/commute/location-intelligence/${id}`);
                        if (liRes.data.success) {
                            propData.walkabilityScore = liRes.data.walkabilityScore;
                            propData.connectivityScore = liRes.data.connectivityScore;
                            if (liRes.data.futureDevelopment) propData.futureDevelopment = liRes.data.futureDevelopment;
                        }
                    } catch (e) {
                        console.error("Location intelligence error", e);
                    }
                }
                
                setProperty(propData);
                setFutureDevInput(propData.futureDevelopment || '');
                setSimilar(simRes.data.similar || []);
            } catch (err) {
                toast.error('Property not found');
                navigate('/properties');
            } finally { setLoading(false); }
        };
        fetchData();
    }, [id]);

    const handleSaveFutureDev = async () => {
        try {
            const res = await api.put(`/properties/${id}`, { futureDevelopment: futureDevInput });
            setProperty(res.data.property);
            setIsEditingFutureDev(false);
            toast.success("Future development info updated.");
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update info');
        }
    };

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

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-surface"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
    if (!property) return null;

    const images = property.images?.length > 0 ? property.images : [
        `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80`,
        `https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80`,
        `https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=900&q=80`
    ];

    return (
        <div className="light-page min-h-screen pt-6 pb-20 font-sans">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Back */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-muted hover:text-primary transition-colors text-sm font-medium mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Properties
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left Content */}
                    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="lg:col-span-2">
                        {/* Image Gallery */}
                        <motion.div variants={staggerItem} className="bg-elevated border border-borderSubtle/20 rounded-card overflow-hidden shadow-sm mb-6">
                            <div className="h-[420px] relative overflow-hidden group">
                                <img src={images[activeImg]} alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80'; }} />
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md shadow-sm ${property.listingType === 'sale' ? 'bg-primary text-white' : 'bg-emerald-500 text-white'}`}>
                                        {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                                    </span>
                                    {property.isFeatured && <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md shadow-sm bg-amber-500 text-white">⭐ Featured</span>}
                                </div>
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition-colors">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            {images.length > 1 && (
                                <div className="flex gap-2 p-3 overflow-x-auto">
                                    {images.map((img, i) => (
                                        <img key={i} src={img} alt="" onClick={() => setActiveImg(i)}
                                            className={`w-20 h-16 object-cover rounded-lg cursor-pointer transition-all border-2 ${activeImg === i ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&q=80'; }} />
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Info */}
                        <motion.div variants={staggerItem} className="bg-elevated border border-borderSubtle/20 rounded-card p-6 md:p-8 shadow-sm mb-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div>
                                    <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-2">{property.title}</h1>
                                    <div className="flex items-center gap-1.5 text-muted text-sm font-medium">
                                        <MapPin className="w-4 h-4 text-primary" /> {property.location?.address}, {property.location?.city}
                                    </div>
                                </div>
                                <div className="text-left md:text-right">
                                    <div className="text-4xl font-bold text-primary font-serif">
                                        {formatPrice(property.price, property.listingType)}
                                    </div>
                                    {property.listingType === 'rent' && <div className="text-xs text-muted font-medium mt-1">per month</div>}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex flex-wrap gap-4 md:gap-8 p-5 bg-surface border border-borderSubtle/10 rounded-xl mb-8">
                                {property.bhk && <div className="text-center flex-1"><div className="text-xl font-bold text-primary">{property.bhk}</div><div className="text-xs font-semibold text-muted">BHK</div></div>}
                                {property.bathrooms && <div className="text-center flex-1"><div className="text-xl font-bold text-primary">{property.bathrooms}</div><div className="text-xs font-semibold text-muted">Baths</div></div>}
                                <div className="text-center flex-1"><div className="text-xl font-bold text-primary">{property.area}</div><div className="text-xs font-semibold text-muted">Sq. Ft.</div></div>
                                <div className="text-center flex-1"><div className="text-xl font-bold text-primary">{property.floor || 1}</div><div className="text-xs font-semibold text-muted">Floor</div></div>
                                <div className="text-center flex-1"><div className="text-xl font-bold text-primary capitalize">{property.furnishing?.split('-')[0]}</div><div className="text-xs font-semibold text-muted">Furnished</div></div>
                                {property.facing && <div className="text-center flex-1"><div className="text-xl font-bold text-primary capitalize">{property.facing}</div><div className="text-xs font-semibold text-muted">Facing</div></div>}
                            </div>

                            <hr className="border-borderSubtle/20 my-8" />

                            <h3 className="font-bold text-primary text-lg mb-4">Description</h3>
                            <p className="text-muted leading-relaxed whitespace-pre-line">{property.description}</p>

                            {/* Amenities */}
                            {property.amenities?.length > 0 && (
                                <>
                                    <hr className="border-borderSubtle/20 my-8" />
                                    <h3 className="font-bold text-primary text-lg mb-4">Amenities</h3>
                                    <div className="flex flex-wrap gap-2.5">
                                        {property.amenities.map(a => (
                                            <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-borderSubtle/20 rounded-full text-primary text-xs font-semibold capitalize">
                                                {amenityIcons[a] || '✓'} {a.replace('_', ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Meta */}
                            <hr className="border-borderSubtle/20 my-8" />
                            <div className="flex flex-wrap items-center gap-6 text-sm text-muted font-medium">
                                <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {property.views} views</span>
                                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(property.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                <button
                                    onClick={() => {
                                        const current = JSON.parse(sessionStorage.getItem('compareList') || '[]');
                                        if (!current.includes(property._id)) {
                                            if (current.length >= 3) {
                                                toast.error('You can compare maximum 3 properties');
                                                return;
                                            }
                                            current.push(property._id);
                                            sessionStorage.setItem('compareList', JSON.stringify(current));
                                            toast.success('Added to comparison!');
                                        }
                                        navigate('/compare');
                                    }}
                                    className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-md font-semibold hover:bg-primary/20 transition-colors"
                                >
                                    <GitCompare className="w-4 h-4" /> Compare Property
                                </button>
                            </div>

                            {/* Location Intelligence Map */}
                            <div className="mt-8">
                                <PropertyMap property={property} />
                            </div>

                            {/* Reviews Section */}
                            {property.reviews && property.reviews.length > 0 && (
                                <>
                                    <hr className="border-borderSubtle/20 my-8" />
                                    <h3 className="font-bold text-primary text-xl mb-6">Reviews & Ratings</h3>
                                    <div className="flex flex-col gap-4">
                                        {property.reviews.map((r, i) => (
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

                    {/* Right Sidebar */}
                    <motion.div variants={fadeIn} initial="initial" animate="animate" className="lg:sticky lg:top-24 flex flex-col gap-6">
                        {/* Price Prediction Widget */}
                        <PricePredictionWidget property={property} />

                        {/* Deposit Calculator */}
                        {property.listingType === 'rent' && property.deposit > 0 && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-card p-6 shadow-sm">
                                <h3 className="font-bold text-emerald-800 mb-4 text-base flex items-center gap-2">
                                    <Shield className="w-5 h-5" /> Move-in Costs
                                </h3>
                                <div className="flex justify-between mb-2 text-sm text-emerald-900 font-medium">
                                    <span>First Month Rent</span>
                                    <span className="font-bold">₹{property.price.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between mb-3 text-sm text-emerald-900 font-medium">
                                    <span>Security Deposit</span>
                                    <span className="font-bold">₹{property.deposit.toLocaleString()}</span>
                                </div>
                                <div className="border-t border-emerald-200 pt-3 flex justify-between font-bold text-lg text-emerald-900">
                                    <span>Total Upfront</span>
                                    <span className="text-emerald-700">₹{(property.price + property.deposit).toLocaleString()}</span>
                                </div>
                                <div className="text-xs text-emerald-700/80 mt-3 text-center font-medium">
                                    Deposit is {(property.deposit / property.price).toFixed(1)}x monthly rent. {property.deposit / property.price <= 2 ? 'This is considered low!' : ''}
                                </div>
                            </div>
                        )}

                        {/* Owner Card */}
                        <div className="bg-elevated border border-borderSubtle/20 rounded-card p-6 shadow-sm">
                            <h3 className="font-bold text-primary mb-5 text-base">Posted By</h3>
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl shadow-inner">
                                    {property.owner?.name?.[0]?.toUpperCase() || 'O'}
                                </div>
                                <div>
                                    <div className="font-bold text-primary">{property.owner?.name || 'Owner'}</div>
                                    <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">Verified Owner <Shield className="w-3 h-3" /></div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 mb-6">
                                {property.owner?.phone && (
                                    <a href={`tel:${property.owner.phone}`} className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-btn p-3 text-emerald-700 text-sm font-bold hover:bg-emerald-100 transition-colors">
                                        <Phone className="w-4 h-4" /> {property.owner.phone}
                                    </a>
                                )}
                                {property.owner?.email && (
                                    <a href={`mailto:${property.owner.email}`} className="flex items-center justify-center gap-2 bg-primary/5 border border-primary/20 rounded-btn p-3 text-primary text-sm font-bold hover:bg-primary/10 transition-colors">
                                        <Mail className="w-4 h-4" /> Email Owner
                                    </a>
                                )}
                            </div>

                            {!showInquiry ? (
                                <button onClick={() => setShowInquiry(true)} className="btn btn-primary w-full shadow-md hover:shadow-lg">
                                    Send Message
                                </button>
                            ) : (
                                <AnimatePresence>
                                    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={handleInquiry} className="flex flex-col gap-3">
                                        <textarea
                                            required
                                            placeholder="Hi, I'm interested in this property..."
                                            value={inquiry.message}
                                            onChange={e => setInquiry(p => ({ ...p, message: e.target.value }))}
                                            className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary text-sm min-h-[100px] resize-y"
                                        />
                                        <input type="tel" placeholder="Your phone number" value={inquiry.phone}
                                            onChange={e => setInquiry(p => ({ ...p, phone: e.target.value }))}
                                            className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-2 outline-none focus:border-primary text-primary text-sm" />
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

                {/* Similar */}
                {similar.length > 0 && (
                    <motion.div variants={fadeIn} initial="initial" animate="animate" className="mt-16">
                        <h2 className="font-serif text-2xl font-bold text-primary mb-6">Similar Properties</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {similar.map(p => <PropertyCard key={p._id} property={p} />)}
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
                                        <div className="text-primary font-bold">{property.walkabilityScore || 0}/100</div>
                                    </div>
                                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${property.walkabilityScore || 0}%` }} />
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <div className="flex items-center gap-2 text-muted text-sm font-semibold">
                                            <Link2 className="w-4 h-4 text-emerald-600" /> Connectivity Score
                                        </div>
                                        <div className="text-primary font-bold">{property.connectivityScore || 0}/100</div>
                                    </div>
                                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${property.connectivityScore || 0}%` }} />
                                    </div>
                                </div>
                                
                                <div className="mt-2 p-4 bg-surface border border-borderSubtle/10 rounded-xl relative group">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-primary text-xs font-bold uppercase tracking-wider">NEIGHBORHOOD VIBE & FUTURE DEV</div>
                                        {(user?.role === 'admin' || user?._id === property.owner?._id) && !isEditingFutureDev && (
                                            <button onClick={() => setIsEditingFutureDev(true)} className="text-xs text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                    
                                    {isEditingFutureDev ? (
                                        <div className="space-y-2">
                                            <textarea 
                                                value={futureDevInput} 
                                                onChange={e => setFutureDevInput(e.target.value)} 
                                                className="w-full bg-elevated border border-borderSubtle/30 rounded p-2 text-sm text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                                rows="3"
                                                placeholder="Enter future infrastructure plans (e.g., upcoming metro station...)"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => { setIsEditingFutureDev(false); setFutureDevInput(property.futureDevelopment || ''); }} className="px-3 py-1 text-xs rounded bg-surface border border-borderSubtle text-muted hover:text-primary transition">Cancel</button>
                                                <button onClick={handleSaveFutureDev} className="px-3 py-1 text-xs rounded bg-primary text-white font-semibold">Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-muted text-sm leading-relaxed font-medium italic">
                                            {property.futureDevelopment ? `"${property.futureDevelopment}"` : 'No upcoming development information available for this area. Owners and admins can add nearby infrastructure projects via the dashboard.'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <NeighborhoodCard
                            area={property?.location?.city || property?.location?.address}
                            city={property?.location?.city}
                        />
                    </div>

                    <CommuteScorer
                        propertyLat={property?.location?.coordinates?.lat}
                        propertyLng={property?.location?.coordinates?.lng}
                    />
                </motion.div>
            </div>
        </div>
    );
}
