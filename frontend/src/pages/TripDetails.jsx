import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, Clock, Tag, Utensils, Info,
    Send, Sparkles, RefreshCw, Bot, User as UserIcon, X, MessageCircle,
    MapPin, ImageOff, Download, Share2, Check, Cloud, Thermometer, Wind
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import api from '../api/axios';
import { getPlaceImage } from '../utils/placeImages';
import { geocode } from '../utils/geocode';

// Fix leaflet default icons (Vite/webpack path issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* ─── Helpers ───────────────────────────────────────────────── */
const formatRupee = (v) => {
    if (!v) return '';
    const raw = String(v).trim();
    if (raw.includes('₹') || /rupees?/i.test(raw) || /\binr\b/i.test(raw)) return raw;
    return `₹${raw.replace(/\$/g, '').trim()}`;
};

const SUGGESTIONS = [
    'Make day 1 vegetarian 🥗',
    'Add a museum visit 🏛️',
    'Suggest cheaper hotels 🏨',
    'What should I pack? 🎒',
    'Best local street food? 🍜',
];

/* ─── Map fit-bounds helper ─────────────────────────────────── */
const FitBounds = ({ markers }) => {
    const map = useMap();
    useEffect(() => {
        if (markers.length > 1) {
            const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
            map.fitBounds(bounds, { padding: [40, 40] });
        } else if (markers.length === 1) {
            map.setView([markers[0].lat, markers[0].lng], 12);
        }
    }, [markers, map]);
    return null;
};

/* ─── Interactive Map ───────────────────────────────────────── */
const TripMap = ({ destination, itinerary }) => {
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMarkers = async () => {
            setLoading(true);
            const places = new Set([destination]);

            (itinerary?.days || []).forEach(day => {
                (day.activities || []).forEach(act => {
                    const place = act.place || act.location;
                    if (place) places.add(place);
                });
            });

            // Geocode up to 8 places to avoid rate-limiting Nominatim
            const limited = Array.from(places).slice(0, 8);
            const results = await Promise.all(
                limited.map(async (p) => {
                    const geo = await geocode(p);
                    return geo ? { ...geo, name: p } : null;
                })
            );
            setMarkers(results.filter(Boolean));
            setLoading(false);
        };
        fetchMarkers();
    }, [destination, itinerary]);

    if (loading) return (
        <div className="w-full h-[380px] bg-[#E5E6E1] animate-pulse rounded-[24px] flex items-center justify-center">
            <p className="text-[#888] font-semibold text-sm">Loading map…</p>
        </div>
    );

    const center = markers[0] ? [markers[0].lat, markers[0].lng] : [20, 0];

    return (
        <MapContainer center={center} zoom={10} scrollWheelZoom={false}
            style={{ height: '380px', width: '100%', borderRadius: '24px', zIndex: 0 }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            />
            {markers.map((m, i) => (
                <Marker key={i} position={[m.lat, m.lng]}>
                    <Popup>
                        <span className="font-bold text-[13px]">{m.name}</span>
                    </Popup>
                </Marker>
            ))}
            {markers.length > 0 && <FitBounds markers={markers} />}
        </MapContainer>
    );
};

/* ─── Weather Widget ────────────────────────────────────────── */
const WeatherWidget = ({ destination }) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const res = await fetch(
                    `https://wttr.in/${encodeURIComponent(destination)}?format=j1`
                );
                const data = await res.json();
                const curr = data.current_condition?.[0];
                if (curr) {
                    setWeather({
                        temp: curr.temp_C,
                        feels: curr.FeelsLikeC,
                        desc: curr.weatherDesc?.[0]?.value || '',
                        humidity: curr.humidity,
                        wind: curr.windspeedKmph,
                    });
                }
            } catch {
                // Weather unavailable
            } finally {
                setLoading(false);
            }
        };
        fetchWeather();
    }, [destination]);

    if (loading) return (
        <div className="h-[90px] bg-[#E5E6E1] animate-pulse rounded-2xl" />
    );

    if (!weather) return null;

    const emoji = weather.desc.toLowerCase().includes('sun') ? '☀️'
        : weather.desc.toLowerCase().includes('cloud') ? '⛅'
            : weather.desc.toLowerCase().includes('rain') ? '🌧️'
                : weather.desc.toLowerCase().includes('snow') ? '❄️'
                    : '🌤️';

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-sky-50 to-blue-100 border border-blue-200 rounded-2xl px-5 py-4 flex items-center gap-5 flex-wrap">
            <div className="text-4xl leading-none">{emoji}</div>
            <div className="flex-1 min-w-0">
                <p className="font-extrabold text-[#1e3a5f] text-[15px]">{weather.desc}</p>
                <p className="text-[13px] text-[#3a6186] font-medium">
                    Current weather in {destination}
                </p>
            </div>
            <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-[#1e3a5f]">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    <span className="font-extrabold text-[15px]">{weather.temp}°C</span>
                    <span className="text-[12px] text-[#3a6186]">feels {weather.feels}°C</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#1e3a5f]">
                    <Wind className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-[13px]">{weather.wind} km/h</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#1e3a5f]">
                    <Cloud className="w-4 h-4 text-sky-400" />
                    <span className="font-bold text-[13px]">{weather.humidity}% humidity</span>
                </div>
            </div>
        </motion.div>
    );
};

/* ─── Destination Gallery ───────────────────────────────────── */
const DestinationGallery = ({ highlights, destination }) => {
    const [images, setImages] = useState([]);
    const [loadingImgs, setLoadingImgs] = useState(true);

    useEffect(() => {
        if (!highlights || highlights.length === 0) { setLoadingImgs(false); return; }
        const fetch = async () => {
            setLoadingImgs(true);
            const results = await Promise.all(
                highlights.map(async (place) => ({ place, url: await getPlaceImage(place) }))
            );
            setImages(results.filter(r => r.url));
            setLoadingImgs(false);
        };
        fetch();
    }, [highlights]);

    if (loadingImgs) return (
        <div className="mb-10">
            <div className="h-6 w-48 bg-[#E5E6E1] rounded-full animate-pulse mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(i => <div key={i} className="rounded-2xl bg-[#E5E6E1] animate-pulse" style={{ aspectRatio: '4/3' }} />)}
            </div>
        </div>
    );
    if (images.length === 0) return null;

    return (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-[#222] mb-4">
                <MapPin className="w-5 h-5 text-[#6D8365]" />
                Highlights of <span className="text-[#6D8365]">&nbsp;{destination}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map(({ place, url }, idx) => (
                    <motion.div key={place} initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.12 + idx * 0.07 }}
                        className="relative overflow-hidden rounded-2xl shadow-md group" style={{ aspectRatio: '4/3' }}>
                        {url
                            ? <img src={url} alt={place} crossOrigin="anonymous" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={e => e.currentTarget.parentNode.classList.add('hidden')} />
                            : <div className="w-full h-full bg-[#E5E6E1] flex items-center justify-center"><ImageOff className="w-8 h-8 text-[#aaa]" /></div>
                        }
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                        <p className="absolute bottom-0 left-0 right-0 px-3 py-2.5 text-white text-[12px] font-bold leading-snug">{place}</p>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
};

/* ─── Chat Bubble ───────────────────────────────────────────── */
const ChatBubble = ({ msg }) => {
    const isUser = msg.role === 'user';
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center shadow text-white ${isUser ? 'bg-[#6D8365]' : 'bg-[#2a2a2a]'}`}>
                {isUser ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed font-medium shadow-sm
                ${isUser ? 'bg-[#6D8365] text-white rounded-tr-sm'
                    : msg.isUpdate ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-tl-sm'
                        : 'bg-white text-[#333] border border-[#E5E6E1] rounded-tl-sm'}`}>
                {msg.isUpdate && (
                    <p className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-600 mb-1 uppercase tracking-wide">
                        <RefreshCw className="w-2.5 h-2.5" /> Itinerary Updated
                    </p>
                )}
                {msg.content}
            </div>
        </motion.div>
    );
};

/* ─── Floating Chat Widget ──────────────────────────────────── */
const ChatWidget = ({ tripId, destination, onItineraryUpdate }) => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([{
        role: 'model',
        content: `Hi! I'm your AI travel assistant ✈️ Ask me anything about your trip to ${destination}, or say "Make day 1 vegetarian" to live-update your itinerary!`
    }]);
    const [inputVal, setInputVal] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [unread, setUnread] = useState(0);
    const chatBottomRef = useRef(null);

    useEffect(() => {
        if (open) { setUnread(0); setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80); }
    }, [open]);
    useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, chatLoading]);

    const sendMessage = async (text) => {
        const msg = (text || inputVal).trim();
        if (!msg || chatLoading) return;
        setInputVal('');
        setMessages(prev => [...prev, { role: 'user', content: msg }]);
        setChatLoading(true);
        try {
            const history = messages.slice(1).map(m => ({ role: m.role, content: m.content }));
            const res = await api.post(`/trips/${tripId}/chat`, { message: msg, history });
            if (res.data.type === 'itinerary') {
                onItineraryUpdate(res.data.data);
                setMessages(prev => [...prev, { role: 'model', content: 'Done! Your itinerary has been updated. Scroll up to see the changes.', isUpdate: true }]);
                if (!open) setUnread(u => u + 1);
            } else {
                setMessages(prev => [...prev, { role: 'model', content: res.data.data }]);
                if (!open) setUnread(u => u + 1);
            }
        } catch {
            setMessages(prev => [...prev, { role: 'model', content: 'Sorry, something went wrong. Please try again.' }]);
        } finally { setChatLoading(false); }
    };

    const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

    return (
        <>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, y: 24, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.95 }} transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                        className="fixed bottom-24 right-6 z-50 w-[360px] flex flex-col bg-white rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-[#E5E6E1] overflow-hidden"
                        style={{ height: '540px' }}>
                        <div className="px-5 py-4 border-b border-[#E5E6E1] flex items-center gap-3 bg-gradient-to-r from-[#6D8365] to-[#586A51]">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-extrabold text-[14.5px] text-white">AI Trip Assistant</p>
                                <p className="text-[11.5px] text-white/70">Ask anything · update your itinerary</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="shrink-0 w-7 h-7 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors">
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">
                            {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
                            {chatLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-[#2a2a2a] flex items-center justify-center shrink-0"><Bot className="w-3.5 h-3.5 text-white" /></div>
                                    <div className="bg-white border border-[#E5E6E1] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                        <div className="flex gap-1 items-center h-3.5">
                                            {[0, 1, 2].map(i => <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} className="w-1.5 h-1.5 rounded-full bg-[#bbb]" />)}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={chatBottomRef} />
                        </div>
                        {messages.length <= 2 && (
                            <div className="px-4 pb-2">
                                <p className="text-[10.5px] font-bold text-[#bbb] uppercase tracking-wide mb-1.5">Try asking</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {SUGGESTIONS.map(s => (
                                        <button key={s} onClick={() => sendMessage(s)} disabled={chatLoading}
                                            className="text-[11.5px] font-semibold text-[#6D8365] bg-[#F1F3EA] px-2.5 py-1 rounded-full border border-[#D5D8CB] hover:bg-[#e5e8dc] transition-colors disabled:opacity-50">{s}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="px-4 pb-4 pt-2 border-t border-[#E5E6E1] bg-[#FAFAFA]">
                            <div className="flex items-end gap-2 bg-white border border-[#E0E0E0] rounded-2xl px-3.5 py-2.5 shadow-sm focus-within:border-[#6D8365] transition-colors">
                                <textarea rows={1} value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={handleKey}
                                    placeholder="Ask anything or request changes…" disabled={chatLoading}
                                    className="flex-1 resize-none bg-transparent outline-none text-[13.5px] text-[#333] font-medium placeholder:text-[#bbb] disabled:opacity-60 leading-snug max-h-24"
                                    style={{ overflowY: 'auto' }} />
                                <button onClick={() => sendMessage()} disabled={!inputVal.trim() || chatLoading}
                                    className="shrink-0 w-8 h-8 bg-[#6D8365] rounded-xl flex items-center justify-center text-white hover:bg-[#586A51] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} onClick={() => setOpen(o => !o)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#6D8365] hover:bg-[#586A51] text-white rounded-full shadow-[0_8px_30px_rgba(109,131,101,0.5)] flex items-center justify-center transition-colors"
                aria-label="Open AI Chat">
                <AnimatePresence mode="wait">
                    {open
                        ? <motion.div key="c" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}><X className="w-6 h-6" /></motion.div>
                        : <motion.div key="o" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}><MessageCircle className="w-6 h-6" /></motion.div>
                    }
                </AnimatePresence>
                <AnimatePresence>
                    {!open && unread > 0 && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">{unread}</motion.span>
                    )}
                </AnimatePresence>
            </motion.button>
        </>
    );
};

/* ─── Main Page ─────────────────────────────────────────────── */
const TripDetails = () => {
    const { id } = useParams();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [heroImage, setHeroImage] = useState('');

    // Share state
    const [shareLoading, setShareLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // PDF state
    const [pdfLoading, setPdfLoading] = useState(false);
    const itineraryRef = useRef(null);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const res = await api.get(`/trips/${id}`);
                const tripData = res.data.trip || res.data;
                setTrip(tripData);
                const img = await getPlaceImage(tripData.destination);
                setHeroImage(img);
            } catch {
                setError('Trip not found or an error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchTrip();
    }, [id]);

    /* ── PDF Export (Print approach) ─────────────── */
    const handleExportPDF = () => {
        window.print();
    };

    /* ── Share Link ─────────────── */
    const handleShare = async () => {
        if (shareLoading) return;
        setShareLoading(true);
        try {
            const res = await api.patch(`/trips/${id}/share`);
            setTrip(prev => ({ ...prev, isPublic: res.data.isPublic, shareId: res.data.shareId }));
            if (res.data.isPublic && res.data.shareId) {
                const url = `${window.location.origin}/shared/${res.data.shareId}`;
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            }
        } catch (err) {
            console.error('Share toggle failed:', err);
        } finally {
            setShareLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#FAF9F4] flex items-center justify-center">
            <p className="text-[#5C5C5C] font-semibold text-lg animate-pulse">Unfolding your itinerary...</p>
        </div>
    );

    if (error || !trip) return (
        <div className="min-h-screen bg-[#FAF9F4] flex flex-col items-center pt-24 font-bold text-[#222]">
            <p className="text-xl mb-4">{error}</p>
            <Link to="/dashboard" className="px-8 py-3 bg-[#6D8365] rounded-full text-white">Back to Dashboard</Link>
        </div>
    );

    const { destination, budget, days, itinerary, isPublic, shareId } = trip;
    const { summary, estimatedCost, travelTips, highlights, days: itineraryDays } = itinerary || {};

    const galleryHighlights = highlights && highlights.length > 0
        ? highlights
        : [destination, `${destination} landmark`, `${destination} tourism`, `${destination} old city`];

    return (
        <div className="min-h-screen bg-[#FAF9F4] pb-24 overflow-x-hidden">
            {/* Print-only Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    nav, button, .chat-widget, .no-print, [data-html2canvas-ignore], .back-button-container {
                        display: none !important;
                    }
                    body, .min-h-screen {
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .max-w-6xl {
                        max-width: 100% !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 20px !important;
                    }
                    .rounded-[32px], .rounded-[28px], .rounded-2xl {
                        border-radius: 12px !important;
                        border: 1px solid #eee !important;
                        box-shadow: none !important;
                    }
                    h1 { font-size: 28pt !important; }
                    h2 { font-size: 22pt !important; }
                    .hero-container { height: 300px !important; }
                    img { max-width: 100% !important; page-break-inside: avoid; }
                    .day-card { page-break-inside: avoid; margin-bottom: 20px; }
                }
            `}} />

            {/* Hero */}
            {heroImage && (
                <div className="w-full h-[400px] sm:h-[500px] relative">
                    <img src={heroImage} alt={destination} crossOrigin="anonymous" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F4] via-[#FAF9F4]/40 to-transparent" />
                </div>
            )}

            <div className={`max-w-6xl mx-auto px-6 relative z-10 ${heroImage ? '-mt-48' : 'pt-10'}`}>

                {/* Back + Action Buttons */}
                <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
                    <Link to="/dashboard"
                        className="inline-flex items-center gap-2 text-[#222] hover:text-[#6D8365] font-semibold text-[15px] transition-colors bg-white/70 backdrop-blur-md px-4 py-2 rounded-full shadow-sm">
                        <ArrowLeft className="w-5 h-5" /> Back to Journeys
                    </Link>

                    <div className="flex gap-2 no-print">
                        {/* PDF Export */}
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                            onClick={handleExportPDF}
                            className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md border border-[#E5E6E1] hover:border-[#6D8365]/40 text-[#333] font-semibold text-[14px] px-4 py-2 rounded-full shadow-sm transition-all">
                            <Download className="w-4 h-4 text-[#6D8365]" />
                            Export PDF
                        </motion.button>

                        {/* Share */}
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                            onClick={handleShare}
                            disabled={shareLoading}
                            className={`inline-flex items-center gap-2 font-semibold text-[14px] px-4 py-2 rounded-full shadow-sm transition-all disabled:opacity-60
                                ${isPublic
                                    ? 'bg-[#6D8365] text-white border border-[#586A51]'
                                    : 'bg-white/70 backdrop-blur-md border border-[#E5E6E1] hover:border-[#6D8365]/40 text-[#333]'}`}>
                            {copied
                                ? <><Check className="w-4 h-4" /> Link Copied!</>
                                : isPublic
                                    ? <><Share2 className="w-4 h-4" /> Sharing On</>
                                    : <><Share2 className="w-4 h-4" /> Share Trip</>
                            }
                        </motion.button>
                    </div>
                </div>

                {/* Shareable link banner */}
                <AnimatePresence>
                    {isPublic && shareId && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3.5 flex items-center gap-3 flex-wrap">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            <p className="text-emerald-800 font-semibold text-[13.5px] flex-1 min-w-0">
                                Trip is public · <span className="font-bold break-all">{window.location.origin}/shared/{shareId}</span>
                            </p>
                            <button onClick={async () => {
                                await navigator.clipboard.writeText(`${window.location.origin}/shared/${shareId}`);
                                setCopied(true); setTimeout(() => setCopied(false), 2000);
                            }} className="shrink-0 text-[12px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1 rounded-full transition-colors">
                                {copied ? 'Copied!' : 'Copy link'}
                            </button>
                            <button onClick={handleShare} disabled={shareLoading}
                                className="shrink-0 text-[12px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full transition-colors">
                                Revoke
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Printable itinerary wrapper */}
                <div ref={itineraryRef}>

                    {/* Header Card */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[32px] p-8 sm:p-12 mb-8 border border-[#E5E6E1] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#222] tracking-tight mb-4 leading-tight">
                            Trip to <span className="text-[#6D8365]">{destination}</span>
                        </h1>
                        <p className="text-xl text-[#5C5C5C] font-medium leading-relaxed mb-8 max-w-4xl">
                            {summary || `A tailored ${days}-day ${budget} journey exploring ${destination}.`}
                        </p>
                        <div className="flex flex-wrap gap-4 text-[15.5px] font-bold">
                            <div className="px-6 py-3 bg-[#F1F3EA] text-[#6D8365] rounded-full flex items-center gap-2">
                                <Clock className="w-5 h-5" /> {days} Days
                            </div>
                            <div className="px-6 py-3 bg-[#F1F3EA] text-[#6D8365] rounded-full flex items-center gap-2 capitalize">
                                <Tag className="w-5 h-5" /> {budget} Budget
                            </div>
                            {estimatedCost && (
                                <div className="px-6 py-3 bg-gray-50 text-gray-700 border border-gray-200 rounded-full font-bold text-[16px]">
                                    Est. Total: {formatRupee(estimatedCost)}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Weather Widget */}
                    <div className="mb-8">
                        <WeatherWidget destination={destination} />
                    </div>

                    {/* Destination Photo Gallery */}
                    <DestinationGallery highlights={galleryHighlights} destination={destination} />

                    {/* Interactive Map */}
                    <motion.section data-html2canvas-ignore initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-10">
                        <h2 className="flex items-center gap-2 text-xl font-extrabold text-[#222] mb-4">
                            <MapPin className="w-5 h-5 text-[#6D8365]" />
                            Trip Map
                        </h2>
                        <div className="overflow-hidden rounded-[24px] border border-[#E5E6E1] shadow-sm">
                            <TripMap destination={destination} itinerary={itinerary} />
                        </div>
                        <p className="text-[12px] text-[#aaa] mt-2 text-center">© OpenStreetMap contributors</p>
                    </motion.section>

                    {/* Day Cards */}
                    <div className="space-y-6">
                        <AnimatePresence>
                            {itineraryDays && itineraryDays.map((day, idx) => (
                                <motion.div key={`${day.day}-${idx}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.07 }}
                                    className="bg-white border border-[#E5E6E1] rounded-[28px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                                    <h2 className="text-2xl font-extrabold text-[#222] mb-5">
                                        Day {day.day}
                                        <span className="opacity-30 px-2 font-normal">|</span>
                                        <span className="text-[#6D8365] font-bold text-[18px] tracking-tight">{day.dateDescription}</span>
                                    </h2>
                                    <div className="relative border-l-[3px] border-[#E5E6E1] ml-4 pb-1 pt-1">
                                        {(day.activities || []).map((act, i) => (
                                            <div key={i} className="relative pl-9 pb-5 last:pb-0">
                                                <div className="absolute -left-[10.5px] top-1.5 w-[18px] h-[18px] bg-white border-[4px] border-[#6D8365] rounded-full shadow-sm" />
                                                <div className="bg-[#FAF9F4] rounded-2xl p-5 border border-[#E5E6E1] hover:border-[#6D8365]/30 transition-colors">
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
                                        <div className="mt-7 pt-6 border-t border-[#E5E6E1]">
                                            <h4 className="flex items-center gap-3 font-extrabold text-[#222] text-lg mb-4">
                                                <Utensils className="w-5 h-5 text-[#6D8365]" /> Dining Notes
                                            </h4>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                                {day.foodSuggestions.map((food, fIdx) => (
                                                    <div key={fIdx} className="bg-[#F1F3EA] p-4 rounded-xl border border-[#D5D8CB] flex flex-col gap-2 overflow-hidden">
                                                        <span className="text-[#222] font-extrabold uppercase tracking-wide text-[11.5px]">{food.meal}</span>
                                                        <p className="text-[#5C5C5C] font-medium text-[13.5px] leading-snug break-words">{food.place || food.description}</p>
                                                        {food.cost && (
                                                            <span className="self-start text-[12px] font-bold text-[#6D8365] bg-white px-3 py-1 rounded-lg shadow-sm border border-gray-100 break-words leading-snug">
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
                        </AnimatePresence>

                        {/* Travel Tips */}
                        {travelTips && travelTips.length > 0 && (
                            <div className="w-full bg-[#F1F3EA] border border-[#D5D8CB] rounded-[32px] p-8 sm:p-12 shadow-sm mt-4">
                                <h3 className="flex items-center gap-3 text-2xl font-extrabold text-[#222] mb-8">
                                    <Info className="text-[#6D8365] w-7 h-7" /> Essential Travel Tips
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                    {travelTips.map((tip, i) => (
                                        <div key={i} className="flex gap-4 text-[16.5px] font-semibold text-[#5C5C5C]">
                                            <span className="text-[#6D8365] shrink-0 font-extrabold text-2xl leading-none">•</span>
                                            <span className="leading-relaxed whitespace-pre-line">{tip}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>{/* end printable wrapper */}
            </div>

            {/* Floating AI Chat */}
            <ChatWidget
                tripId={id}
                destination={destination}
                onItineraryUpdate={(newItinerary) => setTrip(prev => ({ ...prev, itinerary: newItinerary }))}
            />
        </div>
    );
};

export default TripDetails;
