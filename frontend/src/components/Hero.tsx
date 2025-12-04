export default function Hero() {
    return (
        <section className="w-full">
            {/* Full width container with solid green background */}
            <div className="w-full h-[60vh] relative overflow-hidden bg-[#4A5D4F]"> {/* Sage Green */}

                {/* Text Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-thin text-white tracking-tighter text-center px-4">
                        Skip the cooking, keep the taste
                    </h1>
                </div>
            </div>
        </section>
    );
}
