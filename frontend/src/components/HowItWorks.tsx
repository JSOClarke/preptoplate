import { ChefHat, ShoppingCart, Truck } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        {
            icon: ShoppingCart,
            title: 'Choose Your Meals',
            description: 'Browse our rotating weekly menu and select your favorites. All meals are macro-balanced and portion-controlled.',
            color: 'bg-primary-100 text-primary',
        },
        {
            icon: ChefHat,
            title: 'We Prep Fresh',
            description: 'Our professional chefs prepare each meal with quality ingredients. No preservatives, just real food.',
            color: 'bg-accent-100 text-accent',
        },
        {
            icon: Truck,
            title: 'Delivered to You',
            description: 'Receive your meals fresh every week. Just heat and enjoy. Skip the cooking, keep the flavour.',
            color: 'bg-primary-100 text-primary',
        },
    ];

    return (
        <section id="how-it-works" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        How It Works
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Getting healthy, delicious meals has never been easier. Just three simple steps.
                    </p>
                </div>

                {/* Steps */}
                <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="relative group"
                        >
                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-16 left-1/2 w-full h-1 bg-gradient-to-r from-primary/30 to-transparent z-0"></div>
                            )}

                            {/* Card */}
                            <div className="relative bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-primary/20 z-10">
                                {/* Step Number */}
                                <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                                    {index + 1}
                                </div>

                                {/* Icon */}
                                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <step.icon className="w-8 h-8" />
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <button className="btn-primary">
                        Start Your Journey Today
                    </button>
                </div>
            </div>
        </section>
    );
}
