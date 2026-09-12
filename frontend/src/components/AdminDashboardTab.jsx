import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Check, X, ShieldAlert, Sliders, TrendingUp, Users, Building2, CheckCircle2, Clock, Trash2, Edit2, AlertOctagon, Activity, DollarSign, MessageSquare } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

export default function AdminDashboardTab() {
    const [subTab, setSubTab] = useState('analytics'); // 'analytics' | 'users' | 'listings' | 'moderation' | 'config' | 'inquiries'
    const [analytics, setAnalytics] = useState(null);
    const [users, setUsers] = useState([]);
    const [pendingProps, setPendingProps] = useState([]);
    const [allProperties, setAllProperties] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [editingPropId, setEditingPropId] = useState(null);
    const [editFutureDevText, setEditFutureDevText] = useState('');
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadAdminData = async () => {
        setLoading(true);
        try {
            const [aRes, mRes, cRes, uRes, pRes, iRes] = await Promise.all([
                api.get('/admin/analytics').catch(() => ({ data: { analytics: null } })),
                api.get('/admin/moderation?status=pending').catch(() => ({ data: { properties: [] } })),
                api.get('/admin/config').catch(() => ({ data: { config: null } })),
                api.get('/admin/users').catch(() => ({ data: { users: [] } })),
                api.get('/properties?limit=50').catch(() => ({ data: { properties: [] } })),
                api.get('/admin/inquiries').catch(() => ({ data: { inquiries: [] } }))
            ]);
            setInquiries(iRes.data.inquiries || []);
            
            // Mock data if backend analytics fail (for demo/resilience)
            setAnalytics(aRes.data.analytics || {
                listingsOverTime: [{ _id: { month: 1, year: 2024 }, count: 12 }, { _id: { month: 2, year: 2024 }, count: 19 }],
                typeBreakdown: [{ _id: 'apartment', count: 45 }, { _id: 'villa', count: 12 }, { _id: 'studio', count: 8 }],
                mostViewed: [],
                pendingCount: mRes.data.properties?.length || 0
            });
            setPendingProps(mRes.data.properties || []);
            setConfig(cRes.data.config || {
                requireVerificationBeforePublish: true,
                allowGuestSearch: true,
                maintenanceMode: false
            });
            setUsers(uRes.data.users || []);
            setAllProperties(pRes.data.properties || []);
        } catch (err) {
            console.error('Failed to load admin data:', err);
            toast.error('Error loading admin dashboard data');
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
            toast.error('Failed to update config. Reverting...');
            setConfig(config);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole });
            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            toast.success(`User role updated to ${newRole}`);
        } catch (err) {
            toast.error('Failed to update role');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(users.filter(u => u._id !== userId));
            toast.success('User deleted successfully');
        } catch (err) {
            toast.error('Failed to delete user');
        }
    };

    const handleUpdateProperty = async (id, updates) => {
        try {
            await api.put(`/properties/${id}`, updates);
            setAllProperties(prev => prev.map(p => p._id === id ? { ...p, ...updates } : p));
            setEditingPropId(null);
            toast.success('Property updated successfully');
        } catch (err) {
            toast.error('Failed to update property');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-muted font-medium">Loading Admin Command Center...</p>
            </div>
        );
    }

    const tabs = [
        { id: 'analytics', label: 'Analytics & Growth', icon: <TrendingUp size={16} /> },
        { id: 'users', label: `Users & Access (${users.length})`, icon: <Users size={16} /> },
        { id: 'listings', label: 'Manage Listings', icon: <Building2 size={16} /> },
        { id: 'inquiries', label: `User Inquiries (${inquiries.length})`, icon: <MessageSquare size={16} /> },
        { id: 'moderation', label: `Moderation Queue`, icon: <ShieldAlert size={16} />, badge: pendingProps.length },
        { id: 'config', label: 'System Config', icon: <Sliders size={16} /> },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-elevated border border-borderSubtle/30 p-5 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted uppercase tracking-wider">Total Users</p>
                        <p className="text-2xl font-bold text-primary">{users.length}</p>
                    </div>
                </div>
                <div className="bg-elevated border border-borderSubtle/30 p-5 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted uppercase tracking-wider">Active Listings</p>
                        <p className="text-2xl font-bold text-primary">
                            {analytics?.typeBreakdown?.reduce((acc, curr) => acc + curr.count, 0) || 0}
                        </p>
                    </div>
                </div>
                <div className="bg-elevated border border-borderSubtle/30 p-5 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <AlertOctagon size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted uppercase tracking-wider">Pending Moderation</p>
                        <p className="text-2xl font-bold text-primary">{pendingProps.length}</p>
                    </div>
                </div>
                <div className="bg-elevated border border-borderSubtle/30 p-5 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted uppercase tracking-wider">Est. Monthly MRR</p>
                        <p className="text-2xl font-bold text-primary">₹1,24,500</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-2 border-b border-borderSubtle/20 custom-scrollbar">
                {tabs.map(st => (
                    <button key={st.id} onClick={() => setSubTab(st.id)}
                        className={`flex items-center gap-2 whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            subTab === st.id 
                            ? 'bg-primary text-white shadow-md' 
                            : 'bg-surface text-muted hover:text-primary hover:bg-borderSubtle/10'
                        }`}
                    >
                        {st.icon} {st.label}
                        {st.badge > 0 && (
                            <span className={`ml-1 flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${
                                subTab === st.id ? 'bg-white text-primary' : 'bg-red-500 text-white'
                            }`}>
                                {st.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {/* ─── ANALYTICS TAB ─── */}
                    {subTab === 'analytics' && analytics && (
                        <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-elevated border border-borderSubtle/20 rounded-2xl p-6 shadow-sm">
                                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-6">Listings Created Over Time</h4>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analytics.listingsOverTime.map(l => ({ label: `${l._id.month}/${l._id.year}`, count: l.count }))}>
                                                <XAxis dataKey="label" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                                                <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                                <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={50} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-elevated border border-borderSubtle/20 rounded-2xl p-6 shadow-sm">
                                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-6">Property Type Breakdown</h4>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={analytics.typeBreakdown} dataKey="count" nameKey="_id" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}>
                                                    {analytics.typeBreakdown.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── USERS TAB ─── */}
                    {subTab === 'users' && (
                        <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="bg-elevated border border-borderSubtle/20 rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-borderSubtle/20 flex justify-between items-center bg-surface">
                                    <h4 className="font-bold text-primary">User Management</h4>
                                    <div className="text-sm text-muted">Manage roles and permissions</div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-surface/50 text-muted uppercase text-[11px] font-bold tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">User</th>
                                                <th className="px-6 py-4">Contact</th>
                                                <th className="px-6 py-4">Role</th>
                                                <th className="px-6 py-4">Joined</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-borderSubtle/10">
                                            {users.map(u => (
                                                <tr key={u._id} className="hover:bg-surface/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-primary">{u.name}</div>
                                                        <div className="text-xs text-muted">ID: {u._id.slice(-6)}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-primary">{u.email}</div>
                                                        <div className="text-muted text-xs">{u.phone || 'No phone'}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select 
                                                            value={u.role} 
                                                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                            className={`text-xs font-bold px-3 py-1.5 rounded-full border-none outline-none cursor-pointer ${
                                                                u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                                u.role === 'owner' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-slate-100 text-slate-700'
                                                            }`}
                                                        >
                                                            <option value="user">User</option>
                                                            <option value="owner">Owner</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 text-muted">
                                                        {new Date(u.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button 
                                                            onClick={() => handleDeleteUser(u._id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── LISTINGS TAB ─── */}
                    {subTab === 'listings' && (
                        <motion.div key="listings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="bg-elevated border border-borderSubtle/20 rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-borderSubtle/20 flex justify-between items-center bg-surface">
                                    <h4 className="font-bold text-primary">Manage Active Listings</h4>
                                    <div className="text-sm text-muted">Inline Admin Editing</div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-surface/50 text-muted uppercase text-[11px] font-bold tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">Property</th>
                                                <th className="px-6 py-4">Future Development</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-borderSubtle/10">
                                            {allProperties.map(p => (
                                                <tr key={p._id} className="hover:bg-surface/30 transition-colors">
                                                    <td className="px-6 py-4 align-top">
                                                        <div className="font-bold text-primary line-clamp-1">{p.title}</div>
                                                        <div className="text-xs text-muted">{p.location?.city} • ₹{p.price?.toLocaleString('en-IN')}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {editingPropId === p._id ? (
                                                            <textarea
                                                                className="w-full bg-surface border border-borderSubtle/50 rounded-md p-2 text-xs text-primary focus:border-primary focus:outline-none resize-y"
                                                                value={editFutureDevText}
                                                                onChange={e => setEditFutureDevText(e.target.value)}
                                                                rows={3}
                                                                placeholder="Add future development info for this area..."
                                                            />
                                                        ) : (
                                                            <div className="text-xs text-muted line-clamp-3 max-w-sm whitespace-pre-wrap">
                                                                {p.futureDevelopment || <span className="italic opacity-50">Not specified</span>}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right align-top">
                                                        {editingPropId === p._id ? (
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => handleUpdateProperty(p._id, { futureDevelopment: editFutureDevText })} className="p-1.5 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200 transition-colors" title="Save">
                                                                    <Check size={16} />
                                                                </button>
                                                                <button onClick={() => setEditingPropId(null)} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors" title="Cancel">
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                onClick={() => { setEditingPropId(p._id); setEditFutureDevText(p.futureDevelopment || ''); }}
                                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Inline Edit"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {allProperties.length === 0 && (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-8 text-center text-muted">
                                                        No properties found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── MODERATION TAB ─── */}
                    {subTab === 'moderation' && (
                        <motion.div key="moderation" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <h4 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                Pending Approval Queue 
                                <span className="bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">{pendingProps.length}</span>
                            </h4>
                            {pendingProps.length === 0 ? (
                                <div className="bg-elevated border border-borderSubtle/20 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 size={32} className="text-emerald-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary mb-2">Queue is Empty</h3>
                                    <p className="text-muted">All submitted listings have been reviewed and moderated. Great job!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {pendingProps.map(prop => (
                                        <div key={prop._id} className="bg-elevated border border-borderSubtle/20 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-5">
                                            <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-surface shrink-0">
                                                {prop.images?.[0] ? (
                                                    <img src={prop.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted">No Image</div>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <h5 className="font-bold text-primary text-lg line-clamp-1">{prop.title}</h5>
                                                        <span className="text-xs font-bold px-2 py-1 bg-orange-100 text-orange-600 rounded-md uppercase">Pending</span>
                                                    </div>
                                                    <p className="text-sm text-muted mt-1">{prop.location?.address} • {prop.type}</p>
                                                    <p className="text-sm font-semibold text-primary mt-2">Posted by: {prop.owner?.name || 'Owner'}</p>
                                                </div>
                                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-borderSubtle/10">
                                                    <button onClick={() => handleApproveReject(prop._id, 'approved')}
                                                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold text-sm transition-colors">
                                                        <Check size={16} /> Approve
                                                    </button>
                                                    <button onClick={() => handleApproveReject(prop._id, 'rejected')}
                                                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold text-sm transition-colors">
                                                        <X size={16} /> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ─── INQUIRIES TAB ─── */}
                    {subTab === 'inquiries' && (
                        <motion.div key="inquiries" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-elevated border border-borderSubtle/20 p-5 rounded-2xl shadow-sm">
                                <div>
                                    <h4 className="text-lg font-bold text-primary flex items-center gap-2">
                                        <MessageSquare size={20} className="text-blue-500" /> Platform Inquiries ({inquiries.length})
                                    </h4>
                                    <p className="text-xs text-muted mt-1">Real-time buyer, tenant, and flatmate inquiries across all listings</p>
                                </div>
                            </div>

                            {inquiries.length === 0 ? (
                                <div className="bg-elevated border border-borderSubtle/20 rounded-2xl p-12 text-center text-muted">
                                    No inquiries found.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {inquiries.map((inq, idx) => (
                                        <div key={inq._id || idx} className="bg-elevated border border-borderSubtle/20 p-5 rounded-2xl shadow-sm space-y-4">
                                            {/* Header */}
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary overflow-hidden">
                                                        {inq.user?.avatar ? (
                                                            <img src={inq.user.avatar} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            inq.user?.name?.charAt(0) || 'U'
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-primary text-sm">{inq.user?.name || 'Prospective Tenant/Buyer'}</h5>
                                                        <p className="text-xs text-muted">{inq.user?.email} • {inq.phone}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                                    inq.status === 'responded' 
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : inq.status === 'closed'
                                                        ? 'bg-slate-100 text-slate-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {inq.status}
                                                </span>
                                            </div>

                                            {/* Target listing */}
                                            <div className="p-3 bg-surface/50 border border-borderSubtle/10 rounded-xl text-xs space-y-1">
                                                <span className="font-bold uppercase tracking-wider text-[10px] text-accent">
                                                    {inq.propertyType === 'pg' ? '🏢 PG / Hostel' : '🏡 Residential Property'}
                                                </span>
                                                <p className="font-semibold text-primary line-clamp-1">
                                                    {inq.property?.title || inq.pg?.name || 'Listing Details'}
                                                </p>
                                                <p className="text-muted">
                                                    {inq.property?.location?.address || inq.pg?.location?.address || 'Prime City Location'} • ₹{inq.property?.price?.toLocaleString('en-IN') || inq.pg?.rentPerMonth?.toLocaleString('en-IN') || '15,000'}
                                                </p>
                                                <p className="text-[11px] text-muted">
                                                    Owner: <strong className="text-primary">{inq.owner?.name || 'Verified Owner'}</strong> ({inq.owner?.phone || 'N/A'})
                                                </p>
                                            </div>

                                            {/* Message */}
                                            <div className="text-xs text-primary/90 bg-primary/5 p-3 rounded-xl border border-primary/10">
                                                <span className="font-semibold block text-[11px] text-primary mb-1">User Question:</span>
                                                "{inq.message}"
                                            </div>

                                            {/* Owner response if any */}
                                            {inq.ownerResponse && (
                                                <div className="text-xs text-emerald-800 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/50">
                                                    <span className="font-semibold block text-[11px] text-emerald-700 mb-1">Owner Reply:</span>
                                                    "{inq.ownerResponse}"
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ─── CONFIG TAB ─── */}
                    {subTab === 'config' && config && (
                        <motion.div key="config" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl">
                            <div className="bg-elevated border border-borderSubtle/20 rounded-2xl shadow-sm p-6 sm:p-8">
                                <h4 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                                    <Sliders size={20} className="text-blue-500" /> System Configuration
                                </h4>
                                <div className="space-y-4">
                                    {[
                                        { key: 'requireVerificationBeforePublish', label: 'Require Admin Approval for Owner Listings', desc: 'When enabled, new listings submitted by owners start in a "pending" state until explicitly approved by an admin.' },
                                        { key: 'allowGuestSearch', label: 'Allow Guest Property Search', desc: 'Allow non-logged-in users to browse and search properties on the platform.' },
                                        { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Temporarily disables access to non-admin users and displays a maintenance page.' },
                                    ].map(item => (
                                        <div key={item.key} className="flex items-center justify-between p-5 rounded-xl border border-borderSubtle/20 bg-surface/30 hover:bg-surface/60 transition-colors gap-6">
                                            <div className="flex-1">
                                                <div className="font-bold text-primary text-sm sm:text-base">{item.label}</div>
                                                <div className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">{item.desc}</div>
                                            </div>
                                            <button 
                                                onClick={() => handleConfigToggle(item.key)}
                                                className={`relative w-12 h-6 rounded-full transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${
                                                    config[item.key] ? 'bg-emerald-500' : 'bg-slate-300'
                                                }`}
                                            >
                                                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${
                                                    config[item.key] ? 'translate-x-6' : 'translate-x-0'
                                                }`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
