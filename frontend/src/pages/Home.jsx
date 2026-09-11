/* eslint-disable */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, Users, TrendingUp, MapPin, ArrowRight,
  Star, Shield, Zap, Heart, FileText, BadgeCheck,
  Banknote, Search, Sparkles
} from 'lucide-react';
import api from '../utils/api';
import { PropertyCard, PGCard, SkeletonCard } from '../components/ListingCard';
import EstateXAIHero from '../components/EstateXAIHero';

const CITIES = [
  { name: 'Bangalore', emoji: '🏙️' },
  { name: 'Pune', emoji: '🏔️' },
  { name: 'Hyderabad', emoji: '🕌' },
  { name: 'Mumbai', emoji: '🌊' },
  { name: 'Delhi NCR', emoji: '🏛️' },
  { name: 'Chennai', emoji: '🛕' },
  { name: 'Kolkata', emoji: '🌉' },
  { name: 'Ahmedabad', emoji: '🏗️' },
  { name: 'Jaipur', emoji: '🏰' },
  { name: 'Indore', emoji: '🍜' },
];

const FEATURES = [
  {
    icon: TrendingUp,
    title: 'AI Price Prediction',
    desc: 'Get accurate market valuations powered by machine learning before you make an offer.',
    link: '/ai-prediction',
  },
  {
    icon: Users,
    title: 'Flatmate Matcher',
    desc: 'Lifestyle-based matching for diet, sleep schedule, work-from-home and guest preferences.',
    link: '/roommates',
  },
  {
    icon: Building2,
    title: 'Verified PGs & Hostels',
    desc: 'Curated paying guest and hostel listings near colleges and IT parks.',
    link: '/pgs',
  },
  {
    icon: FileText,
    title: 'Rental Toolkit',
    desc: 'Generate professional rental agreements and rent receipts in one click.',
    link: '/rental-toolkit',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('userCity') || 'All Cities';
  });
  const [properties, setProperties] = useState([]);
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('userCity', selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cityParam = selectedCity === 'All Cities' ? '' : selectedCity;
        const [propRes, pgRes] = await Promise.all([
          api.get('/properties', { params: { limit: 6, city: cityParam || undefined } }),
          api.get('/pgs', { params: { limit: 4, city: cityParam || undefined } }),
        ]);
        setProperties(propRes.data?.properties || propRes.data || []);
        setPgs(pgRes.data?.pgs || pgRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCity]);

  const handleSearch = (query) => {
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (selectedCity && selectedCity !== 'All Cities') params.set('city', selectedCity);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="light-page" style={{ minHeight: '100vh' }}>
      {/* New Hero */}
      <EstateXAIHero onSearch={handleSearch} />

      {/* City Selector */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-muted mr-2">Browse by city:</span>
          <button
            onClick={() => setSelectedCity('All Cities')}
            className={`px-4 py-2 rounded-btn text-sm font-medium transition-all ${
              selectedCity === 'All Cities'
                ? 'bg-primary text-white'
                : 'bg-elevated text-muted border border-borderSubtle/20 hover:border-accent/40'
            }`}
          >
            All Cities
          </button>
          {CITIES.map((city) => (
            <button
              key={city.name}
              onClick={() => setSelectedCity(city.name)}
              className={`px-4 py-2 rounded-btn text-sm font-medium transition-all flex items-center gap-1.5 ${
                selectedCity === city.name
                  ? 'bg-primary text-white'
                  : 'bg-elevated text-muted border border-borderSubtle/20 hover:border-accent/40'
              }`}
            >
              <span>{city.emoji}</span>
              {city.name}
            </button>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <p className="text-accent text-xs uppercase tracking-widest font-semibold mb-2">
            Why EstateXAI
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-primary font-medium">
            Everything you need in one place
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((item, i) => (
            <Link
              key={i}
              to={item.link}
              className="bg-elevated border border-borderSubtle/20 rounded-card p-6 hover:border-accent/40 transition-all group"
            >
              <item.icon className="w-7 h-7 text-accent mb-4" />
              <h3 className="font-serif text-lg font-medium text-primary mb-2 group-hover:text-accent transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-accent text-xs uppercase tracking-widest font-semibold mb-2">
              Curated Listings
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-primary font-medium">
              Featured Properties
              {selectedCity !== 'All Cities' && (
                <span className="text-muted text-xl ml-2">in {selectedCity}</span>
              )}
            </h2>
          </div>
          <Link
            to="/properties"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary hover:text-accent transition-colors"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.slice(0, 6).map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted">
            No properties found for this city. Try another city or view all listings.
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/properties"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
          >
            View all properties <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Featured PGs */}
      <section className="bg-elevated/50 border-y border-borderSubtle/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-accent text-xs uppercase tracking-widest font-semibold mb-2">
                For Students & Professionals
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-primary font-medium">
                Popular PGs & Hostels
              </h2>
            </div>
            <Link
              to="/pgs"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary hover:text-accent transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : pgs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {pgs.slice(0, 4).map((pg) => (
                <PGCard key={pg._id} pg={pg} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted">
              No PGs found. Try selecting a different city.
            </div>
          )}
        </div>
      </section>

      {/* AI Teaser */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="bg-primary rounded-card p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-accent text-xs uppercase tracking-widest font-semibold mb-3">
              Powered by Machine Learning
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-white font-medium mb-4">
              Know the real market value before you decide
            </h2>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Our AI model is trained on thousands of real transactions to give you 
              accurate price predictions with confidence intervals.
            </p>
            <Link
              to="/ai-prediction"
              className="inline-flex items-center gap-2 bg-accent text-primary text-sm font-semibold px-5 py-3 rounded-btn hover:bg-white transition-colors"
            >
              Try AI Predictor <Sparkles className="w-4 h-4" />
            </Link>
          </div>
          <div className="hidden md:flex items-center justify-center w-48 h-48 rounded-full bg-white/5 border border-white/10">
            <TrendingUp className="w-16 h-16 text-accent" />
          </div>
        </div>
      </section>

      {/* Trust / CTA */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-primary font-medium mb-4">
            Ready to find your next home?
          </h2>
          <p className="text-muted mb-8">
            Join thousands of renters and owners who trust EstateXAI for verified listings, 
            AI insights and zero brokerage.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/properties"
              className="bg-primary text-white text-sm font-medium px-6 py-3 rounded-btn hover:bg-black transition-all"
            >
              Browse Properties
            </Link>
            <Link
              to="/register"
              className="border border-primary text-primary text-sm font-medium px-6 py-3 rounded-btn hover:bg-primary hover:text-white transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
