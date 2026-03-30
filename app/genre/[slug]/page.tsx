"use client";

import { useEffect, useState, use, useMemo } from 'react';
import { Filter, Star, Play, Loader2, Film, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * Interface for the Movie object
 */
interface Movie {
    id: number;
    nombre: string;
    sinopsis: string;
    genero: {
        id: number;
        nombre: string;
    };
    fechaEstreno: string;
    calificacion: number;
    urlImagen: string;
}

/**
 * Genre page component
 * @param param0 
 * @returns 
 */
export default function GenrePage({ params }: { params: Promise<{ slug: string }> }) {
    /**
     * State for the movies in the genre
     */
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [page, setPage] = useState(0);

    /**
     * State for sorting and pagination
     */
    const [sortOrder, setSortOrder] = useState('rating_desc');
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 10;

    /**
     * Resolves the URL parameters
     */
    const resolvedParams = use(params);
    const slug = resolvedParams.slug;
    const genreName = slug.charAt(0).toUpperCase() + slug.slice(1);
    const genreNameClean = genreName.replace('%20', ' ').split(" ").map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");

    /**
     * Sorts the movies based on the selected sort order
     */
    const sortedMovies = useMemo(() => {
        const list = [...movies];

        switch (sortOrder) {
            case 'name_asc':
                return list.sort((a, b) => a.nombre.localeCompare(b.nombre));
            case 'name_desc':
                return list.sort((a, b) => b.nombre.localeCompare(a.nombre));
            case 'rating_asc':
                return list.sort((a, b) => a.calificacion - b.calificacion);
            case 'rating_desc':
                return list.sort((a, b) => b.calificacion - a.calificacion);
            default:
                return list;
        }
    }, [movies, sortOrder]);

    /**
     * Fetches movies by genre
     */
    useEffect(() => {
        const fetchMoviesByGenre = async () => {
            setLoading(true);
            setError(false);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/peliculas/generos/${genreNameClean}?page=${page}&rating=desc`);

                if (res.status === 404) {
                    setMovies([]);
                    setHasMore(false);
                    return;
                }

                if (!res.ok) throw new Error();

                const data = await res.json();
                setMovies(data);

                setHasMore(data.length === ITEMS_PER_PAGE);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchMoviesByGenre();
    }, [slug, page]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Navbar */}
            <Navbar />

            {/* Header */}
            <header className="bg-white border-b border-slate-200 py-12 px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                                <span className="text-blue-600">{genreNameClean}</span> movies
                            </h1>
                            <p className="text-slate-500 mt-3 text-lg max-w-2xl">
                                Explore the best reviews and ratings from the community for {genreNameClean.toLowerCase()} titles.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto w-full px-8 py-10 flex flex-col lg:flex-row gap-10">
                {/* Filters */}
                <aside className="w-full lg:w-64 space-y-8 shrink-0">
                    <div>
                        <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-6 uppercase text-xs tracking-widest">
                            <Filter size={16} className="text-blue-600" />
                            Sort by
                        </h3>

                        <div className="space-y-6">
                            {/* Alphabetic Order */}
                            <div className="group">
                                <p className="flex items-center justify-between w-full py-2 font-bold text-slate-800 text-sm border-b border-slate-100 mb-3">
                                    Alphabetical
                                </p>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="sort"
                                            value="name_asc"
                                            checked={sortOrder === 'name_asc'}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                            className="w-4 h-4 border-slate-300 text-blue-600 focus:ring-blue-500/20"
                                        />
                                        <span className="text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">A to Z</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="sort"
                                            value="name_desc"
                                            checked={sortOrder === 'name_desc'}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                            className="w-4 h-4 border-slate-300 text-blue-600 focus:ring-blue-500/20"
                                        />
                                        <span className="text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">Z to A</span>
                                    </label>
                                </div>
                            </div>

                            {/* Order by Rating */}
                            <div className="group">
                                <p className="flex items-center justify-between w-full py-2 font-bold text-slate-800 text-sm border-b border-slate-100 mb-3">
                                    Rating
                                </p>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="sort"
                                            value="rating_desc"
                                            checked={sortOrder === 'rating_desc'}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                            className="w-4 h-4 border-slate-300 text-blue-600 focus:ring-blue-500/20"
                                        />
                                        <span className="text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">Highest Rated</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="sort"
                                            value="rating_asc"
                                            checked={sortOrder === 'rating_asc'}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                            className="w-4 h-4 border-slate-300 text-blue-600 focus:ring-blue-500/20"
                                        />
                                        <span className="text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">Lowest Rated</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setSortOrder('rating_desc')}
                            className="mt-8 w-full py-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors border border-dashed border-slate-200 rounded-lg hover:border-red-200"
                        >
                            Reset Filters
                        </button>
                    </div>
                </aside>

                {/* Movies Grid */}
                <section className="flex-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                            <p className="font-bold">Loading movie list...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-8 rounded-2xl flex flex-col items-center gap-3 border border-red-100">
                            <AlertCircle size={32} />
                            <p className="font-black text-center">Failed to connect to the server</p>
                        </div>
                    ) : movies.length === 0 ? (
                        <div className="bg-slate-100 rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
                            <Film className="mx-auto text-slate-300 mb-4" size={48} />
                            <h3 className="text-xl font-bold text-slate-800 text-balance">
                                No movies registered in {genreName}
                            </h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                            {sortedMovies.map((movie) => (
                                <Link href={`/movies/${movie.id}`} key={movie.id} className="group flex flex-col cursor-pointer">
                                    <div className="relative aspect-2/3 bg-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-blue-900/20 group-hover:-translate-y-2">
                                        {movie.urlImagen ? (
                                            <img
                                                src={movie.urlImagen}
                                                alt={movie.nombre}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-300">
                                                <Play size={48} className="opacity-30" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <div className="bg-white p-4 rounded-full text-blue-600 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-xl">
                                                <Play size={24} className="fill-current" />
                                            </div>
                                        </div>
                                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/20">
                                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                            <span className="text-white text-xs font-black">{movie.calificacion.toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h2 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 tracking-tight">
                                            {movie.nombre}
                                        </h2>
                                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">
                                            {new Date(movie.fechaEstreno).getFullYear()} • {movie.genero.nombre}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && movies.length > 0 && (
                        <div className="mt-16 flex justify-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 transition-all"
                            >
                                Previous
                            </button>
                            <span className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200">
                                {page + 1}
                            </span>
                            <button
                                onClick={() => {
                                    setPage(p => p + 1);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                disabled={!hasMore}
                                className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
