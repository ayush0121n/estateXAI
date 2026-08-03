import React, { useState } from 'react';
import { BrainCircuit, MapPin, Home as HomeIcon, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../utils/api';

export default function AIPredictor() {
    const [formData, setFormData] = useState({
        bhk: 2,
        area: 1000,
        location: '',
        propertyType: 'apartment',
        furnishing: 'unfurnished'
    });
    
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePredict = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await api.post('/predict/price', formData);
            if (res.data.success) {
                setResult(res.data.prediction);
            } else {
                setError(res.data.message || 'Failed to predict price');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Prediction service error. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: '#0a0b1e' }}>
            <div className="container" style={{ maxWidth: 800 }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.2), rgba(67, 229, 247, 0.2))', border: '1px solid rgba(108, 99, 255, 0.3)', marginBottom: 20 }}>
                        <BrainCircuit size={32} color="#43e5f7" />
                    </div>
                    <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', marginBottom: 10, background: 'linear-gradient(135deg, #fff, #b0b7d3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Price Predictor</h1>
                    <p style={{ color: '#b0b7d3', fontSize: '1.1rem' }}>Estimate the market value of any property in Pune instantly using our trained AI model.</p>
                </div>

                <div style={{ background: '#161933', borderRadius: 20, padding: 30, border: '1px solid rgba(108, 99, 255, 0.2)', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                    <form onSubmit={handlePredict} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: 8, color: '#b0b7d3' }}>Locality / Zone (Pune)</label>
                            <select 
                                name="location" 
                                value={formData.location} 
                                onChange={handleChange} 
                                required
                                style={{ width: '100%', padding: 12, borderRadius: 10, background: 'rgba(10, 11, 30, 0.5)', border: '1px solid rgba(108, 99, 255, 0.3)', color: 'white', fontSize: 16 }}
                            >
                                <option value="" disabled>Select Area...</option>
                                <option value="Kothrud">Kothrud</option>
                                <option value="Hinjewadi">Hinjewadi</option>
                                <option value="Baner">Baner</option>
                                <option value="Viman Nagar">Viman Nagar</option>
                                <option value="Wakad">Wakad</option>
                                <option value="Kharadi">Kharadi</option>
                                <option value="Hadapsar">Hadapsar / Magarpatta</option>
                                <option value="Aundh">Aundh</option>
                                <option value="Koregaon Park">Koregaon Park</option>
                                <option value="Shivajinagar">Shivajinagar</option>
                                <option value="Undri">Undri / Pisoli</option>
                                <option value="Other">Other (Base Pricing)</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 8, color: '#b0b7d3' }}>Property Type</label>
                            <select 
                                name="propertyType" 
                                value={formData.propertyType} 
                                onChange={handleChange} 
                                style={{ width: '100%', padding: 12, borderRadius: 10, background: 'rgba(10, 11, 30, 0.5)', border: '1px solid rgba(108, 99, 255, 0.3)', color: 'white', fontSize: 16 }}
                            >
                                <option value="apartment">Apartment</option>
                                <option value="villa">Villa / Independent House</option>
                                <option value="studio">Studio</option>
                                <option value="commercial">Commercial</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 8, color: '#b0b7d3' }}>Furnishing Status</label>
                            <select 
                                name="furnishing" 
                                value={formData.furnishing} 
                                onChange={handleChange} 
                                style={{ width: '100%', padding: 12, borderRadius: 10, background: 'rgba(10, 11, 30, 0.5)', border: '1px solid rgba(108, 99, 255, 0.3)', color: 'white', fontSize: 16 }}
                            >
                                <option value="unfurnished">Unfurnished</option>
                                <option value="semi-furnished">Semi-Furnished</option>
                                <option value="fully-furnished">Fully-Furnished</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 8, color: '#b0b7d3' }}>BHK</label>
                            <input 
                                type="number" 
                                name="bhk" 
                                value={formData.bhk} 
                                onChange={handleChange} 
                                min="0" max="10"
                                style={{ width: '100%', padding: 12, borderRadius: 10, background: 'rgba(10, 11, 30, 0.5)', border: '1px solid rgba(108, 99, 255, 0.3)', color: 'white', fontSize: 16 }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 8, color: '#b0b7d3' }}>Area (Sq. Ft)</label>
                            <input 
                                type="number" 
                                name="area" 
                                value={formData.area} 
                                onChange={handleChange} 
                                min="100" max="20000"
                                style={{ width: '100%', padding: 12, borderRadius: 10, background: 'rgba(10, 11, 30, 0.5)', border: '1px solid rgba(108, 99, 255, 0.3)', color: 'white', fontSize: 16 }}
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1', marginTop: 10 }}>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: 16, fontSize: 18, display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'center' }}
                            >
                                {loading ? 'Analyzing Market Data...' : <><BrainCircuit size={20} /> Generate AI Prediction</>}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div style={{ marginTop: 20, padding: 15, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 10, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <AlertTriangle size={20} />
                            {error}
                        </div>
                    )}

                    {result && (
                        <div style={{ marginTop: 30, padding: 25, background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.1), rgba(67, 229, 247, 0.05))', borderRadius: 15, border: '1px solid rgba(108, 99, 255, 0.3)' }}>
                            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                <h3 style={{ color: '#b0b7d3', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>Estimated Property Value</h3>
                                <div style={{ fontSize: 40, fontWeight: 800, color: '#43e5f7', fontFamily: 'Outfit, sans-serif' }}>
                                    {formatCurrency(result.estimatedPrice)}
                                </div>
                                <div style={{ color: '#b0b7d3', marginTop: 5 }}>
                                    Confidence Range: <span style={{ color: 'white' }}>{formatCurrency(result.priceRange.min)} - {formatCurrency(result.priceRange.max)}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: 200, padding: 15, background: 'rgba(10, 11, 30, 0.5)', borderRadius: 10 }}>
                                    <div style={{ color: '#6c63ff', fontSize: 12, textTransform: 'uppercase', marginBottom: 5 }}>Prediction Confidence</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ flex: 1, height: 8, background: '#161933', borderRadius: 4, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${result.confidenceScore}%`, background: result.confidenceScore > 80 ? '#22d3a5' : '#fbbf24', borderRadius: 4 }}></div>
                                        </div>
                                        <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{result.confidenceScore}%</span>
                                    </div>
                                </div>
                                <div style={{ flex: 1, minWidth: 200, padding: 15, background: 'rgba(10, 11, 30, 0.5)', borderRadius: 10 }}>
                                    <div style={{ color: '#6c63ff', fontSize: 12, textTransform: 'uppercase', marginBottom: 5 }}>Market Indicator</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22d3a5', fontWeight: 500 }}>
                                        <TrendingUp size={18} /> Moderate Growth Expected
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
