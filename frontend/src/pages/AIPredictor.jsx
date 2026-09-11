/* eslint-disable */
import React, { useState } from 'react';
import { BrainCircuit, TrendingUp, AlertTriangle, Zap, Info, MapPin } from 'lucide-react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer, staggerItem } from '../utils/animations';

const CITY_ZONES = {
    'Pune': [
        { value: 'Boat Club Road',  label: '🏆 Boat Club Road (Ultra Premium)' },
        { value: 'Koregaon Park',   label: '🏆 Koregaon Park (Ultra Premium)' },
        { value: 'Kalyani Nagar',   label: '⭐ Kalyani Nagar (Premium)' },
        { value: 'Baner',           label: '🔥 Baner (High Demand IT)' },
        { value: 'Hinjewadi',       label: '💼 Hinjewadi (IT Hub)' },
        { value: 'Wakad',           label: '🔥 Wakad (IT Corridor)' },
        { value: 'Kothrud',         label: '🔥 Kothrud (High Demand)' }
    ],
    'Bangalore': [
        { value: 'Koramangala',     label: '🏆 Koramangala (Premium)' },
        { value: 'Indiranagar',     label: '🏆 Indiranagar (Premium)' },
        { value: 'Whitefield',      label: '🔥 Whitefield (IT Hub)' },
        { value: 'HSR Layout',      label: '⭐ HSR Layout (Prime)' },
        { value: 'Electronic City', label: '💼 Electronic City (IT Hub)' },
        { value: 'Bellandur',       label: '🔥 Bellandur (High Demand)' }
    ],
    'Mumbai': [
        { value: 'Bandra West',     label: '🏆 Bandra West (Ultra Premium)' },
        { value: 'Juhu',            label: '🏆 Juhu (Ultra Premium)' },
        { value: 'Andheri West',    label: '⭐ Andheri West (Premium)' },
        { value: 'Powai',           label: '🔥 Powai (Corporate Hub)' },
        { value: 'Malad',           label: '🏠 Malad (Mid-Range)' },
        { value: 'Borivali',        label: '🏠 Borivali (Mid-Range)' }
    ],
    'Delhi NCR': [
        { value: 'Vasant Vihar',    label: '🏆 Vasant Vihar (Ultra Premium)' },
        { value: 'Defence Colony',  label: '🏆 Defence Colony (Premium)' },
        { value: 'Gurgaon Sec 42',  label: '🔥 Gurgaon Sec 42 (IT/Corporate)' },
        { value: 'Noida Sec 15',    label: '💼 Noida Sec 15 (Commercial)' },
        { value: 'Dwarka',          label: '🏠 Dwarka (Residential)' }
    ],
    'Hyderabad': [
        { value: 'Gachibowli',      label: '🔥 Gachibowli (IT Hub)' },
        { value: 'Hitech City',     label: '🔥 Hitech City (IT Hub)' },
        { value: 'Madhapur',        label: '⭐ Madhapur (Premium IT)' },
        { value: 'Kondapur',        label: '💼 Kondapur (High Demand)' },
        { value: 'Kukatpally',      label: '🏠 Kukatpally (Mid-Range)' },
        { value: 'Banjara Hills',   label: '🏆 Banjara Hills (Ultra Premium)' },
        { value: 'Jubilee Hills',   label: '🏆 Jubilee Hills (Premium)' }
    ],
    'Chennai': [
        { value: 'OMR',             label: '🔥 OMR / IT Corridor (IT Hub)' },
        { value: 'Velachery',       label: '⭐ Velachery (Prime)' },
        { value: 'T Nagar',         label: '🏆 T Nagar (Premium)' },
        { value: 'Anna Nagar',      label: '🏆 Anna Nagar (Premium)' },
        { value: 'Adyar',           label: '⭐ Adyar (Prime)' },
        { value: 'Sholinganallur',  label: '💼 Sholinganallur (IT)' }
    ],
    'Ahmedabad': [
        { value: 'SG Highway',      label: '🔥 SG Highway (High Demand)' },
        { value: 'Prahlad Nagar',   label: '⭐ Prahlad Nagar (Premium)' },
        { value: 'Satellite',       label: '⭐ Satellite (Prime)' },
        { value: 'Vastrapur',       label: '💼 Vastrapur (Commercial)' },
        { value: 'Bodakdev',        label: '🏠 Bodakdev (Residential)' }
    ]
};

export default function AIPredictor() {
    const [formData, setFormData] = useState({
        city: 'Pune', zone: '', propertyType: 'apartment', listingType: 'sale',
        furnishing: 'semi-furnished', bhk: 2, area: 1000,
        age: 5, amenities_count: 5, floor: 3, total_floors: 10
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [relatedProperties, setRelatedProperties] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'city') {
            setFormData({ ...formData, city: value, zone: '' });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handlePredict = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setResult(null);
        try {
            const payload = {
                zone: formData.zone,
                location: formData.zone,
                prop_type: formData.propertyType,
                propertyType: formData.propertyType,
                listing_type: formData.listingType,
                listingType: formData.listingType,
                furnishing: formData.furnishing,
                bhk: parseInt(formData.bhk),
                area: parseInt(formData.area),
                age: parseInt(formData.age),
                amenities_count: parseInt(formData.amenities_count),
                floor: parseInt(formData.floor),
                total_floors: parseInt(formData.total_floors),
                bathrooms: Math.max(1, Math.floor(parseInt(formData.bhk) / 1.2)),
            };
            const res = await api.post('/predict-price', payload);
            if (res.data.success) {
                setResult(res.data);
                try {
                    const propRes = await api.get(`/properties?search=${encodeURIComponent(formData.zone)}&limit=3`);
                    if (propRes.data.success) setRelatedProperties(propRes.data.properties);
                } catch (_) {}
            } else {
                setError(res.data.message || 'Prediction failed.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.detail || 'Prediction failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fmtCurrency = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
    const r2Score = result?.model_r2 || 0;
    const confidencePct = Math.round(r2Score * 100);

    return (
        <div className="light-page min-h-screen pt-6 pb-20 font-sans">
            <div className="max-w-4xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <motion.div variants={fadeIn} initial="initial" animate="animate" className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-6">
                        <BrainCircuit className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-4">
                        AI Price Predictor
                    </h1>
                    <p className="text-muted text-lg max-w-2xl mx-auto">
                        Trained on <strong className="text-primary">100,000 Pan-India samples</strong> across <strong className="text-primary">25+ metropolitan localities</strong> using a Gradient Boosting model.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mt-6">
                        {[['Model R²', '97.4%'], ['Training Samples', '100,000'], ['Zones Covered', '25']].map(([k, v]) => (
                            <div key={k} className="bg-surface border border-borderSubtle/20 rounded-btn px-4 py-2 text-sm">
                                <span className="text-muted">{k}: </span>
                                <span className="text-primary font-bold">{v}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div variants={fadeIn} initial="initial" animate="animate" className="bg-elevated border border-borderSubtle/20 rounded-card p-8 shadow-sm">
                    <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* City & Zone */}
                        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-primary mb-2">🏙️ City</label>
                                <select name="city" value={formData.city} onChange={handleChange} required className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary">
                                    {Object.keys(CITY_ZONES).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-primary mb-2">📍 Locality / Zone</label>
                                <select name="zone" value={formData.zone} onChange={handleChange} required disabled={!formData.city} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary disabled:opacity-50">
                                    <option value="" disabled>— Select Area —</option>
                                    {(CITY_ZONES[formData.city] || []).map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Listing Type */}
                        <div>
                            <label className="block text-sm font-semibold text-primary mb-2">🏷️ Sale or Rent</label>
                            <select name="listingType" value={formData.listingType} onChange={handleChange} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary">
                                <option value="sale">For Sale</option>
                                <option value="rent">For Rent</option>
                            </select>
                        </div>

                        {/* Property Type */}
                        <div>
                            <label className="block text-sm font-semibold text-primary mb-2">🏠 Property Type</label>
                            <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary">
                                <option value="apartment">Apartment / Flat</option>
                                <option value="villa">Villa / Bungalow</option>
                                <option value="studio">Studio</option>
                                <option value="house">Row House</option>
                                <option value="commercial">Commercial</option>
                                <option value="plot">Plot / Land</option>
                            </select>
                        </div>

                        {/* Furnishing */}
                        <div>
                            <label className="block text-sm font-semibold text-primary mb-2">🛋️ Furnishing Status</label>
                            <select name="furnishing" value={formData.furnishing} onChange={handleChange} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary">
                                <option value="unfurnished">Unfurnished</option>
                                <option value="semi-furnished">Semi-Furnished (+12%)</option>
                                <option value="fully-furnished">Fully Furnished (+28%)</option>
                            </select>
                        </div>

                        {/* BHK */}
                        <div>
                            <label className="block text-sm font-semibold text-primary mb-2">🛏 BHK (Bedrooms)</label>
                            <select name="bhk" value={formData.bhk} onChange={handleChange} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary">
                                <option value={0}>Studio / 0 BHK</option>
                                <option value={1}>1 BHK</option>
                                <option value={2}>2 BHK</option>
                                <option value={3}>3 BHK</option>
                                <option value={4}>4 BHK</option>
                                <option value={5}>5+ BHK</option>
                            </select>
                        </div>

                        {/* Area */}
                        <div>
                            <label className="block text-sm font-semibold text-primary mb-2">📐 Area (Sq. Ft): <strong className="text-accent">{parseInt(formData.area).toLocaleString()} sqft</strong></label>
                            <input type="range" name="area" min={200} max={8000} step={50} value={formData.area} onChange={handleChange}
                                className="w-full accent-primary h-1.5 cursor-pointer" />
                            <div className="flex justify-between text-xs text-muted mt-2">
                                <span>200 sqft</span><span>8,000 sqft</span>
                            </div>
                        </div>

                        {/* Age */}
                        <div>
                            <label className="block text-sm font-semibold text-primary mb-2">🏗️ Age of Property: <strong className="text-accent">{formData.age} yrs</strong></label>
                            <input type="range" name="age" min={0} max={30} step={1} value={formData.age} onChange={handleChange}
                                className="w-full accent-primary h-1.5 cursor-pointer" />
                            <div className="flex justify-between text-xs text-muted mt-2">
                                <span>New (0 yrs)</span><span>Old (30 yrs)</span>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div>
                            <label className="block text-sm font-semibold text-primary mb-2">✨ Amenities Count: <strong className="text-accent">{formData.amenities_count} / 10</strong></label>
                            <input type="range" name="amenities_count" min={0} max={10} step={1} value={formData.amenities_count} onChange={handleChange}
                                className="w-full accent-primary h-1.5 cursor-pointer" />
                            <div className="flex justify-between text-xs text-muted mt-2">
                                <span>None</span><span>All (Pool, Gym…)</span>
                            </div>
                        </div>

                        {/* Floor */}
                        <div>
                            <label className="block text-sm font-semibold text-primary mb-2">🏢 Floor: <strong className="text-accent">{formData.floor}</strong> of <strong className="text-accent">{formData.total_floors}</strong></label>
                            <div className="flex gap-3">
                                <input type="number" name="floor" min={0} max={60} value={formData.floor} onChange={handleChange}
                                    placeholder="Floor" className="w-1/2 bg-surface border border-borderSubtle/30 rounded-btn px-4 py-2 outline-none focus:border-primary text-primary" />
                                <input type="number" name="total_floors" min={1} max={60} value={formData.total_floors} onChange={handleChange}
                                    placeholder="Total" className="w-1/2 bg-surface border border-borderSubtle/30 rounded-btn px-4 py-2 outline-none focus:border-primary text-primary" />
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="col-span-1 md:col-span-2 mt-4">
                            <button type="submit" disabled={loading} className="btn btn-primary w-full py-4 text-base rounded-xl font-bold shadow-md hover:shadow-lg">
                                {loading
                                    ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing 100,000 data points...</>
                                    : <><BrainCircuit className="w-5 h-5" /> Predict Property Price</>}
                            </button>
                        </div>
                    </form>

                    {/* Error */}
                    {error && (
                        <motion.div variants={fadeIn} initial="initial" animate="animate" className="mt-6 p-4 bg-red-50 border border-red-200 rounded-btn text-red-600 flex gap-3 items-start">
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {/* Result */}
                    {result && (
                        <motion.div variants={fadeIn} initial="initial" animate="animate" className="mt-8">
                            <div className="p-8 bg-surface border border-borderSubtle/20 rounded-2xl">
                                <div className="text-center mb-8">
                                    <div className="text-muted text-xs font-bold uppercase tracking-widest mb-3">
                                        {result.listing_type === 'rent' ? '📅 Estimated Monthly Rent' : '🏷️ Estimated Market Value'}
                                    </div>
                                    <div className="text-5xl md:text-6xl font-bold text-primary font-serif mb-2">
                                        {result.predicted_label}
                                    </div>
                                    <div className="text-muted text-sm mt-3">
                                        80% Confidence Range:&nbsp;
                                        <span className="text-primary font-bold">{result.range_label}</span>
                                    </div>
                                </div>

                                {/* Stats row */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                    {[
                                        { label: 'Model R² Score', value: `${(r2Score * 100).toFixed(1)}%`, sub: 'Accuracy metric', color: 'text-emerald-600' },
                                        { label: 'Training Data', value: result.n_training_samples?.toLocaleString() || '100,000', sub: 'National samples', color: 'text-primary' },
                                        { label: 'Confidence Band', value: `±12%`, sub: '80% CI interval', color: 'text-accent' },
                                    ].map(stat => (
                                        <div key={stat.label} className="p-4 bg-elevated border border-borderSubtle/10 rounded-xl text-center">
                                            <div className={`font-serif text-2xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
                                            <div className="text-primary text-xs font-bold">{stat.label}</div>
                                            <div className="text-muted text-[10px] mt-1">{stat.sub}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Confidence bar */}
                                <div className="mb-6">
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-muted font-bold">Model Accuracy</span>
                                        <span className="text-emerald-600 font-bold">{confidencePct}% R²</span>
                                    </div>
                                    <div className="h-2 bg-elevated border border-borderSubtle/10 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(confidencePct, 100)}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className="h-full bg-emerald-500 rounded-full" 
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 items-start">
                                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <span className="text-amber-800 text-xs leading-relaxed">
                                        Engine: <strong className="text-amber-900">{result.engine || 'GradientBoosting v2.0'}</strong>. Prices based on 2024 national market data. For informational purposes only.
                                    </span>
                                </div>
                            </div>

                            {/* Related listings */}
                            {relatedProperties.length > 0 && (
                                <div className="mt-10">
                                    <h3 className="font-serif text-2xl font-bold text-primary mb-5">
                                        🏘️ Active Listings in {formData.zone}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {relatedProperties.map(prop => (
                                            <Link to={`/properties/${prop._id}`} key={prop._id} className="block bg-elevated border border-borderSubtle/20 rounded-xl overflow-hidden hover:shadow-md transition-all">
                                                <div className="h-32 bg-gray-200">
                                                    <img src={prop.images?.[0] || 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?w=400'} alt={prop.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="p-4">
                                                    <div className="font-bold text-primary text-sm truncate mb-2">{prop.title}</div>
                                                    <div className="font-serif text-accent font-bold text-lg mb-1">{fmtCurrency(prop.price)}</div>
                                                    <div className="text-xs text-muted flex gap-2 items-center">
                                                        <span>{prop.bhk} BHK</span> • <span>{prop.area?.toLocaleString()} sqft</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Negotiation Tips */}
                            <div className="mt-10 p-6 bg-emerald-50 border border-emerald-100 rounded-xl">
                                <h4 className="text-emerald-800 text-lg font-bold mb-5 flex items-center gap-2">
                                    💡 Negotiation Tips for {formData.zone}
                                </h4>
                                <div className="flex flex-col gap-4">
                                    {[
                                        result.listing_type === 'rent' 
                                            ? `Fair rent for ${formData.bhk} BHK in ${formData.zone} is typically ${result.range_label}. Use this as your benchmark.`
                                            : `Market value for ${formData.bhk} BHK in ${formData.zone} is around ${result.predicted_label}. Compare with at least 3-4 similar properties.`,
                                        result.listing_type === 'rent'
                                            ? 'Ask for a 11-month agreement with clear renewal terms. Avoid paying more than 2 months deposit.'
                                            : 'Check the builder/society maintenance charges. Factor in registration + stamp duty (5-7% in most states).',
                                        `${formData.furnishing === 'fully-furnished' ? 'Fully furnished properties command 20-30% premium.' : formData.furnishing === 'semi-furnished' ? 'Semi-furnished saves you ~₹50K-1L in setup costs.' : 'Unfurnished gives you room to negotiate 5-10% lower.'} Use this as leverage.`,
                                        formData.age > 10 ? 'Property is 10+ years old — negotiate 5-15% below asking price for maintenance and depreciation.' : formData.age > 5 ? 'Property age of 5-10 years is ideal — reasonable price with established infrastructure.' : 'Newer property — check for hidden charges like parking, club membership, GST.',
                                        result.listing_type === 'rent' ? 'Pro tip: Offer 2-3 months advance rent for a lower monthly rate. Many landlords prefer assured income.' : 'Pro tip: Check if the seller is in a hurry (job transfer, financial need). You can negotiate 8-12% lower.'
                                    ].map((tip, i) => (
                                        <div key={i} className="flex gap-3 text-sm text-emerald-900 leading-relaxed">
                                            <span className="text-emerald-600 font-bold shrink-0">#{i + 1}</span>
                                            <span>{tip}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
