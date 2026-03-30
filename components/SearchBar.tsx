"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Film, Star, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Interface for the search result object
 */
interface SearchResult {
    id: number;
    nombre: string;
    genero: {
        id: number;
        nombre: string;
    };
    calificacion: number;
    urlImagen: string;
}

/**
 * SearchBar component
 * @returns 
 */
export default function SearchBar() {
    /**
     * State for the search query and results
     */
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    /**
     * Sets up the click outside handler
     */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /**
     * Handles the search functionality with debouncing
     */
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length > 2) {
                setIsLoading(true);
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/peliculas/search/name?q=${query}`);
                    if (res.ok) {
                        const data = await res.json();
                        setResults(data);
                        setShowResults(true);
                    } else {
                        setResults([]);
                    }
                } catch (error) {
                    console.error("Error searching movies: ", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    /**
     * Handles the selection of a movie from the search results
     * @param id 
     */
    const handleSelect = (id: number) => {
        setShowResults(false);
        setQuery('');
        router.push(`/movies/${id}`);
    };

    return (
        <div className="relative w-full max-w-md" ref={searchRef}>
            <div className="relative group">
                <Search
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${query ? 'text-blue-600' : 'text-slate-400 group-focus-within:text-blue-600'
                        }`}
                    size={20}
                />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search movies..."
                    className="w-full pl-12 pr-10 py-3 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none shadow-sm"
                />
                {isLoading && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 animate-spin" size={18} />
                )}
                {!isLoading && query && (
                    <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Results Panel */}
            {showResults && (
                <div className="absolute top-full mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-blue-900/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {results.length > 0 ? (
                        <div className="max-h-100 overflow-y-auto p-2">
                            <p className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Results found</p>
                            {results.map((movie) => (
                                <button
                                    key={movie.id}
                                    onClick={() => handleSelect(movie.id)}
                                    className="w-full flex items-center gap-4 p-3 hover:bg-blue-50 rounded-xl transition-all group text-left"
                                >
                                    <img 
                                        src={movie.urlImagen}
                                        alt={movie.nombre}
                                        className="w-10 h-14 bg-slate-200 rounded-lg shrink-0 flex items-center justify-center text-slate-400"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-black text-slate-900 line-clamp-1 group-hover:text-blue-600">{movie.nombre}</h4>
                                        <p className="text-xs text-slate-500 font-bold">{movie.genero.nombre}</p>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg">
                                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                        <span className="text-[10px] font-black text-amber-700">{movie.calificacion}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <Film size={32} className="mx-auto text-slate-200 mb-2" />
                            <p className="text-sm font-bold text-slate-500">No results found for "{query}"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
