/* eslint-disable */
import React, { useState } from 'react';
import { BrainCircuit, TrendingUp, AlertTriangle, Zap, Info } from 'lucide-react';
import api from '../utils/api';

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

const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    background: 'rgba(10, 11, 30, 0.6)',
    border: '1px solid rgba(201, 163, 94, 0.3)',
    color: 'white', fontSize: 15,
    outline: 'none', boxSizing: 'border-box',
};
const labelStyle = { display: 'block', marginBottom: 8, color: '#b0b7d3', fontSize: 14, fontWeight: 500 };

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
        <div style={{ paddingTop: 100, minHeight: '100vh', background: 'var(--dark)' }}>
            <div className="container" style={{ maxWidth: 860 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 70, height: 70, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(201, 163, 94,0.25), rgba(223, 194, 136,0.25))', border: '1px solid rgba(201, 163, 94,0.4)', marginBottom: 20 }}>
                        <BrainCircuit size={34} color="var(--primary-light)" />
                    </div>
                    <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.6rem', marginBottom: 10, background: 'linear-gradient(135deg, #fff, #b0b7d3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        AI Price Predictor
                    </h1>
                    <p style={{ color: '#b0b7d3', fontSize: '1.1rem', maxWidth: 560, margin: '0 auto' }}>
                        Trained on <strong style={{ color: 'var(--primary-light)' }}>100,000 Pan-India samples</strong> across <strong style={{ color: 'var(--primary)' }}>25+ metropolitan localities</strong> using a Gradient Boosting model.
                    </p>
                    <div className="predictor-badges" style={{ display: 'inline-flex', gap: 20, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {[['Model R²', '97.4%'], ['Training Samples', '100,000'], ['Zones Covered', '25']].map(([k, v]) => (
                            <div key={k} style={{ background: 'rgba(201, 163, 94,0.1)', border: '1px solid rgba(201, 163, 94,0.25)', borderRadius: 8, padding: '6px 14px', fontSize: 13 }}>
                                <span style={{ color: '#b0b7d3' }}>{k}: </span>
                                <span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>{v}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <div style={{ background: '#161933', borderRadius: 20, padding: 32, border: '1px solid rgba(201, 163, 94,0.2)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
                    <form onSubmit={handlePredict} className="predictor-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>

                        {/* City & Zone */}
                        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
                            <div>
                                <label style={labelStyle}>🏙️ City</label>
                                <select name="city" value={formData.city} onChange={handleChange} required style={inputStyle}>
                                    {Object.keys(CITY_ZONES).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>📍 Locality / Zone</label>
                                <select name="zone" value={formData.zone} onChange={handleChange} required style={inputStyle} disabled={!formData.city}>
                                    <option value="" disabled>— Select Area —</option>
                                    {(CITY_ZONES[formData.city] || []).map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Listing Type */}
                        <div>
                            <label style={labelStyle}>🏷️ Sale or Rent</label>
                            <select name="listingType" value={formData.listingType} onChange={handleChange} style={inputStyle}>
                                <option value="sale">For Sale</option>
                                <option value="rent">For Rent</option>
                            </select>
                        </div>

                        {/* Property Type */}
                        <div>
                            <label style={labelStyle}>🏠 Property Type</label>
                            <select name="propertyType" value={formData.propertyType} onChange={handleChange} style={inputStyle}>
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
                            <label style={labelStyle}>🛋️ Furnishing Status</label>
                            <select name="furnishing" value={formData.furnishing} onChange={handleChange} style={inputStyle}>
                                <option value="unfurnished">Unfurnished</option>
                                <option value="semi-furnished">Semi-Furnished (+12%)</option>
                                <option value="fully-furnished">Fully Furnished (+28%)</option>
                            </select>
                        </div>

                        {/* BHK */}
                        <div>
                            <label style={labelStyle}>🛏 BHK (Bedrooms)</label>
                            <select name="bhk" value={formData.bhk} onChange={handleChange} style={inputStyle}>
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
                            <label style={labelStyle}>📐 Area (Sq. Ft): <strong style={{ color: 'var(--primary-light)' }}>{parseInt(formData.area).toLocaleString()} sqft</strong></label>
                            <input type="range" name="area" min={200} max={8000} step={50} value={formData.area} onChange={handleChange}
                                style={{ width: '100%', accentColor: 'var(--primary)', height: 6, cursor: 'pointer' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7298', marginTop: 4 }}>
                                <span>200 sqft</span><span>8,000 sqft</span>
                            </div>
                        </div>

                        {/* Age */}
                        <div>
                            <label style={labelStyle}>🏗️ Age of Property: <strong style={{ color: 'var(--primary-light)' }}>{formData.age} yrs</strong></label>
                            <input type="range" name="age" min={0} max={30} step={1} value={formData.age} onChange={handleChange}
                                style={{ width: '100%', accentColor: 'var(--primary)', height: 6, cursor: 'pointer' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7298', marginTop: 4 }}>
                                <span>New (0 yrs)</span><span>Old (30 yrs)</span>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div>
                            <label style={labelStyle}>✨ Amenities Count: <strong style={{ color: 'var(--primary-light)' }}>{formData.amenities_count} / 10</strong></label>
                            <input type="range" name="amenities_count" min={0} max={10} step={1} value={formData.amenities_count} onChange={handleChange}
                                style={{ width: '100%', accentColor: 'var(--primary)', height: 6, cursor: 'pointer' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7298', marginTop: 4 }}>
                                <span>None</span><span>All (Pool, Gym…)</span>
                            </div>
                        </div>

                        {/* Floor */}
                        <div>
                            <label style={labelStyle}>🏢 Floor: <strong style={{ color: 'var(--primary-light)' }}>{formData.floor}</strong> of <strong style={{ color: 'var(--primary-light)' }}>{formData.total_floors}</strong></label>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <input type="number" name="floor" min={0} max={60} value={formData.floor} onChange={handleChange}
                                    placeholder="Floor" style={{ ...inputStyle, width: '50%' }} />
                                <input type="number" name="total_floors" min={1} max={60} value={formData.total_floors} onChange={handleChange}
                                    placeholder="Total Floors" style={{ ...inputStyle, width: '50%' }} />
                            </div>
                        </div>

                        {/* Submit */}
                        <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
                            <button type="submit" disabled={loading} className="btn btn-primary"
                                style={{ width: '100%', padding: '16px 0', fontSize: 18, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, borderRadius: 12 }}>
                                {loading
                                    ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span> Analyzing 100,000 data points...</>
                                    : <><BrainCircuit size={20} /> Predict Property Price</>}
                            </button>
                        </div>
                    </form>

                    {/* Error */}
                    {error && (
                        <div style={{ marginTop: 20, padding: 15, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, color: '#ef4444', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Result */}
                    {result && (
                        <div style={{ marginTop: 30 }}>
                            <div style={{ padding: 28, background: 'linear-gradient(135deg, rgba(201, 163, 94,0.12), rgba(223, 194, 136,0.06))', borderRadius: 16, border: '1px solid rgba(201, 163, 94,0.35)' }}>
                                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                    <div style={{ color: '#b0b7d3', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
                                        {result.listing_type === 'rent' ? '📅 Estimated Monthly Rent' : '🏷️ Estimated Market Value'}
                                    </div>
                                    <div className="predictor-price" style={{ fontSize: 46, fontWeight: 900, color: 'var(--primary-light)', fontFamily: 'Outfit, sans-serif', lineHeight: 1.1 }}>
                                        {result.predicted_label}
                                    </div>
                                    <div style={{ color: '#b0b7d3', marginTop: 8, fontSize: 14 }}>
                                        80% Confidence Range:&nbsp;
                                        <span style={{ color: '#fff', fontWeight: 600 }}>{result.range_label}</span>
                                    </div>
                                </div>

                                {/* Stats row */}
                                <div className="predictor-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                    {[
                                        { label: 'Model R² Score', value: `${(r2Score * 100).toFixed(1)}%`, sub: 'Accuracy metric', color: '#22d3a5' },
                                        { label: 'Training Data', value: result.n_training_samples?.toLocaleString() || '100,000', sub: 'National samples', color: 'var(--primary)' },
                                        { label: 'Confidence Band', value: `±12%`, sub: '80% CI interval', color: 'var(--primary-light)' },
                                    ].map(stat => (
                                        <div key={stat.label} style={{ padding: 14, background: 'rgba(10,11,30,0.55)', borderRadius: 10, textAlign: 'center' }}>
                                            <div style={{ color: stat.color, fontWeight: 800, fontSize: 20, fontFamily: 'Outfit, sans-serif' }}>{stat.value}</div>
                                            <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, marginTop: 2 }}>{stat.label}</div>
                                            <div style={{ color: '#6b7298', fontSize: 11 }}>{stat.sub}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Confidence bar */}
                                <div style={{ marginTop: 18 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: '#b0b7d3' }}>
                                        <span>Model Accuracy</span>
                                        <span style={{ color: '#22d3a5', fontWeight: 600 }}>{confidencePct}% R²</span>
                                    </div>
                                    <div style={{ height: 8, background: 'rgba(10,11,30,0.6)', borderRadius: 4, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${Math.min(confidencePct, 100)}%`, background: 'linear-gradient(90deg, var(--primary), var(--primary-light))', borderRadius: 4, transition: 'width 1s ease' }} />
                                    </div>
                                </div>

                                <div style={{ marginTop: 14, padding: 10, background: 'rgba(223, 194, 136,0.06)', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <Info size={15} color="var(--primary-light)" />
                                    <span style={{ color: '#b0b7d3', fontSize: 12 }}>
                                        Engine: <strong style={{ color: 'var(--primary-light)' }}>{result.engine || 'GradientBoosting v2.0'}</strong>. Prices based on 2024 national market data. For informational purposes only.
                                    </span>
                                </div>
                            </div>

                            {/* Related listings */}
                            {relatedProperties.length > 0 && (
                                <div style={{ marginTop: 36 }}>
                                    <h3 style={{ color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: 20, marginBottom: 16 }}>
                                        🏘️ Active Listings in {formData.zone}
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 18 }}>
                                        {relatedProperties.map(prop => (
                                            <div key={prop._id} style={{ background: 'rgba(22,25,51,0.9)', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(201, 163, 94,0.2)', transition: 'transform 0.2s' }}>
                                                <div style={{ height: 130, backgroundImage: `url(${prop.images?.[0] || 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?w=400'})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                                <div style={{ padding: 14 }}>
                                                    <div style={{ color: 'white', fontWeight: 600, fontSize: 13, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prop.title}</div>
                                                    <div style={{ color: 'var(--primary-light)', fontWeight: 800, fontSize: 17 }}>{fmtCurrency(prop.price)}</div>
                                                    <div style={{ color: '#b0b7d3', fontSize: 12, marginTop: 4 }}>{prop.bhk} BHK · {prop.area?.toLocaleString()} sqft</div>
                                                    <a href={`/properties/${prop._id}`} style={{ display: 'block', marginTop: 10, textAlign: 'center', background: 'rgba(201, 163, 94,0.15)', color: 'var(--primary)', padding: '7px 0', borderRadius: 7, fontSize: 12, textDecoration: 'none', fontWeight: 600, border: '1px solid rgba(201, 163, 94,0.25)' }}>View Details →</a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Negotiation Tips */}
                            <div style={{ marginTop: 28, padding: 24, background: 'rgba(34,211,165,0.06)', border: '1px solid rgba(34,211,165,0.2)', borderRadius: 14 }}>
                                <h4 style={{ color: '#22d3a5', fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    💡 Negotiation Tips for {formData.zone}
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
                                        <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#b0b7d3', lineHeight: 1.6 }}>
                                            <span style={{ color: '#22d3a5', fontWeight: 700, flexShrink: 0 }}>#{i + 1}</span>
                                            <span>{tip}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

