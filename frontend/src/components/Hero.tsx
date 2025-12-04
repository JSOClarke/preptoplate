import { ArrowRight } from 'lucide-react';

export default function Hero() {
    return (
        <section className="min-h-screen flex items-center bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-0">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Image */}
                    <div className="order-2 lg:order-1">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/10 rounded-3xl transform rotate-3"></div>
                            <img
                                src="/hero-meal.png"
                                alt="Fresh, healthy meal prep"
                                className="relative rounded-3xl shadow-2xl object-cover w-full h-[500px] lg:h-[600px] hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    </div>

                    {/* Right Side - Content */}
                    <div className="order-1 lg:order-2 space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                Skip the cooking,{' '}
                                <span className="text-primary">keep the flavour.</span>
                            </h1>
                            <p className="text-xl text-gray-600 leading-relaxed">
                                Fresh, chef-prepared meals delivered weekly. Choose from our rotating menu of delicious, macro-balanced options. No cooking required.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="btn-primary flex items-center justify-center gap-2 group">
                                View this week's menu
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="btn-secondary">
                                How it works
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 pt-8 border-t">
                            <div>
                                <p className="text-3xl font-bold text-primary">50+</p>
                                <p className="text-sm text-gray-600">Weekly Options</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-primary">5k+</p>
                                <p className="text-sm text-gray-600">Happy Customers</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-primary">100%</p>
                                <p className="text-sm text-gray-600">Fresh Ingredients</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
