/* eslint-disable */
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Check, X, ShieldAlert, Sliders, TrendingUp, Users, Building2, CheckCircle2, Clock } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['var(--primary)', '#22d3a5', '#f59e0b', '#ef4444', '#a855f7', '#3b82f6'];

export default function AdminDashboardTab() {
    const [subTab, setSubTab] = useState('analytics'); // 'analytics' | 'moderation' | 'config'
    const [analytics, setAnalytics] = useState(null);
    const [pendingProps, setPendingProps] = useState([]);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadAdminData = async () => {
        setLoading(true);
        try {
            const [aRes, mRes, cRes] = await Promise.all([
                api.get('/admin/analytics'),
                api.get('/admin/moderation?status=pending'),
                api.get('/admin/config')
            ]);
            setAnalytics(aRes.data.analytics);
            setPendingProps(mRes.data.properties || []);
            setConfig(cRes.data.config);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAdminData(); }, []);

    const handleApproveReject = async (id, status) => {
        try {
            await api.patch(`/properties/${id}/approve`, { status });
            toast.success(`Property ${status} successfully!`);
            setPendingProps(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            toast.error('Action failed');
        }
    };

    const handleConfigToggle = async (key) => {
        if (!config) return;
        const updated = { ...config, [key]: !config[key] };
        setConfig(updated);
        try {
            await api.put('/admin/config', { [key]: updated[key] });
            toast.success('Configuration updated');
        } catch {
            toast.error('Failed to update config');
        }
    };

    if (loading) return <div style={{ padding: 40, color: '#aaa', textAlign: 'center' }}>Loading Admin Analytics & Moderation Queue...</div>;

    return (
        <div>
            {/* Sub Tabs */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12 }}>
                {[
                    { id: 'analytics', label: 'Analytics & Growth', icon: <TrendingUp size={16} /> },
                    { id: 'moderation', label: `Moderation Queue (${pendingProps.length})`, icon: <ShieldAlert size={16} />, badge: pendingProps.length > 0 ? pendingProps.length : null },
                    { id: 'config', label: 'System Configuration', icon: <Sliders size={16} /> },
                ].map(st => (
                    <button key={st.id} onClick={() => setSubTab(st.id)}
                        style={{
                            padding: '8px 16px', borderRadius: 10, border: 'none',
                            background: subTab === st.id ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                            color: subTab === st.id ? '#fff' : '#aaa',
                            fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                        }}>
                        {st.icon} {st.label}
                    </button>
                ))}
            </div>

            {/* Analytics Tab */}
            {subTab === 'analytics' && analytics && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 28 }}>
                        {/* Listings & Users over time */}
                        <div className="glass-card" style={{ padding: 20 }}>
                            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Listings Created Over Time</h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={analytics.listingsOverTime.map(l => ({ label: `${l._id.month}/${l._id.year}`, count: l.count }))}>
                                    <XAxis dataKey="label" tick={{ fill: '#aaa', fontSize: 11 }} />
                                    <YAxis tick={{ fill: '#aaa', fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Property Type Breakdown */}
                        <div className="glass-card" style={{ padding: 20 }}>
                            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Property Types Breakdown</h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={analytics.typeBreakdown} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={70} label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}>
                                        {analytics.typeBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Most Viewed Table */}
                    <div className="glass-card" style={{ padding: 20 }}>
                        <h4 style={{ color: 'white', fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Most-Viewed Properties</h4>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#aaa', textAlign: 'left' }}>
                                        <th style={{ padding: '8px 12px' }}>Property Title</th>
                                        <th style={{ padding: '8px 12px' }}>Type</th>
                                        <th style={{ padding: '8px 12px' }}>Location</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total Views</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.mostViewed.map(p => (
                                        <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <td style={{ padding: '10px 12px', color: '#fff', fontWeight: 600 }}>{p.title}</td>
                                            <td style={{ padding: '10px 12px', color: '#aaa', textTransform: 'capitalize' }}>{p.type}</td>
                                            <td style={{ padding: '10px 12px', color: '#aaa' }}>{p.location?.city}</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'right', color: '#22d3a5', fontWeight: 700 }}>{p.views}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Moderation Tab */}
            {subTab === 'moderation' && (
                <div>
                    <h4 style={{ color: 'white', fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Pending Approval Queue ({pendingProps.length})</h4>
                    {pendingProps.length === 0 ? (
                        <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: '#888' }}>
                            <CheckCircle2 size={40} color="#22d3a5" style={{ marginBottom: 12 }} />
                            <p style={{ margin: 0, fontSize: 15 }}>No pending properties! All submitted listings have been moderated.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {pendingProps.map(prop => (
                                <div key={prop._id} className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                                    {prop.images?.[0] && (
                                        <img src={prop.images[0]} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                                    )}
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{prop.title}</div>
                                        <div style={{ color: '#aaa', fontSize: 12, marginTop: 2 }}>{prop.location?.address} · Posted by: {prop.owner?.name || 'Owner'}</div>
                                        <div style={{ color: '#22d3a5', fontWeight: 600, fontSize: 13, marginTop: 4 }}>₹{prop.price?.toLocaleString()}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleApproveReject(prop._id, 'approved')}
                                            style={{ padding: '8px 16px', borderRadius: 8, background: '#22d3a5', border: 'none', color: '#000', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                            <Check size={14} /> Approve
                                        </motion.button>
                                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleApproveReject(prop._id, 'rejected')}
                                            style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                            <X size={14} /> Reject
                                        </motion.button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Config Tab */}
            {subTab === 'config' && config && (
                <div className="glass-card" style={{ padding: 24, maxWidth: 600 }}>
                    <h4 style={{ color: 'white', fontWeight: 600, marginBottom: 20, fontSize: 16 }}>System Configuration Settings</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            { key: 'requireVerificationBeforePublish', label: 'Require Admin Approval for Owner Listings', desc: 'When enabled, new owner listings start in "pending" status until approved.' },
                            { key: 'allowGuestSearch', label: 'Allow Guest Property Search', desc: 'Allow non-logged-in users to perform search queries.' },
                            { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Displays a maintenance notice to non-admin users.' },
                        ].map(item => (
                            <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div>
                                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{item.label}</div>
                                    <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>{item.desc}</div>
                                </div>
                                <button onClick={() => handleConfigToggle(item.key)}
                                    style={{
                                        width: 44, height: 24, borderRadius: 12, border: 'none',
                                        background: config[item.key] ? '#22d3a5' : '#444',
                                        cursor: 'pointer', position: 'relative', transition: '0.2s'
                                    }}>
                                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: config[item.key] ? 23 : 3, transition: '0.2s' }} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}


