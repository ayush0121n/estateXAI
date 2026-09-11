/* eslint-disable */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Users, LogOut, Menu, X, User, Plus,
  LayoutDashboard, ChevronDown, Sparkles, Heart, FileText, Home
} from 'lucide-react';

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

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = [
    { label: 'Properties', href: '/properties' },
    { label: 'PG / Hostel', href: '/pgs' },
    { label: 'Find Flatmates', href: '/roommates' },
    { label: 'AI Predictor', href: '/ai-prediction' },
    { label: 'Toolkit', href: '/rental-toolkit' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-surface/80 backdrop-blur-xl border-b border-borderSubtle/20 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-serif text-2xl tracking-tight text-primary font-semibold">
              Estate<span className="text-accent italic">XAI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-muted hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors px-3 py-2 rounded-btn"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.name?.split(' ')[0] || 'Account'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-52 bg-elevated border border-borderSubtle/20 rounded-card shadow-lg py-2 z-50"
                    >
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary hover:bg-surface transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-accent" />
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary hover:bg-surface transition-colors"
                      >
                        <User className="w-4 h-4 text-accent" />
                        Profile
                      </Link>
                      {(user.role === 'owner' || user.role === 'admin') && (
                        <>
                          <Link
                            to="/list-property"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary hover:bg-surface transition-colors"
                          >
                            <Plus className="w-4 h-4 text-accent" />
                            List Property
                          </Link>
                          <Link
                            to="/list-pg"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary hover:bg-surface transition-colors"
                          >
                            <Building2 className="w-4 h-4 text-accent" />
                            List PG
                          </Link>
                        </>
                      )}
                      <div className="border-t border-borderSubtle/15 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-primary hover:bg-surface transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-accent" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex text-sm font-medium text-primary hover:text-accent transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white text-sm font-medium px-4 py-2.5 rounded-btn hover:bg-black transition-all flex items-center gap-1.5"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-primary"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-borderSubtle/15 bg-surface"
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`block py-3 text-sm font-medium ${
                    isActive(link.href) ? 'text-primary' : 'text-muted'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className="pt-4 flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="py-2.5 text-center text-sm font-medium text-primary border border-borderSubtle/30 rounded-btn"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="py-2.5 text-center text-sm font-medium bg-primary text-white rounded-btn"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
