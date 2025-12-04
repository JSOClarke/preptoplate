export default function Footer() {
    return (
        <footer className="bg-white py-12 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center space-y-4">
                <h3 className="text-lg font-normal tracking-tight text-black">
                    PrepToPlate
                </h3>
                <p className="text-xs font-light text-gray-500 tracking-wide uppercase">
                    &copy; {new Date().getFullYear()} All rights reserved.
                </p>
            </div>
        </footer>
    );
}
