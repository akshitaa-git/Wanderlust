import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, PlusCircle } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Hide navbar on landing page (landing page has its own)
    if (location.pathname === '/') return null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 w-full bg-[#FAF9F4]/90 backdrop-blur-md border-b border-[#E5E6E1]">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-[20px] text-[#222222] tracking-tight cursor-pointer">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#6D8365]">
                    <path d="M12 2L2 22l10-4 10 4L12 2z"></path>
                </svg>
                <span aria-label="wanderlust brand">wanderlust</span>
            </Link>

            <div className="flex items-center gap-4">
                {token ? (
                    <>
                        <Link to="/dashboard" className="text-[#5C5C5C] hover:text-[#222222] transition-colors flex items-center gap-1.5 text-sm font-semibold">
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </Link>
                        <Link to="/generate" className="text-[#5C5C5C] hover:text-[#222222] transition-colors flex items-center gap-1.5 text-sm font-semibold ml-2">
                            <PlusCircle className="w-4 h-4" />
                            New Trip
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="ml-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-bold hover:bg-gray-50 transition-colors text-gray-800 shadow-sm"
                        >
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Profile" className="w-5 h-5 rounded-full" />
                            ) : (
                                <LogOut className="w-4 h-4" />
                            )}
                            Sign out
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-[#4A4A4A] hover:text-[#222222] transition-colors text-sm font-bold mr-2">
                            Log in
                        </Link>
                        <Link
                            to="/register"
                            className="px-6 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-bold hover:bg-gray-50 transition-colors text-gray-800 shadow-sm"
                        >
                            Sign up
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
};

export default Navbar;
