import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowUpRight, Search, Building2,
  TrendingUp, ShieldCheck, Users, FileText
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export default function EstateXAIHero({ onSearch }) {
  return (
    <section className="bg-surface text-black font-sans selection:bg-accent selection:text-white overflow-hidden">
      <motion.div 
        className="max-w-7xl mx-auto px-6 lg:px-8 pt-14 pb-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Editorial Copy */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            <motion.div variants={itemVariants} className="flex items-center gap-2 text-accent text-xs uppercase tracking-widest font-semibold">
              <span className="h-[1px] w-6 bg-accent" />
              <span>AI-Powered Real Estate Platform</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="font-serif text-5xl md:text-6xl lg:text-[78px] leading-[1.05] tracking-[-1.5px] text-primary font-medium">
              Find your <span className="italic text-accent">perfect</span> home with intelligence.
            </motion.h1>

            <motion.p variants={itemVariants} className="text-base text-muted max-w-xl leading-relaxed">
              Properties, PGs, and lifestyle-matched flatmates across 10+ Indian cities. 
              Zero brokerage. Verified listings. AI price predictions.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              variants={itemVariants}
              onSubmit={(e) => {
                e.preventDefault();
                const q = e.target.search.value;
                if (onSearch) onSearch(q);
              }}
              className="w-full max-w-xl mt-2 p-2 bg-elevated border border-borderSubtle/20 rounded-card flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow duration-300 focus-within:border-accent/40 focus-within:shadow-md"
            >
              <div className="pl-3 text-muted">
                <Search className="w-5 h-5 text-accent" />
              </div>
              <input
                name="search"
                type="text"
                placeholder="Search by city, locality or property type..."
                className="w-full bg-transparent text-sm text-primary placeholder:text-muted/60 focus:outline-none py-2"
              />
              <button
                type="submit"
                className="bg-primary text-white text-xs font-semibold px-5 py-3 rounded-btn flex items-center gap-1.5 hover:bg-black transition-colors whitespace-nowrap shadow-sm hover:shadow-lg hover:-translate-y-0.5 duration-300"
              >
                Search <Sparkles className="w-3.5 h-3.5 text-accent" />
              </button>
            </motion.form>

            {/* Quick Metrics */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-6 pt-6 border-t border-borderSubtle/15 w-full max-w-xl">
              <div>
                <p className="font-serif text-2xl md:text-3xl font-medium text-primary">10+</p>
                <p className="text-xs text-muted mt-1 uppercase tracking-wider font-medium">Cities</p>
              </div>
              <div>
                <p className="font-serif text-2xl md:text-3xl font-medium text-primary">Zero</p>
                <p className="text-xs text-muted mt-1 uppercase tracking-wider font-medium">Brokerage</p>
              </div>
              <div>
                <p className="font-serif text-2xl md:text-3xl font-medium text-primary flex items-center gap-1">AI <Sparkles className="w-5 h-5 text-accent" /></p>
                <p className="text-xs text-muted mt-1 uppercase tracking-wider font-medium">Price Engine</p>
              </div>
            </motion.div>
          </div>

          {/* Right Feature Cards */}
          <motion.div variants={itemVariants} className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/ai-prediction"
              className="bg-elevated border border-borderSubtle/20 rounded-card p-5 hover:border-accent/40 transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-serif text-lg font-medium text-primary mb-1">AI Valuation</h3>
              <p className="text-xs text-muted leading-relaxed">Get accurate price predictions powered by machine learning.</p>
            </Link>

            <Link
              to="/roommates"
              className="bg-elevated border border-borderSubtle/20 rounded-card p-5 hover:border-accent/40 transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-serif text-lg font-medium text-primary mb-1">Flatmate Matcher</h3>
              <p className="text-xs text-muted leading-relaxed">Lifestyle-matched roommates based on preferences.</p>
            </Link>

            <Link
              to="/pgs"
              className="bg-elevated border border-borderSubtle/20 rounded-card p-5 hover:border-accent/40 transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5"
            >
               <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-serif text-lg font-medium text-primary mb-1">PG & Hostels</h3>
              <p className="text-xs text-muted leading-relaxed">Verified paying guests and hostels near colleges & offices.</p>
            </Link>

            <Link
              to="/rental-toolkit"
              className="bg-elevated border border-borderSubtle/20 rounded-card p-5 hover:border-accent/40 transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5"
            >
               <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-serif text-lg font-medium text-primary mb-1">Rental Toolkit</h3>
              <p className="text-xs text-muted leading-relaxed">Generate agreements & rent receipts in one click.</p>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
