import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Left: Logo */}
                    <div className="flex-shrink-0 w-32">
                        <Link to="/">
                            <h1 className="text-xl font-normal tracking-tight text-black">
                                PrepToPlate
                            </h1>
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
                        <a href="#" className="text-black font-light text-sm hover:text-gray-600 transition-colors uppercase tracking-wide">
                            Get Started
                        </a>
                    </div>

                    {/* Right: Login */}
                    <div className="hidden md:flex items-center justify-end w-32">
                        <a href="#" className="text-black font-light text-sm hover:text-gray-600 transition-colors uppercase tracking-wide">
                            Log In
                        </a>
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
                        <Link to="/menu" className="text-black font-light text-sm uppercase tracking-wide">
                            Menu
                        </Link>
                        <a href="#how-it-works" className="text-black font-light text-sm uppercase tracking-wide">
                            How It Works
                        </a>
                        <a href="#" className="text-black font-light text-sm uppercase tracking-wide">
                            Get Started
                        </a>
                        <a href="#" className="text-black font-light text-sm uppercase tracking-wide pt-4 border-t border-gray-100 w-full text-center">
                            Log In
                        </a>
                    </div>
                </div>
            )}
        </nav>
    );
}
