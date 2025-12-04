import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <h3 className="text-2xl font-bold text-white mb-4">
                            Prep<span className="text-primary">ToPlate</span>
                        </h3>
                        <p className="text-gray-400 mb-6 max-w-md">
                            Skip the cooking, keep the flavour. Fresh, chef-prepared meals delivered to your door every week.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">About Us</a>
                            </li>
                            <li>
                                <a href="#menu" className="hover:text-primary transition-colors">Menu</a>
                            </li>
                            <li>
                                <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">Contact</a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} PrepToPlate. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
