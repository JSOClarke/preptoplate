import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <h1 className="text-2xl font-bold text-primary">
                            Prep<span className="text-accent">ToPlate</span>
                        </h1>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#" className="text-gray-700 hover:text-primary transition-colors">
                            Home
                        </a>
                        <a href="#menu" className="text-gray-700 hover:text-primary transition-colors">
                            Menu
                        </a>
                        <a href="#how-it-works" className="text-gray-700 hover:text-primary transition-colors">
                            How It Works
                        </a>
                        <button className="btn-primary">
                            Get Started
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-primary transition-colors"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden border-t">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <a
                            href="#"
                            className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                        >
                            Home
                        </a>
                        <a
                            href="#menu"
                            className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                        >
                            Menu
                        </a>
                        <a
                            href="#how-it-works"
                            className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                        >
                            How It Works
                        </a>
                        <button className="w-full mt-2 btn-primary">
                            Get Started
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
