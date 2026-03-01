import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer style={{
            background: 'linear-gradient(180deg, #0a0b1e 0%, #050612 100%)',
            borderTop: '1px solid rgba(108, 99, 255, 0.15)',
            padding: '60px 0 24px',
            marginTop: 'auto'
        }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40, marginBottom: 48 }}>
                    {/* Brand */}
                    <div>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #6c63ff, #43e5f7)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Building2 size={20} color="white" />
                            </div>
                            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 20 }}>
                                <span style={{ color: 'white' }}>Estate</span>
                                <span style={{ background: 'linear-gradient(135deg, #6c63ff, #43e5f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>XAi</span>
                            </span>
                        </Link>
                        <p style={{ color: '#6b7298', fontSize: 14, lineHeight: 1.8 }}>
                            AI-powered real estate platform connecting property buyers, tenants, and PG seekers with verified listings.
                        </p>
                        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                            {[Github, Twitter, Linkedin].map((Icon, i) => (
                                <div key={i} style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <Icon size={16} color="#6b7298" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Quick Links</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { label: 'Buy Property', to: '/properties?listingType=sale' },
                                { label: 'Rent Property', to: '/properties?listingType=rent' },
                                { label: 'PG for Boys', to: '/pgs?genderType=male' },
                                { label: 'PG for Girls', to: '/pgs?genderType=female' },
                                { label: 'Co-living Spaces', to: '/pgs?type=coliving' }
                            ].map(link => (
                                <Link key={link.to} to={link.to} style={{ color: '#6b7298', fontSize: 14, transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.target.style.color = '#6c63ff'}
                                    onMouseLeave={e => e.target.style.color = '#6b7298'}>
                                    → {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Locations */}
                    <div>
                        <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Popular Areas</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {['Kothrud', 'Hinjewadi', 'Viman Nagar', 'Baner', 'Koregaon Park', 'Aundh'].map(area => (
                                <Link key={area} to={`/properties?city=${area}`} style={{ color: '#6b7298', fontSize: 14, transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.target.style.color = '#6c63ff'}
                                    onMouseLeave={e => e.target.style.color = '#6b7298'}>
                                    <MapPin size={12} style={{ display: 'inline', marginRight: 6 }} />{area}, Pune
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Contact</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6b7298', fontSize: 14 }}>
                                <MapPin size={16} color="#6c63ff" />
                                Survey Park, SBUP, Pune - 411041
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6b7298', fontSize: 14 }}>
                                <Mail size={16} color="#6c63ff" />
                                contact@estatexai.com
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6b7298', fontSize: 14 }}>
                                <Phone size={16} color="#6c63ff" />
                                +91 98765 43210
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(108,99,255,0.15)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <p style={{ color: '#6b7298', fontSize: 13 }}>
                        © {year} EstateXAi. All rights reserved Made by Ayush Narkhede
                    </p>
                </div>
            </div>
            <style>{`
        @media (max-width: 1024px) { footer .container > div:first-child { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px) { footer .container > div:first-child { grid-template-columns: 1fr !important; } }
      `}</style>
        </footer>
    );
}
