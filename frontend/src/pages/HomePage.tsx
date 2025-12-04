import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';

export default function HomePage() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <Hero />
            <HowItWorks />
            <Footer />
        </div>
    );
}
