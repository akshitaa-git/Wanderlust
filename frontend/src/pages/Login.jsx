import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../api/axios';

/* ── Google icon SVG ───────────────────────────── */
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.4 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.2-2.7-.4-4z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.4 29.3 4 24 4 16.2 4 9.5 8.4 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.5 26.9 36 24 36c-5.2 0-9.6-3.2-11.4-7.8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 6l6.2 5.2C40.6 35.5 44 30.2 44 24c0-1.3-.2-2.7-.4-4z" />
    </svg>
);

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', form);
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    /* ── Token-based Google sign-in ─────────────── */
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setGoogleLoading(true);
            setError('');
            try {
                const res = await api.post('/auth/google', {
                    accessToken: tokenResponse.access_token,
                });
                const { token, user } = res.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                navigate('/dashboard');
            } catch (err) {
                setError(err.response?.data?.error || 'Google sign-in failed. Please try again.');
            } finally {
                setGoogleLoading(false);
            }
        },
        onError: () => {
            setError('Google sign-in was cancelled or failed.');
        },
    });

    const isLoading = loading || googleLoading;

    return (
        <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-[#FAF9F4] px-4 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-[#222222] tracking-tight">Welcome back.</h2>
                    <p className="mt-2 text-[#5C5C5C] font-medium text-[15px]">Sign in to continue planning your journeys.</p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* Google Sign In */}
                    <button
                        type="button"
                        onClick={() => googleLogin()}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl border border-[#E5E6E1] bg-white hover:bg-gray-50 transition-all font-semibold text-[15px] text-[#222] shadow-sm disabled:opacity-60"
                    >
                        {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
                        Continue with Google
                    </button>

                    <div className="flex items-center gap-3 text-gray-300 text-sm">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[#999] font-medium">or continue with email</span>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    {error && (
                        <div className="text-[#C84B31] text-sm text-center bg-[#C84B31]/10 py-2.5 rounded-lg border border-[#C84B31]/20 font-medium">
                            {error}
                        </div>
                    )}

                    <div>
                        <input
                            name="email" type="email" required
                            className="w-full px-5 py-3.5 bg-[#FAF9F4] border border-[#E5E6E1] text-[#222222] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D8365]/30 focus:border-[#6D8365] transition-all placeholder-gray-400 font-medium"
                            placeholder="Email address"
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <input
                            name="password" type="password" required
                            className="w-full px-5 py-3.5 bg-[#FAF9F4] border border-[#E5E6E1] text-[#222222] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D8365]/30 focus:border-[#6D8365] transition-all placeholder-gray-400 font-medium"
                            placeholder="Password"
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit" disabled={isLoading}
                        className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-white font-bold bg-[#6D8365] hover:bg-[#586A51] transition-colors disabled:opacity-50 mt-4 shadow-sm"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
                    </button>

                    <div className="text-center text-[15px] pt-4 border-t border-gray-100 mt-6">
                        <span className="text-[#5C5C5C]">Don't have an account? </span>
                        <Link to="/register" className="font-bold text-[#6D8365] hover:text-[#586A51] underline transition-colors">
                            Sign up
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
export default Login;
