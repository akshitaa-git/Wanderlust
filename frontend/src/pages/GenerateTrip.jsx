import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';

const GenerateTrip = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const landingQuery = searchParams.get('q') || '';
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        destination: landingQuery,
        budget: 'moderate',
        days: 3,
        interests: ''
    });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/trips', form);
            navigate(`/trips/${res.data._id || res.data.trip?._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate trip. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#FAF9F4] flex flex-col items-center pt-12 pb-24 px-4 overflow-hidden relative">
            {/* Background Map Placeholder like Landing */}
            <div
                className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-no-repeat bg-center bg-cover"
                style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg")' }}
            >
                <div className="absolute inset-0 bg-[#FAF9F4]/80"></div>
            </div>

            <div className="text-center mb-10 max-w-2xl px-4 relative z-10">
                <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-[#D5D8CB] bg-[#F1F3EA] text-[11px] font-extrabold tracking-[0.2em] text-[#6D8365] uppercase mb-6 shadow-sm">
                    <span className="inline-block w-1.5 h-1.5 bg-[#6D8365] rounded-full mr-2 mb-[1px]"></span>
                    NEW JOURNEY
                </div>
                <h1 className="text-4xl sm:text-5xl font-[800] tracking-tight text-[#222222] leading-[1.1] mb-4">
                    Tell us where your heart is <br />
                    <span className="text-[#222222] relative inline-block mt-2">
                        wandering
                        <span className="absolute bottom-1 left-0 w-full h-[6px] bg-[#6D8365]/30"></span>
                    </span>.
                </h1>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-white border border-[#E5E6E1] shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[32px] p-8 sm:p-12 relative z-10"
            >
                {error && (
                    <div className="mb-8 p-4 bg-[#C84B31]/10 border border-[#C84B31]/20 text-[#C84B31] font-semibold text-sm rounded-xl text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[15px] font-bold text-[#222222] mb-2 pl-1">
                                Destination
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-[15px]">
                                    <MapPin className="text-gray-400" size={20} />
                                </div>
                                <input
                                    type="text" name="destination" required
                                    placeholder="Kyoto, Japan / Paris, France"
                                    className="w-full bg-[#FAF9F4] border border-[#E5E6E1] rounded-2xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-[#6D8365]/30 focus:border-[#6D8365] outline-none text-[#222222] text-lg font-medium placeholder-gray-400 transition-all"
                                    value={form.destination} onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[15px] font-bold text-[#222222] mb-2 pl-1">
                                    Duration (Days)
                                </label>
                                <input
                                    type="number" name="days" min="1" max="30" required
                                    className="w-full bg-[#FAF9F4] border border-[#E5E6E1] rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#6D8365]/30 focus:border-[#6D8365] outline-none text-[#222222] text-lg font-medium transition-all"
                                    value={form.days} onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-[15px] font-bold text-[#222222] mb-2 pl-1">
                                    Budget
                                </label>
                                <select
                                    name="budget"
                                    className="w-full bg-[#FAF9F4] border border-[#E5E6E1] rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#6D8365]/30 focus:border-[#6D8365] outline-none text-[#222222] text-lg font-medium appearance-none transition-all"
                                    value={form.budget} onChange={handleChange}
                                >
                                    <option value="cheap">Backpacker (Cheap)</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="luxury">Luxury</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[15px] font-bold text-[#222222] mb-2 pl-1">
                                Vibes & Interests
                                <span className="text-gray-400 font-medium ml-2 font-normal text-sm">(e.g. food, hiking, temples)</span>
                            </label>
                            <input
                                type="text" name="interests" required
                                placeholder="What kind of experiences do you want?"
                                className="w-full bg-[#FAF9F4] border border-[#E5E6E1] rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#6D8365]/30 focus:border-[#6D8365] outline-none text-[#222222] text-lg font-medium placeholder-gray-400 transition-all"
                                value={form.interests} onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full mt-4 flex items-center justify-center gap-3 bg-[#6D8365] hover:bg-[#586A51] text-white py-4 px-6 rounded-full font-bold text-lg transition-colors disabled:opacity-70 shadow-sm"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin text-white" />
                                Weaving your itinerary...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-6 h-6 text-[#E1F3DB]" />
                                Plan my trip
                            </>
                        )}
                    </button>
                    {!loading && <p className="text-center text-sm font-medium text-gray-400 mt-3">Takes about 5-15 seconds.</p>}
                </form>
            </motion.div>
        </div>
    );
};
export default GenerateTrip;
