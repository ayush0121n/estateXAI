import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-b from-primary to-[#050612] border-t border-accent/15 pt-16 pb-6 mt-auto">
            <div className="container mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    {/* Brand */}
                    <div>
                        <Link to="/" className="inline-block mb-4">
                            <Logo size="medium" />
                        </Link>
                        <p className="text-[#6b7298] text-sm leading-relaxed">
                            AI-powered real estate platform connecting property buyers, tenants, and PG seekers with verified listings.
                        </p>
                        <div className="flex gap-3 mt-5">
                            {[Github, Twitter, Linkedin].map((Icon, i) => (
                                <div key={i} className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center cursor-pointer hover:bg-accent/20 hover:-translate-y-1 transition-all duration-300">
                                    <Icon size={16} className="text-[#6b7298] hover:text-accent transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-5 text-base">Quick Links</h3>
                        <div className="flex flex-col gap-3">
                            {[
                                { label: 'Buy Property', to: '/properties?listingType=sale' },
                                { label: 'Rent Property', to: '/properties?listingType=rent' },
                                { label: 'PG for Boys', to: '/pgs?genderType=male' },
                                { label: 'PG for Girls', to: '/pgs?genderType=female' },
                                { label: 'Co-living Spaces', to: '/pgs?type=coliving' }
                            ].map(link => (
                                <Link key={link.to} to={link.to} className="text-[#6b7298] text-sm hover:text-accent transition-colors flex items-center gap-1 group">
                                    <span className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300">→</span>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Locations */}
                    <div>
                        <h3 className="text-white font-semibold mb-5 text-base">Popular Areas</h3>
                        <div className="flex flex-col gap-3">
                            {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata'].map(area => (
                                <Link key={area} to={`/properties?city=${area}`} className="text-[#6b7298] text-sm hover:text-accent transition-colors flex items-center gap-2">
                                    <MapPin size={12} className="inline text-accent/70" />{area}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-5 text-base">Contact</h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 text-[#6b7298] text-sm">
                                <MapPin size={16} className="text-accent" />
                                India
                            </div>
                            <div className="flex items-center gap-3 text-[#6b7298] text-sm">
                                <Mail size={16} className="text-accent" />
                                contact@estatexai.com
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-accent/15 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[#6b7298] text-sm">
                        © {year} EstateXAi. All rights reserved.
                    </p>
                    <p className="text-[#6b7298] text-sm">
                        Made by Ayush Narkhede
                    </p>
                </div>
            </div>
        </footer>
    );
}
