/* eslint-disable */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Building2, Users, MessageSquare, TrendingUp, Plus, Star, Eye, MapPin, Zap, ShieldCheck, Heart, FileText, Activity, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminDashboardTab from '../components/AdminDashboardTab';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, staggerContainer, staggerItem } from '../utils/animations';

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
            className={`flex items-center gap-2 px-5 py-2.5 rounded-btn text-sm font-medium transition-colors border-b-2 ${
                activeTab === id 
                    ? 'bg-primary/10 text-primary border-primary' 
                    : 'bg-transparent text-muted border-transparent hover:text-primary hover:bg-surface'
            }`}>
            <Icon className="w-4 h-4" /> {label}
        </button>
    );

    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationType, setVerificationType] = useState(null); // 'phone' | 'id'
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = async () => {
        setIsVerifying(true);
        try {
            const endpoint = verificationType === 'id' ? '/auth/verify-id' : '/auth/verify-phone';
            const { data } = await api.post(endpoint);
            toast.success(data.message);
            window.location.reload(); // Quick refresh to grab new profile state
        } catch (err) {
            toast.error('Verification failed. Try again.');
        } finally {
            setIsVerifying(false);
            setShowVerificationModal(false);
        }
    };

    const trustScore = fullProfile?.trustScore || 0;
    const isOwner = user.role === 'owner' || user.role === 'admin';

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-surface"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="light-page min-h-screen pt-6 pb-20 font-sans">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6 pb-16">
                
                {/* Header */}
                <motion.div variants={fadeIn} initial="initial" animate="animate" className="flex justify-between items-center flex-wrap gap-4 mb-10">
                    <div>
                        <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-1">
                            Welcome back, {user.name?.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-muted">
                            {user.role === 'admin' ? '🛡️ Admin Dashboard' : isOwner ? '🏠 Owner Dashboard' : '🔍 Tenant Dashboard'}
                        </p>
                    </div>
                    {isOwner ? (
                        <div className="flex gap-3">
                            <Link to="/list-property" className="btn btn-primary">
                                <Plus className="w-4 h-4" /> List Property
                            </Link>
                            <Link to="/list-pg" className="btn btn-secondary bg-surface">
                                <Plus className="w-4 h-4" /> List PG
                            </Link>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <Link to="/toolkit" className="btn btn-primary">
                                <FileText className="w-4 h-4" /> Rental Toolkit
                            </Link>
                            <Link to="/find-flatmates" className="btn btn-secondary bg-surface">
                                <Users className="w-4 h-4" /> Find Flatmates
                            </Link>
                        </div>
                    )}
                </motion.div>

                {/* Stats Cards */}
                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    {isOwner ? (
                        <>
                            <motion.div variants={staggerItem} className="bg-elevated border border-borderSubtle/20 rounded-card p-6 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary font-serif">{myProperties.length}</div>
                                    <div className="text-sm text-muted">Properties</div>
                                </div>
                            </motion.div>
                            <motion.div variants={staggerItem} className="bg-elevated border border-borderSubtle/20 rounded-card p-6 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary font-serif">{myPGs.length}</div>
                                    <div className="text-sm text-muted">PG Listings</div>
                                </div>
                            </motion.div>
                            <motion.div variants={staggerItem} className="bg-elevated border border-borderSubtle/20 rounded-card p-6 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary font-serif">{receivedInquiries.length}</div>
                                    <div className="text-sm text-muted">Leads Received</div>
                                </div>
                            </motion.div>
                        </>
                    ) : (
                        <>
                            <motion.div variants={staggerItem} className="bg-elevated border border-borderSubtle/20 rounded-card p-6 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center">
                                    <Heart className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary font-serif">{savedProperties.length + savedPGs.length}</div>
                                    <div className="text-sm text-muted">Saved Items</div>
                                </div>
                            </motion.div>
                            <motion.div variants={staggerItem} className="bg-elevated border border-borderSubtle/20 rounded-card p-6 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <MessageSquare className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary font-serif">{myInquiries.length}</div>
                                    <div className="text-sm text-muted">Inquiries Sent</div>
                                </div>
                            </motion.div>
                        </>
                    )}
                    
                    {/* Trust Score Card */}
                    <motion.div variants={staggerItem} onClick={() => { setVerificationType('id'); setShowVerificationModal(true); }} className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-card p-6 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity">Improve Score</div>
                        <div className="relative w-14 h-14">
                            <svg className="w-14 h-14" viewBox="0 0 64 64">
                                <circle cx="32" cy="32" r="26" fill="none" className="stroke-emerald-200" strokeWidth="6" />
                                <circle cx="32" cy="32" r="26" fill="none" className="stroke-emerald-500" strokeWidth="6"
                                    strokeDasharray={`${(trustScore / 100) * 163} 163`}
                                    strokeLinecap="round" transform="rotate(-90 32 32)"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-emerald-600">
                                {trustScore}
                            </div>
                        </div>
                        <div>
                            <div className="text-base font-bold text-primary flex items-center gap-1.5">
                                Trust Score <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                {trustScore > 85 && <span className="px-2 py-0.5 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 text-[10px] rounded-full uppercase tracking-wider font-extrabold ml-1 border border-gray-400">Platinum</span>}
                                {trustScore > 65 && trustScore <= 85 && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] rounded-full uppercase tracking-wider font-extrabold ml-1 border border-yellow-300">Gold</span>}
                            </div>
                            <div className="text-xs text-muted mt-0.5">
                                {trustScore < 60 ? 'Tap to verify Govt ID & Phone' : trustScore < 85 ? 'Good standing - Tap to improve' : 'Excellent standing'}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-borderSubtle/20 mb-8 overflow-x-auto pb-1">
                    <Tab id="overview" label="Overview" icon={Activity} />
                    {!isOwner && <Tab id="saved" label="Saved Items" icon={Heart} />}
                    {isOwner && <Tab id="listings" label="My Listings" icon={Building2} />}
                    <Tab id="inquiries" label="My Inquiries" icon={MessageSquare} />
                    {isOwner && <Tab id="received" label="Received Leads" icon={TrendingUp} />}
                    {!isOwner && recommendations.length > 0 && <Tab id="recommended" label="AI Matches" icon={Zap} />}
                </div>

                {/* Tab Content */}
                <motion.div variants={fadeIn} initial="initial" animate="animate" key={activeTab}>
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-elevated border border-borderSubtle/20 rounded-card p-7 shadow-sm">
                                <h3 className="text-primary font-bold mb-5 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-500" /> Verification Status</h3>
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-borderSubtle/10">
                                        <div>
                                            <div className="text-primary text-sm font-medium">Email Address</div>
                                            <div className="text-muted text-xs">{user.email}</div>
                                        </div>
                                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">Verified</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-borderSubtle/10">
                                        <div>
                                            <div className="text-primary text-sm font-medium">Phone Number</div>
                                            <div className="text-muted text-xs">{user.phone || 'Not provided'}</div>
                                        </div>
                                        {fullProfile?.isPhoneVerified 
                                            ? <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">Verified</span> 
                                            : <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">Pending</span>}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-primary text-sm font-medium">{isOwner ? 'Owner ID' : 'Work/College ID'}</div>
                                            <div className="text-muted text-xs">{fullProfile?.institution || fullProfile?.workplace || 'Not uploaded'}</div>
                                        </div>
                                        {fullProfile?.institution || fullProfile?.workplace 
                                            ? <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">Verified</span> 
                                            : <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">Pending</span>}
                                    </div>
                                </div>
                                <Link to="/profile" className="btn btn-secondary w-full mt-6 bg-surface">Complete Profile</Link>
                            </div>
                            
                            <div className="bg-elevated border border-borderSubtle/20 rounded-card p-7 shadow-sm">
                                <h3 className="text-primary font-bold mb-5 flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500" /> Quick Actions</h3>
                                <div className="flex flex-col gap-3">
                                    <Link to="/properties" className="flex items-center gap-3 p-3.5 bg-surface border border-borderSubtle/10 rounded-btn text-primary text-sm font-medium hover:border-primary/50 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 className="w-4 h-4 text-primary" /></div>
                                        Explore Properties
                                    </Link>
                                    <Link to="/find-flatmates" className="flex items-center gap-3 p-3.5 bg-surface border border-borderSubtle/10 rounded-btn text-primary text-sm font-medium hover:border-primary/50 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center"><Users className="w-4 h-4 text-orange-600" /></div>
                                        Find Flatmates
                                    </Link>
                                    <Link to="/toolkit" className="flex items-center gap-3 p-3.5 bg-surface border border-borderSubtle/10 rounded-btn text-primary text-sm font-medium hover:border-primary/50 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center"><FileText className="w-4 h-4 text-emerald-600" /></div>
                                        Rental Agreements
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'saved' && (
                        <div>
                            {savedProperties.length === 0 && savedPGs.length === 0 ? (
                                <div className="bg-elevated border border-borderSubtle/20 rounded-card p-12 text-center flex flex-col items-center">
                                    <Heart className="w-12 h-12 text-borderSubtle/30 mb-4" />
                                    <h3 className="text-xl font-bold text-primary mb-2">No saved items yet</h3>
                                    <p className="text-muted mb-6">Save properties and PGs you like to view them later.</p>
                                    <Link to="/properties" className="btn btn-primary">Explore Properties</Link>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-8">
                                    {savedProperties.length > 0 && (
                                        <div>
                                            <h3 className="text-primary font-bold text-lg mb-4">Saved Properties ({savedProperties.length})</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                                {savedProperties.map(prop => (
                                                    <Link to={`/properties/${prop._id}`} key={prop._id} className="bg-elevated border border-borderSubtle/20 rounded-card p-3 flex gap-4 hover:shadow-md transition-shadow">
                                                        <img src={prop.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'} alt="" className="w-24 h-24 rounded-lg object-cover" />
                                                        <div className="flex-1 flex flex-col justify-center">
                                                            <h4 className="text-primary font-semibold text-sm line-clamp-2 mb-1">{prop.title}</h4>
                                                            <div className="text-muted text-xs mb-2 flex items-center gap-1"><MapPin className="w-3 h-3"/> {prop.location?.city}</div>
                                                            <div className="text-primary font-bold text-base font-serif">₹{prop.price?.toLocaleString()}</div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {savedPGs.length > 0 && (
                                        <div>
                                            <h3 className="text-primary font-bold text-lg mb-4">Saved PGs ({savedPGs.length})</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                                {savedPGs.map(pg => (
                                                    <Link to={`/pgs/${pg._id}`} key={pg._id} className="bg-elevated border border-borderSubtle/20 rounded-card p-3 flex gap-4 hover:shadow-md transition-shadow">
                                                        <img src={pg.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5'} alt="" className="w-24 h-24 rounded-lg object-cover" />
                                                        <div className="flex-1 flex flex-col justify-center">
                                                            <h4 className="text-primary font-semibold text-sm line-clamp-2 mb-1">{pg.name}</h4>
                                                            <div className="text-muted text-xs mb-2 flex items-center gap-1"><MapPin className="w-3 h-3"/> {pg.location?.city} • {pg.genderType}</div>
                                                            <div className="text-primary font-bold text-base font-serif">₹{pg.rentPerMonth?.toLocaleString()}/mo</div>
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
                            <div className="flex items-center gap-3 mb-6 bg-amber-50 p-4 border border-amber-200 rounded-card">
                                <Zap className="w-6 h-6 text-amber-500" />
                                <div>
                                    <h2 className="text-primary font-bold text-lg">AI Recommendations</h2>
                                    <p className="text-muted text-sm">Based on: <strong className="text-primary">{user.institution || user.workplace || 'your activity'}</strong></p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recommendations.map(pg => (
                                    <Link to={`/pgs/${pg._id}`} key={pg._id} className="bg-elevated border border-borderSubtle/20 rounded-card overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                                        <div className="h-48 overflow-hidden">
                                            <img src={`https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80&sig=${pg._id}`} alt={pg.name}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'; }} />
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h4 className="text-primary font-bold mb-1.5">{pg.name}</h4>
                                            <div className="text-sm text-muted flex items-center gap-1 mb-4 flex-1">
                                                <MapPin className="w-3 h-3 text-primary" /> {pg.location?.address}
                                            </div>
                                            <div className="text-xl font-bold text-primary font-serif">₹{pg.rentPerMonth?.toLocaleString()}/mo</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'listings' && (
                        <div>
                            {myProperties.length === 0 && myPGs.length === 0 ? (
                                <div className="bg-elevated border border-borderSubtle/20 rounded-card p-12 text-center flex flex-col items-center">
                                    <Building2 className="w-12 h-12 text-borderSubtle/30 mb-4" />
                                    <h3 className="text-xl font-bold text-primary mb-2">No listings yet</h3>
                                    <p className="text-muted mb-6">Start listing your properties to reach thousands of tenants!</p>
                                    <div className="flex gap-3 justify-center">
                                        <Link to="/list-property" className="btn btn-primary">List Property</Link>
                                        <Link to="/list-pg" className="btn btn-secondary bg-surface">List PG</Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-8">
                                    {myProperties.length > 0 && (
                                        <div>
                                            <h3 className="text-primary font-bold text-lg mb-4">Properties ({myProperties.length})</h3>
                                            <div className="flex flex-col gap-4">
                                                {myProperties.map(prop => (
                                                    <Link to={`/properties/${prop._id}`} key={prop._id} className="bg-elevated border border-borderSubtle/20 rounded-card p-4 flex items-center gap-5 hover:shadow-md transition-shadow">
                                                        <img src={prop.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80'} alt="" className="w-20 h-16 object-cover rounded-lg" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80'; }} />
                                                        <div className="flex-1">
                                                            <h4 className="text-primary font-bold text-sm mb-1">{prop.title}</h4>
                                                            <div className="text-xs text-muted flex gap-4">
                                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {prop.location?.city}</span>
                                                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {prop.views} views</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-primary font-serif mb-1">
                                                                ₹{prop.price >= 100000 ? `${(prop.price / 100000).toFixed(1)}L` : prop.price?.toLocaleString()}
                                                            </div>
                                                            <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full ${prop.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                                {prop.isAvailable ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {myPGs.length > 0 && (
                                        <div>
                                            <h3 className="text-primary font-bold text-lg mb-4">PG Listings ({myPGs.length})</h3>
                                            <div className="flex flex-col gap-4">
                                                {myPGs.map(pg => (
                                                    <Link to={`/pgs/${pg._id}`} key={pg._id} className="bg-elevated border border-borderSubtle/20 rounded-card p-4 flex items-center gap-5 hover:shadow-md transition-shadow">
                                                        <img src={pg.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=80'} alt="" className="w-20 h-16 object-cover rounded-lg" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=80'; }} />
                                                        <div className="flex-1">
                                                            <h4 className="text-primary font-bold text-sm mb-1">{pg.name}</h4>
                                                            <div className="text-xs text-muted flex gap-4">
                                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {pg.location?.city}</span>
                                                                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> {pg.rating}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-primary font-serif mb-1">₹{pg.rentPerMonth?.toLocaleString()}/mo</div>
                                                            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-700">{pg.availableRooms} rooms</span>
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

                    {activeTab === 'inquiries' && (
                        <div>
                            {myInquiries.length === 0 ? (
                                <div className="bg-elevated border border-borderSubtle/20 rounded-card p-12 text-center flex flex-col items-center">
                                    <MessageSquare className="w-12 h-12 text-borderSubtle/30 mb-4" />
                                    <h3 className="text-xl font-bold text-primary mb-2">No inquiries sent yet</h3>
                                    <p className="text-muted mb-6">Browse properties and contact owners directly without brokers.</p>
                                    <Link to="/properties" className="btn btn-primary">Browse Properties</Link>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {myInquiries.map(inq => (
                                        <div key={inq._id} className="bg-elevated border border-borderSubtle/20 rounded-card p-5 shadow-sm">
                                            <div className="flex justify-between items-start flex-wrap gap-3 mb-4">
                                                <div>
                                                    <h4 className="text-primary font-bold text-base mb-1">
                                                        {inq.property?.title || inq.pg?.name || 'Deleted Listing'}
                                                    </h4>
                                                    <p className="text-muted text-xs">Sent on {new Date(inq.createdAt).toLocaleDateString('en-IN')}</p>
                                                </div>
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                                                    inq.status === 'responded' ? 'bg-emerald-100 text-emerald-700' : 
                                                    inq.status === 'closed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {inq.status}
                                                </span>
                                            </div>
                                            <div className={`p-4 rounded-lg bg-surface border border-borderSubtle/10 ${inq.ownerResponse ? 'mb-3' : ''}`}>
                                                <p className="text-primary text-sm m-0 italic">"{inq.message}"</p>
                                            </div>
                                            {inq.ownerResponse && (
                                                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                                                    <p className="text-emerald-700 text-xs font-bold mb-1.5 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Owner Response:</p>
                                                    <p className="text-primary text-sm m-0">{inq.ownerResponse}</p>
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
                                <div className="bg-elevated border border-borderSubtle/20 rounded-card p-12 text-center flex flex-col items-center">
                                    <MessageSquare className="w-12 h-12 text-borderSubtle/30 mb-4" />
                                    <h3 className="text-xl font-bold text-primary mb-2">No leads received yet</h3>
                                    <p className="text-muted">Inquiries for your properties will appear here.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {receivedInquiries.map(inq => (
                                        <div key={inq._id} className="bg-elevated border border-borderSubtle/20 rounded-card p-5 shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                                                        {inq.user?.name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-primary font-bold text-sm">{inq.user?.name}</div>
                                                        <div className="text-muted text-xs flex gap-2">
                                                            <span>{inq.user?.phone}</span> • <span>{inq.user?.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${inq.status === 'responded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {inq.status}
                                                </span>
                                            </div>
                                            <div className="p-4 rounded-lg bg-surface border border-borderSubtle/10 mb-3">
                                                <p className="text-primary text-sm m-0 italic">"{inq.message}"</p>
                                            </div>
                                            <div className="text-xs text-primary font-semibold flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-primary/10 rounded">Interest in: {inq.property?.title || inq.pg?.name}</span>
                                                <span className="text-muted">{new Date(inq.createdAt).toLocaleDateString('en-IN')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                {user.role === 'admin' && (
                    <motion.div variants={fadeIn} initial="initial" animate="animate" className="mt-8 pt-8 border-t border-borderSubtle/20">
                        <h3 className="text-amber-600 text-lg font-bold flex items-center gap-2 mb-6">
                            <ShieldCheck className="w-5 h-5" /> Admin Control Panel
                        </h3>
                        <AdminDashboardTab />
                    </motion.div>
                )}

                {/* Verification Modal */}
                <AnimatePresence>
                    {showVerificationModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-elevated border border-borderSubtle/20 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative"
                            >
                                <button onClick={() => setShowVerificationModal(false)} className="absolute top-4 right-4 text-muted hover:text-primary transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                                
                                <div className="flex flex-col items-center text-center mb-8 mt-2">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                        <ShieldCheck className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-serif font-bold text-primary mb-2">Trust Center</h3>
                                    <p className="text-sm text-muted">Complete these verifications to boost your Trust Score and attract more matches or inquiries.</p>
                                </div>

                                <div className="space-y-4 mb-8">
                                    {/* Phone Verification Item */}
                                    <div className="flex items-start gap-4 p-4 rounded-xl border border-borderSubtle/20 bg-surface/50">
                                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${fullProfile?.isPhoneVerified ? 'bg-emerald-500 text-white' : 'bg-borderSubtle/30 text-transparent'}`}>
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-primary text-sm">Phone Verification (+20 pts)</div>
                                            <div className="text-xs text-muted mt-1">Verify your active mobile number.</div>
                                        </div>
                                        {!fullProfile?.isPhoneVerified && (
                                            <button onClick={() => setVerificationType('phone')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${verificationType === 'phone' ? 'bg-primary text-white' : 'bg-surface border border-borderSubtle/30 text-primary hover:border-primary'}`}>
                                                Select
                                            </button>
                                        )}
                                    </div>

                                    {/* Govt ID Item */}
                                    <div className="flex items-start gap-4 p-4 rounded-xl border border-borderSubtle/20 bg-surface/50">
                                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${fullProfile?.isIdVerified ? 'bg-emerald-500 text-white' : 'bg-borderSubtle/30 text-transparent'}`}>
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-primary text-sm">Government ID (+30 pts)</div>
                                            <div className="text-xs text-muted mt-1">Upload Aadhaar, PAN, or Passport for KYC.</div>
                                        </div>
                                        {!fullProfile?.isIdVerified && (
                                            <button onClick={() => setVerificationType('id')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${verificationType === 'id' ? 'bg-primary text-white' : 'bg-surface border border-borderSubtle/30 text-primary hover:border-primary'}`}>
                                                Select
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {verificationType === 'id' && !fullProfile?.isIdVerified && (
                                    <div className="mb-6 p-4 border border-dashed border-primary/40 rounded-xl bg-primary/5 text-center">
                                        <FileText className="w-8 h-8 text-primary/50 mx-auto mb-2" />
                                        <div className="text-sm font-medium text-primary">Mock Govt ID Upload</div>
                                        <div className="text-xs text-muted mt-1 mb-3">Clicking verify will simulate a successful KYC document scan.</div>
                                    </div>
                                )}

                                <button 
                                    onClick={handleVerify}
                                    disabled={isVerifying || (verificationType === 'phone' && fullProfile?.isPhoneVerified) || (verificationType === 'id' && fullProfile?.isIdVerified) || !verificationType}
                                    className="w-full py-3.5 bg-primary text-white rounded-btn font-bold text-sm hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isVerifying ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                    {isVerifying ? 'Verifying...' : `Verify ${verificationType === 'id' ? 'Govt ID' : 'Phone'} Now`}
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
