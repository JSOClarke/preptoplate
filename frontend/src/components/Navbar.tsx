import { Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, isAdmin, user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        setIsOpen(false);
    };

    return (
        <nav className="bg-white py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Left: Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/">
                            <img
                                src="/logo.png"
                                alt="PrepToPlate"
                                className="h-12 w-auto"
                            />
                        </Link>
                    </div>

                    {/* Center: Navigation */}
                    <div className="hidden md:flex items-center justify-center space-x-12 flex-1">
                        <Link to="/menu" className="text-black font-light text-sm hover:text-gray-600 transition-colors uppercase tracking-wide">
                            Menu
                        </Link>
                        <a href="#how-it-works" className="text-black font-light text-sm hover:text-gray-600 transition-colors uppercase tracking-wide">
                            How It Works
                        </a>
                        {isAdmin && (
                            <Link to="/admin" className="text-black font-light text-sm hover:text-gray-600 transition-colors uppercase tracking-wide">
                                Admin
                            </Link>
                        )}
                        <a href="#" className="text-black font-light text-sm hover:text-gray-600 transition-colors uppercase tracking-wide">
                            Get Started
                        </a>
                    </div>

                    {/* Right: Auth */}
                    <div className="hidden md:flex items-center justify-end w-32 space-x-4">
                        {isAuthenticated ? (
                            <>
                                <span className="text-xs font-light truncate max-w-[100px]" title={user?.email}>
                                    {user?.email}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="text-black hover:text-gray-600 transition-colors"
                                    title="Log out"
                                >
                                    <LogOut size={18} strokeWidth={1.5} />
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="text-black font-light text-sm hover:text-gray-600 transition-colors uppercase tracking-wide">
                                Log In
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-black hover:text-gray-600 transition-colors"
                        >
                            {isOpen ? <X size={24} strokeWidth={1} /> : <Menu size={24} strokeWidth={1} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden mt-4 border-t border-gray-100">
                    <div className="px-4 pt-4 pb-6 space-y-4 flex flex-col items-center">
                        <Link to="/menu" className="text-black font-light text-sm uppercase tracking-wide" onClick={() => setIsOpen(false)}>
                            Menu
                        </Link>
                        <a href="#how-it-works" className="text-black font-light text-sm uppercase tracking-wide" onClick={() => setIsOpen(false)}>
                            How It Works
                        </a>
                        {isAdmin && (
                            <Link to="/admin" className="text-black font-light text-sm uppercase tracking-wide" onClick={() => setIsOpen(false)}>
                                Admin
                            </Link>
                        )}
                        <a href="#" className="text-black font-light text-sm uppercase tracking-wide" onClick={() => setIsOpen(false)}>
                            Get Started
                        </a>

                        {isAuthenticated ? (
                            <>
                                <span className="text-xs font-light pt-4 border-t border-gray-100 w-full text-center">
                                    {user?.email}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="text-black font-light text-sm uppercase tracking-wide flex items-center gap-2"
                                >
                                    <LogOut size={16} strokeWidth={1.5} />
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="text-black font-light text-sm uppercase tracking-wide pt-4 border-t border-gray-100 w-full text-center"
                                onClick={() => setIsOpen(false)}
                            >
                                Log In
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
