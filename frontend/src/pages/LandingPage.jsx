import { Search, ArrowRight, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPlaceImage } from '../utils/placeImages';

const destinations = [
    { city: 'Kyoto', country: 'Japan', tag: 'CHERRY BLOSSOM', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop' },
    { city: 'Lisbon', country: 'Portugal', tag: 'GOLDEN HOUR', img: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&auto=format&fit=crop' },
    { city: 'Lofoten', country: 'Norway', tag: 'MIDNIGHT SUN', img: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&auto=format&fit=crop' },
    { city: 'Maldives', country: 'Indian Ocean', tag: 'ISLAND ESCAPE', img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&auto=format&fit=crop' },
];

const DestinationCard = ({ city, country, tag, img }) => {
    return (
        <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative flex-shrink-0 w-[160px] sm:w-[200px] md:w-[230px] h-[240px] sm:h-[280px] md:h-[310px] rounded-[24px] overflow-hidden group cursor-pointer shadow-md"
        >
            <img src={img} alt={city} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
            <div className="absolute bottom-5 left-5">
                <span className="text-[8px] sm:text-[9px] font-extrabold tracking-[0.22em] text-white/60 uppercase mb-1.5 block">{tag}</span>
                <h3 className="text-[18px] sm:text-[22px] font-bold text-white mb-0.5 leading-tight">{city}</h3>
                <p className="text-white/55 text-[12px] sm:text-[13px] font-medium">{country}</p>
            </div>
        </motion.div>
    );
};

const LandingPage = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen font-sans flex flex-col relative w-full overflow-hidden"
            style={{ backgroundColor: '#FAF9F4' }}>

            {/* Map Background Placeholder */}
            <div
                className="absolute inset-0 z-0 opacity-30 pointer-events-none bg-no-repeat bg-center bg-cover"
                style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg")' }}
            >
                <div className="absolute inset-0 bg-[#FAF9F4]/80"></div>
            </div>

            {/* Decorative dashed arcs */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-30" xmlns="http://www.w3.org/2000/svg">
                <path d="M 10%,50% Q 30%,20% 60%,50%" fill="none" stroke="#6D8365" strokeWidth="1.5" strokeDasharray="6,6" />
                <path d="M 40%,60% Q 70%,30% 100%,40%" fill="none" stroke="#6D8365" strokeWidth="1.5" strokeDasharray="6,6" />
            </svg>

            {/* Navbar */}
            <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-extrabold text-[20px] sm:text-[22px] text-[#222222] tracking-tight cursor-pointer">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#6D8365]">
                            <path d="M12 2L2 22l10-4 10 4L12 2z"></path>
                        </svg>
                        Wanderly
                    </div>
                    {/* Desktop sign-in */}
                    <div className="hidden sm:block">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-bold hover:bg-gray-50 transition-colors text-gray-800 shadow-sm"
                        >
                            Sign in
                        </button>
                    </div>
                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileMenuOpen(o => !o)}
                        className="sm:hidden p-2 rounded-xl border border-[#E5E6E1] bg-white text-[#222] shadow-sm"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile dropdown */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="sm:hidden mt-3 bg-white rounded-2xl border border-[#E5E6E1] shadow-md p-4 flex flex-col gap-2"
                        >
                            <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                                className="w-full py-2.5 px-4 text-[#222] font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors text-left">
                                Sign in
                            </button>
                            <button onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                                className="w-full py-2.5 px-4 bg-[#6D8365] text-white font-bold text-sm rounded-xl hover:bg-[#586A51] transition-colors">
                                Sign up free
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Main Hero Content */}
            <main className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 text-center mt-8 sm:mt-20 mb-16 sm:mb-32">
                <div className="mb-6 sm:mb-8 flex items-center gap-2">
                    <div className="inline-block px-3 sm:px-4 py-1.5 rounded-full border border-[#D5D8CB] bg-[#F1F3EA] text-[10px] sm:text-[11px] font-extrabold tracking-[0.18em] sm:tracking-[0.2em] text-[#6D8365] uppercase">
                        <span className="inline-block w-1.5 h-1.5 bg-[#6D8365] rounded-full mr-2 mb-[1px]"></span>
                        AI-POWERED ITINERARIES IN SECONDS
                    </div>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-7xl font-[800] tracking-tight text-[#222222] max-w-4xl leading-[1.05] mb-5 sm:mb-6 px-2">
                    Plan the trip of{' '}
                    <br className="hidden sm:block" />
                    your <span className="text-[#222222] relative inline-block">
                        daydreams<span className="text-[#222222]">.</span>
                        <span className="absolute bottom-1 left-0 w-full h-[5px] sm:h-[6px] bg-[#6D8365]/30"></span>
                    </span>
                </h1>

                <p className="text-[15px] sm:text-[17px] md:text-[20px] text-[#5C5C5C] max-w-xl sm:max-w-2xl mx-auto font-medium leading-relaxed mb-8 sm:mb-12 px-2">
                    Tell us where your heart is wandering. Our gentle AI will weave together flights, trains and tiny moments into a journey just for you.
                </p>

                {/* Search Bar — stack on mobile, inline on sm+ */}
                <div className="w-full max-w-3xl px-2 sm:px-0 mb-8 sm:mb-10">
                    <div className="bg-white rounded-2xl sm:rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center border border-gray-100 gap-2 sm:gap-0">
                        <div className="flex items-center flex-1">
                            <div className="pl-3 sm:pl-4 pr-3">
                                <Search className="text-gray-400" size={22} strokeWidth={2.5} />
                            </div>
                            <input
                                type="text"
                                className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-base sm:text-lg py-2 sm:py-3 font-medium min-w-0"
                                placeholder="Kyoto in cherry blossom season..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { if (query.trim()) navigate('/generate?q=' + encodeURIComponent(query)); else navigate('/generate'); } }}
                            />
                        </div>
                        <button
                            onClick={() => {
                                if (query.trim()) navigate('/generate?q=' + encodeURIComponent(query));
                                else navigate('/generate');
                            }}
                            className="bg-[#6D8365] hover:bg-[#586A51] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-full text-[14px] sm:text-[15px] font-bold transition-colors shadow-sm"
                        >
                            Plan my trip
                        </button>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-3xl px-2">
                    {["Paris weekends", "Island hopping", "Slow trains in Europe", "Cherry blossoms"].map((tag) => (
                        <button
                            key={tag}
                            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-full text-[13px] sm:text-[14px] font-bold text-[#5C5C5C] transition-colors shadow-sm"
                            onClick={() => setQuery(tag)}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </main>

            {/* ── Trending Destinations ── */}
            <section className="relative z-10 pb-16 sm:pb-24 w-full">
                <div className="max-w-3xl mx-auto px-4 mb-7 sm:mb-9 text-center">
                    <span className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.28em] text-[#C2723A] uppercase block mb-2">
                        Trending right now
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#222222] tracking-tight">
                        Where wanderers are{' '}
                        <span className="italic font-serif font-light text-[#6D8365]">drifting</span>
                    </h2>
                </div>
                <div className="flex justify-start sm:justify-center gap-4 sm:gap-5 overflow-x-auto pb-4 px-4 sm:px-6 no-scrollbar">
                    {destinations.map(d => <DestinationCard key={d.city} {...d} />)}
                </div>
            </section>

            {/* Testimonial Section */}
            <section className="relative z-10 py-16 sm:py-32 bg-white/50 border-y border-gray-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <span className="text-3xl sm:text-4xl text-[#6D8365] font-serif mb-6 sm:mb-8 block opacity-40">"</span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#222222] leading-tight mb-8 sm:mb-12">
                        It planned a ten-day Japan trip in <span className="italic font-serif font-light text-[#6D8365]">under a minute</span>—and somehow knew I'd love the tiny jazz bar in Shimokitazawa.
                    </h2>
                    <div className="flex flex-col items-center">
                        <img src="https://i.pravatar.cc/150?u=mira" alt="Mira" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full mb-4 border-2 border-white shadow-md" />
                        <p className="font-bold text-[#222]">Mira Okafor</p>
                        <p className="text-sm text-[#5C5C5C] font-medium tracking-wide">— slow traveler</p>
                    </div>
                </div>
            </section>

            {/* Elegant Footer */}
            <footer className="relative z-10 py-8 sm:py-12 px-4 sm:px-10 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row justify-between items-center pt-6 sm:pt-8 border-t border-gray-200/60 gap-3 sm:gap-6 text-center sm:text-left">
                    <p className="text-[13px] sm:text-[14px] text-gray-500 font-medium">
                        © 2026 Wanderly. Wander gently.
                    </p>
                    <p className="text-[13px] sm:text-[14px] italic font-serif text-gray-400">
                        Made for daydreamers, everywhere.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
