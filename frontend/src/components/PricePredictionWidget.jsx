import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Zap, X, ChevronDown, Info } from 'lucide-react';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

const PUNE_ZONES = [
    'Koregaon Park','Wakad','Baner','Hadapsar','Kothrud','Aundh',
    'Hinjewadi','Kharadi','Viman Nagar','Undri','Pisoli','Pimpri'
];

const PROP_TYPES = ['apartment','villa','studio','house','plot','commercial'];
const LISTING_TYPES = ['sale','rent'];
const FURNISHING_TYPES = ['unfurnished','semi-furnished','fully-furnished'];

const CUSTOM_TOOLTIP = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: '#1a1f3a', border: '1px solid rgba(108,99,255,0.4)', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#fff' }}>
                <p style={{ margin: 0 }}>{payload[0].payload.label}</p>
                <p style={{ margin: 0, color: '#6c63ff', fontWeight: 700 }}>
                    {payload[0].value?.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                </p>
            </div>
        );
    }
    return null;
};

export default function PricePredictionWidget({ property }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        zone: property?.location?.city || 'Baner',
        prop_type: property?.type || 'apartment',
        listing_type: property?.listingType || 'sale',
        furnishing: property?.furnishing || 'semi-furnished',
        bhk: property?.bhk || 2,
        area: property?.area || 1000,
        bathrooms: property?.bathrooms || 2,
        age: property?.yearBuilt ? new Date().getFullYear() - property.yearBuilt : 5,
        amenities_count: property?.amenities?.length || 4,
    });

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

    const handlePredict = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/predict-price', form);
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Price prediction service unavailable. Make sure the Python microservice is running (cd backend/ml_service && uvicorn app:app --port 8001).');
        } finally {
            setLoading(false);
        }
    };

    // Build comparison chart if property.priceTrend exists + predicted
    const chartData = (() => {
        if (!result) return [];
        const trend = property?.priceTrend || [];
        const data = trend.map(t => ({ label: t.month, value: t.avgPrice }));
        data.push({ label: 'Predicted', value: result.predicted_price, isPredicted: true });
        if (property?.price) data.push({ label: 'Listed', value: property.price, isListed: true });
        return data;
    })();

    return (
        <div style={{ marginTop: 24 }}>
            <motion.button
                onClick={() => setOpen(!open)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                    width: '100%', padding: '14px 20px', borderRadius: 14,
                    background: 'linear-gradient(135deg, #6c63ff 0%, #22d3a5 100%)',
                    border: 'none', color: '#fff', fontWeight: 700, fontSize: 15,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                    justifyContent: 'space-between',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Zap size={18} /> Estimate Price with AI
                </span>
                <ChevronDown size={18} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ background: 'rgba(108,99,255,0.05)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 14, padding: 20, marginTop: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: '#aaa', fontSize: 12 }}>
                                <Info size={14} />
                                Trained on 5,000 synthetic Pune market samples · Random Forest · R² = 0.8292
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                                {[
                                    { name: 'zone', label: 'Zone', type: 'select', options: PUNE_ZONES },
                                    { name: 'prop_type', label: 'Property Type', type: 'select', options: PROP_TYPES },
                                    { name: 'listing_type', label: 'Listing Type', type: 'select', options: LISTING_TYPES },
                                    { name: 'furnishing', label: 'Furnishing', type: 'select', options: FURNISHING_TYPES },
                                    { name: 'bhk', label: 'BHK', type: 'number', min: 0, max: 10 },
                                    { name: 'area', label: 'Area (sq ft)', type: 'number', min: 100, max: 20000 },
                                    { name: 'bathrooms', label: 'Bathrooms', type: 'number', min: 1, max: 10 },
                                    { name: 'age', label: 'Age (years)', type: 'number', min: 0, max: 50 },
                                    { name: 'amenities_count', label: 'Amenities (0-10)', type: 'number', min: 0, max: 10 },
                                ].map(field => (
                                    <div key={field.name} style={{ gridColumn: field.name === 'amenities_count' ? '1 / -1' : 'auto' }}>
                                        <label style={{ display: 'block', fontSize: 11, color: '#aaa', marginBottom: 4 }}>{field.label}</label>
                                        {field.type === 'select' ? (
                                            <select name={field.name} value={form[field.name]} onChange={handleChange}
                                                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, background: '#0f1124', border: '1px solid rgba(108,99,255,0.3)', color: '#fff', fontSize: 13 }}>
                                                {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        ) : (
                                            <input type="number" name={field.name} value={form[field.name]} onChange={handleChange}
                                                min={field.min} max={field.max}
                                                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, background: '#0f1124', border: '1px solid rgba(108,99,255,0.3)', color: '#fff', fontSize: 13, boxSizing: 'border-box' }} />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <motion.button onClick={handlePredict} disabled={loading} whileTap={{ scale: 0.97 }}
                                style={{ width: '100%', padding: '11px', borderRadius: 10, background: '#6c63ff', border: 'none', color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                                {loading ? 'Predicting...' : 'Predict Price'}
                            </motion.button>

                            {error && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 10 }}>{error}</p>}

                            {result && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 16 }}>
                                    <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(108,99,255,0.1)', borderRadius: 12 }}>
                                        <div style={{ fontSize: 13, color: '#aaa', marginBottom: 4 }}>Predicted {result.listing_type === 'rent' ? 'Monthly Rent' : 'Sale Price'}</div>
                                        <div style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(90deg,#6c63ff,#22d3a5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                            {result.predicted_label}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>80% CI: {result.range_label}</div>
                                    </div>

                                    {chartData.length > 1 && (
                                        <div style={{ marginTop: 16 }}>
                                            <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <TrendingUp size={13} /> Comparative Market Analysis
                                                <span style={{ marginLeft: 'auto', background: '#1a1f3a', padding: '2px 8px', borderRadius: 6, fontSize: 10 }}>
                                                    ⚠️ Trend data is seeded/synthetic for demonstration
                                                </span>
                                            </div>
                                            <ResponsiveContainer width="100%" height={180}>
                                                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                                    <XAxis dataKey="label" tick={{ fill: '#aaa', fontSize: 11 }} />
                                                    <YAxis tick={{ fill: '#aaa', fontSize: 10 }} tickFormatter={v => v >= 10000000 ? `${(v/10000000).toFixed(1)}Cr` : v >= 100000 ? `${(v/100000).toFixed(1)}L` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                                                    <Tooltip content={<CUSTOM_TOOLTIP />} />
                                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                                        {chartData.map((entry, index) => (
                                                            <Cell key={index}
                                                                fill={entry.isPredicted ? '#6c63ff' : entry.isListed ? '#22d3a5' : '#4a4075'}
                                                            />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: 11, color: '#aaa' }}>
                                                <span><span style={{ color: '#4a4075' }}>■</span> Historical Avg</span>
                                                <span><span style={{ color: '#6c63ff' }}>■</span> AI Predicted</span>
                                                {property?.price && <span><span style={{ color: '#22d3a5' }}>■</span> Listed Price</span>}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
