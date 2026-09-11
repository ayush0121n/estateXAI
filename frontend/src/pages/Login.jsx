import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer, staggerItem } from '../utils/animations';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form.email, form.password);
            toast.success('Welcome back! 👋');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="light-page min-h-[calc(100vh-72px)] flex items-center justify-center p-6 md:p-8 font-sans relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-3xl" />
            
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="w-full max-w-[420px] relative z-10">
                {/* Logo */}
                <motion.div variants={staggerItem} className="text-center mb-10">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="font-serif text-3xl font-bold text-primary mb-2">Welcome Back</h1>
                    <p className="text-muted font-medium">Sign in to your EstateXAI account</p>
                </motion.div>

                <motion.div variants={staggerItem} className="bg-elevated border border-borderSubtle/20 rounded-card p-8 md:p-10 shadow-xl shadow-black/5">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div>
                            <label className="block text-sm font-bold text-primary mb-2">Email Address</label>
                            <input type="email" required placeholder="you@example.com" value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-primary mb-2">Password</label>
                            <div className="relative">
                                <input type={showPwd ? 'text' : 'password'} required placeholder="••••••••" value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 pr-12 outline-none focus:border-primary text-primary transition-colors" />
                                <button type="button" onClick={() => setShowPwd(!showPwd)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors">
                                    {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn btn-primary mt-2 py-3.5 text-base font-bold shadow-md hover:shadow-lg transition-all">
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-px bg-borderSubtle/20" />
                        <span className="text-muted text-xs font-bold uppercase tracking-wider">Or</span>
                        <div className="flex-1 h-px bg-borderSubtle/20" />
                    </div>

                    {/* Demo credentials */}
                    <div className="bg-surface border border-borderSubtle/10 rounded-xl p-4 mb-6 text-center">
                        <p className="text-xs text-primary font-bold uppercase tracking-wider mb-2">Demo Access</p>
                        <p className="text-sm text-muted font-medium">Register a free account to get started, or use the admin seed feature if available.</p>
                    </div>

                    <p className="text-center text-muted text-sm font-medium">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">Create one free</Link>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
