import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Home, Users, LogOut, Menu, X, User, Plus, LayoutDashboard, ChevronDown } from 'lucide-react';

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
        background: scrolled ? 'rgba(10, 11, 30, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(108, 99, 255, 0.2)' : 'none',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none'
    };

    const linkStyle = (path) => ({
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 500,
        color: isActive(path) ? '#6c63ff' : '#b0b7d3',
        background: isActive(path) ? 'rgba(108, 99, 255, 0.1)' : 'transparent',
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
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 40, height: 40,
                            background: 'linear-gradient(135deg, #6c63ff, #43e5f7)',
                            borderRadius: 12,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 20px rgba(108,99,255,0.4)'
                        }}>
                            <Building2 size={22} color="white" />
                        </div>
                        <div>
                            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 20, color: 'white' }}>Estate</span>
                            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 20, background: 'linear-gradient(135deg, #6c63ff, #43e5f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>XAi</span>
                        </div>
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
                    </div>

                    {/* Desktop Auth */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="desktop-nav">
                        {user ? (
                            <>
                                {(user.role === 'owner' || user.role === 'admin') && (
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                            style={{ ...linkStyle('/list'), display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(108,99,255,0.15)', color: '#6c63ff', border: '1px solid rgba(108,99,255,0.3)' }}
                                        >
                                            <Plus size={16} /> List <ChevronDown size={14} />
                                        </button>
                                        {dropdownOpen && (
                                            <div style={{
                                                position: 'absolute', top: '110%', right: 0, minWidth: 180,
                                                background: '#161933', border: '1px solid rgba(108,99,255,0.3)',
                                                borderRadius: 12, padding: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                                            }}>
                                                <Link to="/list-property" style={{ display: 'block', padding: '10px 14px', borderRadius: 8, color: '#b0b7d3', fontSize: 14, transition: 'all 0.2s' }}
                                                    onMouseEnter={e => e.target.style.background = 'rgba(108,99,255,0.1)'}
                                                    onMouseLeave={e => e.target.style.background = 'transparent'}
                                                >
                                                    🏠 List Property
                                                </Link>
                                                <Link to="/list-pg" style={{ display: 'block', padding: '10px 14px', borderRadius: 8, color: '#b0b7d3', fontSize: 14, transition: 'all 0.2s' }}
                                                    onMouseEnter={e => e.target.style.background = 'rgba(108,99,255,0.1)'}
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
                                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: 24, padding: '6px 14px 6px 6px' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #43e5f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={16} color="white" />
                                    </div>
                                    <span style={{ fontSize: 14, color: '#b0b7d3', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name?.split(' ')[0]}</span>
                                </Link>
                                <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7298', padding: '8px' }}>
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
                {mobileOpen && (
                    <div style={{
                        background: 'rgba(17,19,38,0.98)', borderTop: '1px solid rgba(108,99,255,0.2)',
                        padding: 20, display: 'flex', flexDirection: 'column', gap: 8
                    }}>
                        <Link to="/" style={{ ...linkStyle('/'), justifyContent: 'flex-start' }}><Home size={16} /> Home</Link>
                        <Link to="/properties" style={{ ...linkStyle('/properties'), justifyContent: 'flex-start' }}><Building2 size={16} /> Properties</Link>
                        <Link to="/pgs" style={{ ...linkStyle('/pgs'), justifyContent: 'flex-start' }}><Users size={16} /> PG / Hostel</Link>
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
                    </div>
                )}
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
