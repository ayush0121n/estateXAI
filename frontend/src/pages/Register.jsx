import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Building2, User, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer, staggerItem } from '../utils/animations';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'user', institution: '', workplace: '' });
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            await register(form);
            toast.success('Account created! Welcome to EstateXAI 🎉');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

    return (
        <div className="light-page min-h-[calc(100vh-72px)] flex items-center justify-center p-6 md:p-8 font-sans relative overflow-hidden py-12">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-3xl" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />

            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="w-full max-w-[480px] relative z-10">
                <motion.div variants={staggerItem} className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="font-serif text-3xl font-bold text-primary mb-2">Create Account</h1>
                    <p className="text-muted font-medium">Join thousands on EstateXAI</p>
                </motion.div>

                <motion.div variants={staggerItem} className="bg-elevated border border-borderSubtle/20 rounded-card p-6 md:p-10 shadow-xl shadow-black/5">
                    {/* Role Selector */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-8">
                        {[
                            { value: 'user', label: '🔍 I\'m Looking', desc: 'Find properties & PGs' },
                            { value: 'owner', label: '🏠 I\'m an Owner', desc: 'List my properties' }
                        ].map(r => (
                            <button key={r.value} type="button" onClick={() => set('role', r.value)}
                                className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                                    form.role === r.value 
                                        ? 'bg-primary/5 border-primary shadow-sm' 
                                        : 'bg-surface border-borderSubtle/20 hover:border-primary/40'
                                }`}>
                                <div className={`text-sm font-bold mb-1 ${form.role === r.value ? 'text-primary' : 'text-muted'}`}>{r.label}</div>
                                <div className="text-xs text-muted/70 font-medium">{r.desc}</div>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-bold text-primary mb-1.5">Full Name <span className="text-red-500">*</span></label>
                            <input type="text" required placeholder="Ayush Narkhede" value={form.name} onChange={e => set('name', e.target.value)} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-primary mb-1.5">Email <span className="text-red-500">*</span></label>
                            <input type="email" required placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-primary mb-1.5">Phone</label>
                            <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-primary mb-1.5">Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input type={showPwd ? 'text' : 'password'} required placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 pr-12 outline-none focus:border-primary text-primary transition-colors" />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors">
                                    {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {form.role === 'user' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-col gap-4 mt-2">
                                <div>
                                    <label className="block text-sm font-bold text-primary mb-1.5 flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-emerald-600" /> College / Institution <span className="text-muted/60 text-[10px] font-normal uppercase tracking-wider">(for smart PG match)</span>
                                    </label>
                                    <input type="text" placeholder="e.g. Delhi University, IIT Bombay" value={form.institution} onChange={e => set('institution', e.target.value)} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-primary mb-1.5 flex items-center gap-1.5">
                                        <Briefcase className="w-3.5 h-3.5 text-primary/60" /> Workplace <span className="text-muted/60 text-[10px] font-normal uppercase tracking-wider">(optional)</span>
                                    </label>
                                    <input type="text" placeholder="e.g. Infosys, TCS, Wipro" value={form.workplace} onChange={e => set('workplace', e.target.value)} className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" />
                                </div>
                            </motion.div>
                        )}

                        <button type="submit" disabled={loading} className="btn btn-primary mt-6 py-3.5 text-base font-bold shadow-md hover:shadow-lg transition-all">
                            {loading ? 'Creating Account...' : 'Create Free Account'}
                        </button>
                    </form>

                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-px bg-borderSubtle/20" />
                        <span className="text-muted text-xs font-bold uppercase tracking-wider">Or</span>
                        <div className="flex-1 h-px bg-borderSubtle/20" />
                    </div>

                    <p className="text-center text-muted text-sm font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">Sign in</Link>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
