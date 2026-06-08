import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, PlusCircle, Trash2, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { getPlaceImage } from '../utils/placeImages';

const Dashboard = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tripImages, setTripImages] = useState({});

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const deleteTrip = async (id, e) => {
        e.preventDefault();
        if (!window.confirm('Are you sure you want to delete this trip?')) return;
        try {
            await api.delete(`/trips/${id}`);
            setTrips(trips.filter(t => t._id !== id));
        } catch {
            alert('Failed to delete trip.');
        }
    };

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const res = await api.get('/trips');
                setTrips(res.data.trips || []);
            } catch {
                setError('Failed to load trips. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
    }, []);

    useEffect(() => {
        const loadTripImages = async () => {
            if (!trips.length) return;

            const imagePairs = await Promise.all(
                trips.map(async (trip) => [trip._id, await getPlaceImage(trip.destination)])
            );
            setTripImages(Object.fromEntries(imagePairs));
        };

        loadTripImages();
    }, [trips]);

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-80px)] bg-[#FAF9F4] flex items-center justify-center">
                <p className="text-[#5C5C5C] font-semibold text-lg animate-pulse">Loading your journeys...</p>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#FAF9F4] pb-20">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1F3EA] border border-[#D5D8CB] text-[#6D8365] text-xs font-extrabold tracking-wide mb-4">
                            ✈️ Stamps Collected: {trips.length}
                        </div>
                        <h1 className="text-4xl font-extrabold text-[#222222] tracking-tight">
                            Your Journeys
                        </h1>
                        <p className="text-[#5C5C5C] mt-2 font-medium text-lg">Hello, {user.name?.split(' ')[0]}. Ready for another adventure?</p>
                    </div>
                    <Link
                        to="/generate"
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-white bg-[#6D8365] hover:bg-[#586A51] transition-colors shadow-sm"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Plan New Trip
                    </Link>
                </div>

                {error ? (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center text-red-600 font-medium">
                        {error}
                    </div>
                ) : trips.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-[#E5E6E1] rounded-[32px] p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                    >
                        <div className="mx-auto w-16 h-16 bg-[#F1F3EA] rounded-full flex items-center justify-center mb-6">
                            <MapPin className="w-8 h-8 text-[#6D8365]" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#222222] mb-3">No trips planned yet</h3>
                        <p className="text-[#5C5C5C] mb-8 max-w-md mx-auto font-medium">
                            Tell us where your heart is wandering, and we'll weave the itinerary for you.
                        </p>
                        <Link
                            to="/generate"
                            className="inline-flex items-center gap-2 px-8 py-3.5 border border-gray-200 bg-white text-[#222222] rounded-full hover:bg-gray-50 transition-colors font-bold shadow-sm"
                        >
                            Start Planning <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.map((trip, index) => (
                            <motion.div
                                key={trip._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    to={`/trips/${trip._id}`}
                                    className="group block bg-white border border-[#E5E6E1] rounded-[24px] overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative h-full flex flex-col"
                                >
                                    <div className="h-40 bg-[#F1F3EA] relative p-6 flex flex-col justify-end">
                                        {tripImages[trip._id] && (
                                            <>
                                                <img
                                                    src={tripImages[trip._id]}
                                                    alt={trip.destination}
                                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                                            </>
                                        )}
                                        <button
                                            onClick={(e) => deleteTrip(trip._id, e)}
                                            className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-red-50 hover:text-red-500 text-gray-500 rounded-full transition-colors z-10 opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <h3 className="text-2xl font-extrabold text-white leading-tight truncate relative z-10 drop-shadow-sm">
                                            {trip.destination}
                                        </h3>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col space-y-4 bg-white z-10">
                                        <div className="flex items-center justify-between text-sm font-bold text-[#5C5C5C]">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 text-[#6D8365]" />
                                                {trip.days} Days
                                            </div>
                                            <div className="capitalize flex items-center gap-1.5 px-3 py-1 bg-[#FAF9F4] rounded-md border border-[#E5E6E1]">
                                                {trip.budget}
                                            </div>
                                        </div>
                                        <p className="text-[13px] font-semibold text-gray-400 tracking-wide truncate">
                                            {trip.interests ? String(trip.interests) : "Explore"}
                                        </p>
                                        <div className="mt-auto pt-6 flex items-center justify-between text-sm font-bold text-gray-400 group-hover:text-[#6D8365] transition-colors">
                                            <span>View Itinerary</span>
                                            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
export default Dashboard;
