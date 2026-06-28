import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, PlusCircle, Menu, X } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [menuOpen, setMenuOpen] = useState(false);

    // Hide navbar on landing page (landing page has its own)
    if (location.pathname === '/') return null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        setMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-[#FAF9F4]/90 backdrop-blur-md border-b border-[#E5E6E1]">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-7xl mx-auto">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 font-extrabold text-[18px] sm:text-[20px] text-[#222222] tracking-tight cursor-pointer">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#6D8365]">
                        <path d="M12 2L2 22l10-4 10 4L12 2z"></path>
                    </svg>
                    <span aria-label="wanderlust brand">wanderlust</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden sm:flex items-center gap-4">
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

                {/* Mobile Hamburger */}
                <button
                    onClick={() => setMenuOpen(o => !o)}
                    className="sm:hidden p-2 rounded-xl border border-[#E5E6E1] bg-white text-[#222] shadow-sm"
                    aria-label="Toggle menu"
                >
                    {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Dropdown */}
            {menuOpen && (
                <div className="sm:hidden border-t border-[#E5E6E1] bg-[#FAF9F4] px-4 py-4 flex flex-col gap-3">
                    {token ? (
                        <>
                            <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2 text-[#5C5C5C] font-semibold text-sm py-2.5 px-4 rounded-xl hover:bg-white transition-colors">
                                <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </Link>
                            <Link to="/generate" onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2 text-[#5C5C5C] font-semibold text-sm py-2.5 px-4 rounded-xl hover:bg-white transition-colors">
                                <PlusCircle className="w-4 h-4" /> New Trip
                            </Link>
                            <button onClick={handleLogout}
                                className="flex items-center gap-2 text-red-500 font-semibold text-sm py-2.5 px-4 rounded-xl hover:bg-red-50 transition-colors w-full text-left">
                                <LogOut className="w-4 h-4" /> Sign out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setMenuOpen(false)}
                                className="text-[#4A4A4A] font-bold text-sm py-2.5 px-4 rounded-xl hover:bg-white transition-colors">
                                Log in
                            </Link>
                            <Link to="/register" onClick={() => setMenuOpen(false)}
                                className="text-[#4A4A4A] font-bold text-sm py-2.5 px-4 rounded-xl hover:bg-white transition-colors">
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            )}
        </header>
    );
};

export default Navbar;
