import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Tag, Utensils, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { getPlaceImage } from '../utils/placeImages';

const formatRupee = (v) => {
    if (!v) return '';
    const raw = String(v).trim();
    if (raw.includes('₹') || /rupees?/i.test(raw) || /\binr\b/i.test(raw)) return raw;
    return `₹${raw.replace(/\$/g, '').trim()}`;
};

const PublicTrip = () => {
    const { shareId } = useParams();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [heroImage, setHeroImage] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get(`/public/trips/${shareId}`);
                const tripData = res.data.trip;
                setTrip(tripData);
                const img = await getPlaceImage(tripData.destination);
                setHeroImage(img);
            } catch {
                setError('This shared trip was not found or the link has been revoked.');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [shareId]);

    if (loading) return (
        <div className="min-h-screen bg-[#FAF9F4] flex items-center justify-center">
            <p className="text-[#5C5C5C] font-semibold text-lg animate-pulse">Loading shared trip…</p>
        </div>
    );

    if (error || !trip) return (
        <div className="min-h-screen bg-[#FAF9F4] flex flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-xl font-bold text-[#222]">🔒 Trip not found</p>
            <p className="text-[#666]">{error}</p>
            <Link to="/" className="px-6 py-3 bg-[#6D8365] text-white rounded-full font-semibold">Go to Wanderlust</Link>
        </div>
    );

    const { destination, budget, days, itinerary } = trip;
    const { summary, estimatedCost, travelTips, days: itineraryDays } = itinerary || {};

    return (
        <div className="min-h-screen bg-[#FAF9F4] pb-24 overflow-x-hidden">
            {/* Shared badge */}
            <div className="sticky top-0 z-30 bg-[#6D8365]/95 backdrop-blur-md px-6 py-2.5 flex items-center justify-between shadow-sm">
                <span className="text-white font-bold text-[14px]">🌍 Wanderlust — Shared Itinerary</span>
                <Link to="/register" className="text-[12.5px] font-bold text-white/80 hover:text-white underline-offset-2 hover:underline transition">
                    Create your own trip →
                </Link>
            </div>

            {heroImage && (
                <div className="w-full h-[400px] sm:h-[500px] relative">
                    <img src={heroImage} alt={destination} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F4] via-[#FAF9F4]/40 to-transparent" />
                </div>
            )}

            <div className={`max-w-5xl mx-auto px-6 relative z-10 ${heroImage ? '-mt-44' : 'pt-10'}`}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[32px] p-8 sm:p-12 mb-10 border border-[#E5E6E1] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-[#222] tracking-tight mb-4">
                        Trip to <span className="text-[#6D8365]">{destination}</span>
                    </h1>
                    <p className="text-xl text-[#5C5C5C] font-medium leading-relaxed mb-8 max-w-3xl">
                        {summary || `A ${days}-day ${budget} journey.`}
                    </p>
                    <div className="flex flex-wrap gap-4 font-bold">
                        <div className="px-6 py-3 bg-[#F1F3EA] text-[#6D8365] rounded-full flex items-center gap-2">
                            <Clock className="w-5 h-5" /> {days} Days
                        </div>
                        <div className="px-6 py-3 bg-[#F1F3EA] text-[#6D8365] rounded-full flex items-center gap-2 capitalize">
                            <Tag className="w-5 h-5" /> {budget}
                        </div>
                        {estimatedCost && (
                            <div className="px-6 py-3 bg-gray-50 text-gray-700 border border-gray-200 rounded-full">
                                Est. {formatRupee(estimatedCost)}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Days */}
                <div className="space-y-6">
                    {itineraryDays && itineraryDays.map((day, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.06 }}
                            className="bg-white border border-[#E5E6E1] rounded-[28px] p-6 sm:p-8 shadow-sm">
                            <h2 className="text-2xl font-extrabold text-[#222] mb-5">
                                Day {day.day}
                                <span className="opacity-30 px-2 font-normal">|</span>
                                <span className="text-[#6D8365] font-bold text-[17px]">{day.dateDescription}</span>
                            </h2>
                            <div className="relative border-l-[3px] border-[#E5E6E1] ml-4 pb-1 pt-1">
                                {(day.activities || []).map((act, i) => (
                                    <div key={i} className="relative pl-9 pb-5 last:pb-0">
                                        <div className="absolute -left-[10.5px] top-1.5 w-[18px] h-[18px] bg-white border-[4px] border-[#6D8365] rounded-full shadow-sm" />
                                        <div className="bg-[#FAF9F4] rounded-2xl p-5 border border-[#E5E6E1]">
                                            <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                                                <h3 className="text-xl font-bold text-[#222]">{act.time}</h3>
                                                {act.cost && (
                                                    <span className="text-[12.5px] font-bold text-[#6D8365] bg-white px-3 py-1 rounded-lg shadow-sm border border-gray-100 break-words max-w-[55%] text-right leading-snug">
                                                        {formatRupee(act.cost)}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[#5C5C5C] font-medium leading-relaxed text-[15px]">{act.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {day.foodSuggestions && day.foodSuggestions.length > 0 && (
                                <div className="mt-6 pt-5 border-t border-[#E5E6E1]">
                                    <h4 className="flex items-center gap-2 font-extrabold text-[#222] text-lg mb-3">
                                        <Utensils className="w-4 h-4 text-[#6D8365]" /> Dining
                                    </h4>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                        {day.foodSuggestions.map((food, fi) => (
                                            <div key={fi} className="bg-[#F1F3EA] p-4 rounded-xl border border-[#D5D8CB] flex flex-col gap-2">
                                                <span className="font-extrabold uppercase tracking-wide text-[11.5px] text-[#222]">{food.meal}</span>
                                                <p className="text-[#5C5C5C] font-medium text-[13.5px] leading-snug break-words">{food.place || food.description}</p>
                                                {food.cost && (
                                                    <span className="self-start text-[12px] font-bold text-[#6D8365] bg-white px-3 py-1 rounded-lg shadow-sm border border-gray-100">
                                                        {formatRupee(food.cost)}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {travelTips && travelTips.length > 0 && (
                        <div className="w-full bg-[#F1F3EA] border border-[#D5D8CB] rounded-[32px] p-8 sm:p-12 shadow-sm">
                            <h3 className="flex items-center gap-3 text-2xl font-extrabold text-[#222] mb-8">
                                <Info className="text-[#6D8365] w-7 h-7" /> Travel Tips
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                {travelTips.map((tip, i) => (
                                    <div key={i} className="flex gap-4 text-[16px] font-semibold text-[#5C5C5C]">
                                        <span className="text-[#6D8365] shrink-0 font-extrabold text-2xl leading-none">•</span>
                                        <span className="leading-relaxed">{tip}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div className="mt-12 text-center">
                    <p className="text-[#666] mb-4 font-medium">Want to plan your own AI-powered trip?</p>
                    <Link to="/register"
                        className="inline-flex px-8 py-4 bg-[#6D8365] text-white font-bold rounded-full hover:bg-[#586A51] transition-colors shadow-lg">
                        Start Planning with Wanderlust →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PublicTrip;
