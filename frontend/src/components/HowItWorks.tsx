export default function HowItWorks() {
    const steps = [
        {
            title: 'CHOOSE',
            color: 'bg-[#E0E0E0]', // Light Grey
        },
        {
            title: 'PREP',
            color: 'bg-[#9E9E9E]', // Medium Grey
        },
        {
            title: 'DELIVER',
            color: 'bg-[#424242]', // Dark Grey
        },
    ];

    return (
        <section id="how-it-works" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`aspect-square ${step.color} flex items-center justify-center transition-opacity hover:opacity-90`}
                        >
                            <h3 className="text-xl font-light tracking-widest text-white uppercase">
                                {step.title}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
