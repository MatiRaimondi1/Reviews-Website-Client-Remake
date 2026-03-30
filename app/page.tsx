import Navbar from '@/components/Navbar';
import MovieGrid from '@/components/MovieGrid';
import SearchBar from '@/components/SearchBar';
import Footer from '@/components/Footer';

/**
 * Home page component
 * @returns 
 */
export default function Home() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Navbar */}
            <Navbar />

            {/* Hero Section */}
            <header className="relative py-20 px-8 bg-linear-to-b from-blue-900 to-blue-800 text-white">
                <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                        Your next favorite movie starts with a review.
                    </h1>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl">
                        Explore thousands of reviews, rate your favorite releases, and share your passion for cinema with a real community.
                    </p>
                    <div className="w-full max-w-2xl flex justify-center">
                        <SearchBar />
                    </div>
                </div>
            </header>

            {/* Featured Section */}
            <MovieGrid />

            {/* Footer */}
            <Footer />
        </div>
    );
};
