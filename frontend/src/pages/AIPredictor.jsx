import React, { useState } from 'react';
import { BrainCircuit, TrendingUp, AlertTriangle, Zap, Info } from 'lucide-react';
import api from '../utils/api';

const ZONES = [
    { value: 'Boat Club Road',  label: '🏆 Boat Club Road (Ultra Premium)' },
    { value: 'Koregaon Park',   label: '🏆 Koregaon Park (Ultra Premium)' },
    { value: 'Kalyani Nagar',   label: '⭐ Kalyani Nagar (Premium)' },
    { value: 'Shivajinagar',    label: '⭐ Shivajinagar (Prime Commercial)' },
    { value: 'Viman Nagar',     label: '⭐ Viman Nagar (Premium)' },
    { value: 'Camp',            label: '⭐ Camp / Cantonment (Premium)' },
    { value: 'Baner',           label: '🔥 Baner (High Demand IT)' },
    { value: 'Aundh',           label: '🔥 Aundh (High Demand)' },
    { value: 'Kothrud',         label: '🔥 Kothrud (High Demand)' },
    { value: 'Balewadi',        label: '🔥 Balewadi (High Demand)' },
    { value: 'Magarpatta',      label: '🔥 Magarpatta / Hadapsar (Premium)' },
    { value: 'Wakad',           label: '🔥 Wakad (IT Corridor)' },
    { value: 'Pashan',          label: '🔥 Pashan (Mid-Premium)' },
    { value: 'Kharadi',         label: '🔥 Kharadi (IT Corridor)' },
    { value: 'Hinjewadi',       label: '💼 Hinjewadi (IT Hub)' },
    { value: 'Pimple Saudagar', label: '💼 Pimple Saudagar (IT Suburb)' },
    { value: 'Bavdhan',         label: '💼 Bavdhan (Mid-Range)' },
    { value: 'Wanowrie',        label: '🏠 Wanowrie (Mid-Range)' },
    { value: 'Kondhwa',         label: '🏠 Kondhwa (Mid-Range)' },
    { value: 'Hadapsar',        label: '🏠 Hadapsar (Affordable)' },
    { value: 'Pimpri',          label: '🏠 Pimpri (Affordable)' },
    { value: 'Chinchwad',       label: '🏠 Chinchwad (Affordable)' },
    { value: 'Undri',           label: '💰 Undri (Budget)' },
    { value: 'Wagholi',         label: '💰 Wagholi (Budget)' },
    { value: 'Pisoli',          label: '💰 Pisoli (Budget)' },
];

const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    background: 'rgba(10, 11, 30, 0.6)',
    border: '1px solid rgba(108, 99, 255, 0.3)',
    color: 'white', fontSize: 15,
    outline: 'none', boxSizing: 'border-box',
};
const labelStyle = { display: 'block', marginBottom: 8, color: '#b0b7d3', fontSize: 14, fontWeight: 500 };

export default function AIPredictor() {
    const [formData, setFormData] = useState({
        zone: '', propertyType: 'apartment', listingType: 'sale',
        furnishing: 'semi-furnished', bhk: 2, area: 1000,
        age: 5, amenities_count: 5, floor: 3, total_floors: 10
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [relatedProperties, setRelatedProperties] = useState([]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
        <div style={{ paddingTop: 100, minHeight: '100vh', background: '#0a0b1e' }}>
            <div className="container" style={{ maxWidth: 860 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 70, height: 70, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(108,99,255,0.25), rgba(67,229,247,0.25))', border: '1px solid rgba(108,99,255,0.4)', marginBottom: 20 }}>
                        <BrainCircuit size={34} color="#43e5f7" />
                    </div>
                    <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.6rem', marginBottom: 10, background: 'linear-gradient(135deg, #fff, #b0b7d3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        AI Price Predictor
                    </h1>
                    <p style={{ color: '#b0b7d3', fontSize: '1.1rem', maxWidth: 560, margin: '0 auto' }}>
                        Trained on <strong style={{ color: '#43e5f7' }}>100,000 Pune real estate samples</strong> across <strong style={{ color: '#6c63ff' }}>25 localities</strong> using a Gradient Boosting model.
                    </p>
                    <div style={{ display: 'inline-flex', gap: 20, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {[['Model R²', '97.4%'], ['Training Samples', '100,000'], ['Zones Covered', '25']].map(([k, v]) => (
                            <div key={k} style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: 8, padding: '6px 14px', fontSize: 13 }}>
                                <span style={{ color: '#b0b7d3' }}>{k}: </span>
                                <span style={{ color: '#43e5f7', fontWeight: 700 }}>{v}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <div style={{ background: '#161933', borderRadius: 20, padding: 32, border: '1px solid rgba(108,99,255,0.2)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
                    <form onSubmit={handlePredict} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>

                        {/* Zone */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>📍 Locality / Zone (Pune)</label>
                            <select name="zone" value={formData.zone} onChange={handleChange} required style={inputStyle}>
                                <option value="" disabled>— Select Area —</option>
                                {ZONES.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
                            </select>
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
                            <label style={labelStyle}>📐 Area (Sq. Ft): <strong style={{ color: '#43e5f7' }}>{parseInt(formData.area).toLocaleString()} sqft</strong></label>
                            <input type="range" name="area" min={200} max={8000} step={50} value={formData.area} onChange={handleChange}
                                style={{ width: '100%', accentColor: '#6c63ff', height: 6, cursor: 'pointer' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7298', marginTop: 4 }}>
                                <span>200 sqft</span><span>8,000 sqft</span>
                            </div>
                        </div>

                        {/* Age */}
                        <div>
                            <label style={labelStyle}>🏗️ Age of Property: <strong style={{ color: '#43e5f7' }}>{formData.age} yrs</strong></label>
                            <input type="range" name="age" min={0} max={30} step={1} value={formData.age} onChange={handleChange}
                                style={{ width: '100%', accentColor: '#6c63ff', height: 6, cursor: 'pointer' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7298', marginTop: 4 }}>
                                <span>New (0 yrs)</span><span>Old (30 yrs)</span>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div>
                            <label style={labelStyle}>✨ Amenities Count: <strong style={{ color: '#43e5f7' }}>{formData.amenities_count} / 10</strong></label>
                            <input type="range" name="amenities_count" min={0} max={10} step={1} value={formData.amenities_count} onChange={handleChange}
                                style={{ width: '100%', accentColor: '#6c63ff', height: 6, cursor: 'pointer' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7298', marginTop: 4 }}>
                                <span>None</span><span>All (Pool, Gym…)</span>
                            </div>
                        </div>

                        {/* Floor */}
                        <div>
                            <label style={labelStyle}>🏢 Floor: <strong style={{ color: '#43e5f7' }}>{formData.floor}</strong> of <strong style={{ color: '#43e5f7' }}>{formData.total_floors}</strong></label>
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
                            <div style={{ padding: 28, background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(67,229,247,0.06))', borderRadius: 16, border: '1px solid rgba(108,99,255,0.35)' }}>
                                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                    <div style={{ color: '#b0b7d3', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
                                        {result.listing_type === 'rent' ? '📅 Estimated Monthly Rent' : '🏷️ Estimated Market Value'}
                                    </div>
                                    <div style={{ fontSize: 46, fontWeight: 900, color: '#43e5f7', fontFamily: 'Outfit, sans-serif', lineHeight: 1.1 }}>
                                        {result.predicted_label}
                                    </div>
                                    <div style={{ color: '#b0b7d3', marginTop: 8, fontSize: 14 }}>
                                        80% Confidence Range:&nbsp;
                                        <span style={{ color: '#fff', fontWeight: 600 }}>{result.range_label}</span>
                                    </div>
                                </div>

                                {/* Stats row */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                    {[
                                        { label: 'Model R² Score', value: `${(r2Score * 100).toFixed(1)}%`, sub: 'Accuracy metric', color: '#22d3a5' },
                                        { label: 'Training Data', value: result.n_training_samples?.toLocaleString() || '100,000', sub: 'Pune samples', color: '#6c63ff' },
                                        { label: 'Confidence Band', value: `±12%`, sub: '80% CI interval', color: '#43e5f7' },
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
                                        <div style={{ height: '100%', width: `${Math.min(confidencePct, 100)}%`, background: 'linear-gradient(90deg, #6c63ff, #43e5f7)', borderRadius: 4, transition: 'width 1s ease' }} />
                                    </div>
                                </div>

                                <div style={{ marginTop: 14, padding: 10, background: 'rgba(67,229,247,0.06)', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <Info size={15} color="#43e5f7" />
                                    <span style={{ color: '#b0b7d3', fontSize: 12 }}>
                                        Engine: <strong style={{ color: '#43e5f7' }}>{result.engine || 'GradientBoosting v2.0'}</strong>. Prices based on Pune 2024 market data. For informational purposes only.
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
                                            <div key={prop._id} style={{ background: 'rgba(22,25,51,0.9)', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(108,99,255,0.2)', transition: 'transform 0.2s' }}>
                                                <div style={{ height: 130, backgroundImage: `url(${prop.images?.[0] || 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?w=400'})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                                <div style={{ padding: 14 }}>
                                                    <div style={{ color: 'white', fontWeight: 600, fontSize: 13, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prop.title}</div>
                                                    <div style={{ color: '#43e5f7', fontWeight: 800, fontSize: 17 }}>{fmtCurrency(prop.price)}</div>
                                                    <div style={{ color: '#b0b7d3', fontSize: 12, marginTop: 4 }}>{prop.bhk} BHK · {prop.area?.toLocaleString()} sqft</div>
                                                    <a href={`/properties/${prop._id}`} style={{ display: 'block', marginTop: 10, textAlign: 'center', background: 'rgba(108,99,255,0.15)', color: '#6c63ff', padding: '7px 0', borderRadius: 7, fontSize: 12, textDecoration: 'none', fontWeight: 600, border: '1px solid rgba(108,99,255,0.25)' }}>View Details →</a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
