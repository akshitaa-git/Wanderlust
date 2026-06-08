import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * This page handles the redirect from our server after Google OAuth.
 * The server sends ?token=...&user=... in the URL.
 * We store them in localStorage and redirect to /dashboard.
 */
const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const user = params.get('user');

        if (token && user) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', user);
            navigate('/dashboard', { replace: true });
        } else {
            navigate('/login?error=google_failed', { replace: true });
        }
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9F4]">
            <div className="flex flex-col items-center gap-4">
                <svg className="animate-spin w-8 h-8 text-[#6D8365]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-[#5C5C5C] font-medium">Signing you in with Google…</p>
            </div>
        </div>
    );
};

export default AuthCallback;
