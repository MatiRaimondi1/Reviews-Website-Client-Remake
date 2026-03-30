"use client";

import { useState, useEffect } from 'react';
import { Star, Send, Loader2, Search, Film, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Interface for the Movie data structure
 */
interface Movie {
    id: number;
    nombre: string;
    urlImagen: string;
}

/**
 * Component for posting reviews for a group
 * @param param0 
 * @returns 
 */
export default function GroupReviewPoster({ grupoId, onReviewPublished }: { grupoId: number, onReviewPublished: () => void }) {
    /**
     * State for managing the search term
     */
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [movies, setMovies] = useState<Movie[]>([]);

    /**
     * State for managing the selected movie
     */
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [texto, setTexto] = useState('');
    const [puntuacion, setPuntuacion] = useState(0);

    /**
     * State for managing the submission status
     */
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

    /**
     * Effect for handling search term changes
     */
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim().length > 2) {
                setIsLoading(true);
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/peliculas/search/name?q=${searchTerm}`);
                    if (res.ok) {
                        const data = await res.json();
                        setMovies(data.slice(0, 5));
                        setShowResults(true);
                    } else {
                        setMovies([]);
                    }
                } catch (error) {
                    console.error("Error searching movies: ", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setMovies([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    /**
     * Handles the form submission for publishing a review
     * @param e 
     * @returns 
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMovie || puntuacion === 0) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${selectedMovie.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ texto, puntuacion, grupoId })
            });

            if (!res.ok) throw new Error("Error while publishing review");

            setStatus({ type: 'success', message: 'Review published successfully!' });
            setTexto('');
            setPuntuacion(0);
            setSelectedMovie(null);
            setSearchTerm('');
            onReviewPublished();
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-blue-100 shadow-sm mb-12">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <Film className="text-blue-600" size={20} />
                Publish in the Group
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Searchbar */}
                {!selectedMovie ? (
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search for a movie to review..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all font-bold text-slate-900"
                        />

                        {/* Loading */}
                        {isLoading && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Loader2 className="animate-spin text-blue-600" size={20} />
                            </div>
                        )}

                        {/* Results/Error */}
                        {searchTerm.trim().length > 2 && !isLoading && (
                            <div className="absolute w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden">
                                {movies.length > 0 ? (
                                    movies.map(m => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => setSelectedMovie(m)}
                                            className="w-full p-4 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors text-slate-900 font-bold"
                                        >
                                            <img
                                                src={m.urlImagen}
                                                alt={m.nombre}
                                                className="w-10 h-14 bg-slate-200 rounded-lg shrink-0 object-cover flex items-center justify-center text-slate-400 text-[10px]"
                                            />
                                            {m.nombre}
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-6 text-center">
                                        <AlertCircle className="mx-auto text-slate-300 mb-2" size={24} />
                                        <p className="text-slate-500 font-bold text-sm">No movies found for "{searchTerm}"</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100 animate-in zoom-in duration-200 text-slate-900">
                        <div className="flex items-center gap-3">
                            <Film className="text-blue-600" size={20} />
                            <span className="font-black">{selectedMovie.nombre}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSelectedMovie(null)}
                            className="text-[10px] font-black uppercase text-blue-600 hover:underline"
                        >
                            Change
                        </button>
                    </div>
                )}

                {/* Review Form */}
                {selectedMovie && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex gap-1 justify-center py-2">
                            {[...Array(10)].map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setPuntuacion(i + 1)}
                                    className="transition-transform active:scale-75"
                                >
                                    <Star
                                        size={24}
                                        className={i < puntuacion ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}
                                    />
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={texto}
                            onChange={(e) => setTexto(e.target.value)}
                            placeholder="Write your review for the group..."
                            className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none resize-none font-medium text-slate-700"
                            rows={3}
                        />

                        <button
                            type="submit"
                            disabled={isSubmitting || !texto || puntuacion === 0}
                            className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 disabled:bg-slate-200"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Publish Review</>}
                        </button>
                    </div>
                )}

                {status.type && (
                    <div className={`p-4 rounded-xl text-xs font-black flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                        {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {status.message.toUpperCase()}
                    </div>
                )}
            </form>
        </div>
    );
}
