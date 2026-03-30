"use client";

import { useEffect, useState } from 'react';
import { TrendingUp, Star, PlayCircle, Film, AlertCircle, Loader2, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Interface for the Movie data structure
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
    duracion: number;
    calificacion: number;
    urlImagen: string;
}

/**
 * MovieGrid component
 * @returns 
 */
export default function MovieGrid() {
    /**
     * State for the movies, loading, and error
     */
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const router = useRouter();

    /**
     * Handles the selection of a movie
     * @param id 
     */
    const handleSelect = (id: number) => {
        router.push(`/movies/${id}`);
    };

    /**
     * Fetches the list of movies
     */
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/peliculas?page=0&rating=desc`);

                if (res.status === 404) {
                    setMovies([]);
                    return;
                }

                if (!res.ok) throw new Error();

                const data = await res.json();
                setMovies(data);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    return (
        <section className="py-16 px-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                    <TrendingUp className="text-blue-600 w-6 h-6" />
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight underline decoration-blue-500/30 decoration-4 underline-offset-8">
                        Popular
                    </h2>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                    <p className="font-medium animate-pulse">Loading...</p>
                </div>
            )}

            {/* No movies found */}
            {!loading && movies.length === 0 && !error && (
                <div className="bg-slate-100 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                    <Film className="mx-auto text-slate-300 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-slate-800">No movies found</h3>
                    <p className="text-slate-500 mt-2">It looks like the database is empty for now.</p>
                </div>
            )}

            {/* Connection error */}
            {error && (
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-4 border border-red-100">
                    <AlertCircle size={24} />
                    <p className="font-bold">There was an error connecting to the server.</p>
                </div>
            )}

            {/* Movie Grid */}
            {!loading && movies.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {movies.map((movie) => (
                        <button key={movie.id} onClick={() => handleSelect(movie.id)} className="group cursor-pointer">
                            <div className="aspect-2/3 bg-slate-200 rounded-2xl mb-4 overflow-hidden relative shadow-sm group-hover:shadow-2xl group-hover:shadow-blue-900/20 group-hover:-translate-y-2 transition-all duration-500">
                                {/* Image or Fallback */}
                                {movie.urlImagen ? (
                                    <img
                                        src={movie.urlImagen}
                                        alt={movie.nombre}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-300">
                                        <PlayCircle size={48} className="opacity-30" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="bg-white p-4 rounded-full text-blue-600 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-xl">
                                        <Play size={24} className="fill-current" />
                                    </div>
                                </div>
                                {/* Calification Badge */}
                                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/20">
                                    <Star className="text-yellow-400 w-3.5 h-3.5 fill-yellow-400" />
                                    <span className="text-white text-xs font-black">{movie.calificacion.toFixed(1)}</span>
                                </div>
                            </div>

                            <h3 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                {movie.nombre}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-wider">
                                {new Date(movie.fechaEstreno).getFullYear()} • {movie.genero?.nombre}
                            </p>
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
}
