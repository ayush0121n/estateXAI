/* eslint-disable */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Home, Users, LogOut, Menu, X, User, Plus, LayoutDashboard, ChevronDown, Sparkles, Heart, FileText } from 'lucide-react';
import Logo from './Logo';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
        setDropdownOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const navStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(9, 9, 11, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--dark-border)' : 'none',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.5)' : 'none'
    };

    const linkStyle = (path) => ({
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 500,
        color: isActive(path) ? 'var(--primary)' : 'var(--text-secondary)',
        background: isActive(path) ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        textDecoration: 'none',
        border: 'none',
        fontFamily: 'inherit'
    });

    return (
        <nav style={navStyle}>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
                    {/* Logo */}
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <Logo size="medium" />
                    </Link>

                    {/* Desktop Nav Links */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
                        <Link to="/" style={linkStyle('/')}>
                            <Home size={16} /> Home
                        </Link>
                        <Link to="/properties" style={linkStyle('/properties')}>
                            <Building2 size={16} /> Properties
                        </Link>
                        <Link to="/pgs" style={linkStyle('/pgs')}>
                            <Users size={16} /> PG / Hostel
                        </Link>
                        <Link to="/roommates" style={linkStyle('/roommates')}>
                            <Heart size={16} /> Find Flatmates
                        </Link>
                        <Link to="/ai-prediction" style={{...linkStyle('/ai-prediction'), color: isActive('/ai-prediction') ? 'var(--primary)' : 'var(--text-secondary)', background: isActive('/ai-prediction') ? 'rgba(255, 255, 255, 0.05)' : 'transparent'}}>
                            <Sparkles size={16} color={isActive('/ai-prediction') ? 'var(--primary)' : 'var(--text-secondary)'} /> AI Predictor
                        </Link>
                        <Link to="/rental-toolkit" style={linkStyle('/rental-toolkit')}>
                            <FileText size={16} /> Toolkit
                        </Link>
                    </div>

                    {/* Desktop Auth */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="desktop-nav">
                        {/* Global City Selector */}
                        <div style={{ marginRight: 8 }}>
                            <select 
                                className="input" 
                                style={{ padding: '6px 12px', fontSize: 13, minWidth: 120, height: 'auto', background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                                value={localStorage.getItem('userCity') || ''}
                                onChange={(e) => {
                                    localStorage.setItem('userCity', e.target.value);
                                    window.dispatchEvent(new Event('storage'));
                                    window.location.reload();
                                }}
                            >
                                <option value="">Global: All Cities</option>
                                {['Bangalore', 'Pune', 'Hyderabad', 'Mumbai', 'Delhi NCR', 'Chennai', 'Kolkata', 'Ahmedabad'].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {user ? (
                            <>
                                {(user.role === 'owner' || user.role === 'admin') && (
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                            style={{ ...linkStyle('/list'), display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', color: 'var(--primary)', border: '1px solid var(--dark-border)' }}
                                        >
                                            <Plus size={16} /> List <ChevronDown size={14} />
                                        </button>
                                        {dropdownOpen && (
                                            <div style={{
                                                position: 'absolute', top: '110%', right: 0, minWidth: 180,
                                                background: 'var(--dark-card)', border: '1px solid var(--dark-border)',
                                                borderRadius: 4, padding: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
                                            }}>
                                                <Link to="/list-property" style={{ display: 'block', padding: '10px 14px', borderRadius: 4, color: 'var(--text-primary)', fontSize: 14, transition: 'all 0.2s' }}
                                                    onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                                    onMouseLeave={e => e.target.style.background = 'transparent'}
                                                >
                                                    🏠 List Property
                                                </Link>
                                                <Link to="/list-pg" style={{ display: 'block', padding: '10px 14px', borderRadius: 4, color: 'var(--text-primary)', fontSize: 14, transition: 'all 0.2s' }}
                                                    onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                                    onMouseLeave={e => e.target.style.background = 'transparent'}
                                                >
                                                    🏘️ List PG / Hostel
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <Link to="/dashboard" style={linkStyle('/dashboard')}>
                                    <LayoutDashboard size={16} /> Dashboard
                                </Link>
                                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1px solid var(--dark-border)', borderRadius: 4, padding: '4px 12px 4px 4px' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '2px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={14} color="#000" />
                                    </div>
                                    <span style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name?.split(' ')[0]}</span>
                                </Link>
                                <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '8px' }}>
                                    <LogOut size={18} />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-ghost" style={{ padding: '9px 20px', fontSize: 14 }}>Log in</Link>
                                <Link to="/register" className="btn btn-primary" style={{ padding: '9px 20px', fontSize: 14 }}>Sign Up</Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'white', display: 'none' }}
                        className="mobile-menu-btn"
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Nav */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                background: 'rgba(9,9,11,0.98)', borderTop: '1px solid var(--dark-border)',
                                padding: 20, display: 'flex', flexDirection: 'column', gap: 8
                            }}>
                            <Link to="/" style={{ ...linkStyle('/'), justifyContent: 'flex-start' }}><Home size={16} /> Home</Link>
                            <Link to="/properties" style={{ ...linkStyle('/properties'), justifyContent: 'flex-start' }}><Building2 size={16} /> Properties</Link>
                            <Link to="/pgs" style={{ ...linkStyle('/pgs'), justifyContent: 'flex-start' }}><Users size={16} /> PG / Hostel</Link>
                            <Link to="/roommates" style={{ ...linkStyle('/roommates'), justifyContent: 'flex-start' }}><Heart size={16} /> Find Flatmates</Link>
                            <Link to="/ai-prediction" style={{ ...linkStyle('/ai-prediction'), justifyContent: 'flex-start' }}><Sparkles size={16} /> AI Predictor</Link>
                            <Link to="/rental-toolkit" style={{ ...linkStyle('/rental-toolkit'), justifyContent: 'flex-start' }}><FileText size={16} /> Rental Toolkit</Link>
                            {user ? (
                                <>
                                    <Link to="/dashboard" style={{ ...linkStyle('/dashboard'), justifyContent: 'flex-start' }}><LayoutDashboard size={16} /> Dashboard</Link>
                                    <Link to="/profile" style={{ ...linkStyle('/profile'), justifyContent: 'flex-start' }}><User size={16} /> Profile</Link>
                                    {(user.role === 'owner' || user.role === 'admin') && (
                                        <>
                                            <Link to="/list-property" style={{ ...linkStyle('/list-property'), justifyContent: 'flex-start' }}><Plus size={16} /> List Property</Link>
                                            <Link to="/list-pg" style={{ ...linkStyle('/list-pg'), justifyContent: 'flex-start' }}><Plus size={16} /> List PG</Link>
                                        </>
                                    )}
                                    <button onClick={handleLogout} style={{ ...linkStyle('/'), justifyContent: 'flex-start', color: '#ef4444' }}>
                                        <LogOut size={16} /> Logout
                                    </button>
                                </>
                            ) : (
                                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                    <Link to="/login" className="btn btn-ghost" style={{ flex: 1 }}>Log in</Link>
                                    <Link to="/register" className="btn btn-primary" style={{ flex: 1 }}>Sign Up</Link>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
        </nav>
    );
}

