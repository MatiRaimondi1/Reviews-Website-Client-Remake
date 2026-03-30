"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Clapperboard, ChevronDown, Loader2, AlertCircle } from 'lucide-react';

/**
 * Interface for the Genre data structure
 */
interface Genero {
    id: number;
    nombre: string;
}

/**
 * GenresDropdown component
 * @returns 
 */
export default function GenresDropdown() {
    /**
     * State for the dropdown menu
     */
    const [isOpen, setIsOpen] = useState(false);
    const [generos, setGeneros] = useState<Genero[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    /**
     * Handles clicks outside the dropdown
     */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /**
     * Toggles the dropdown menu
     */
    const handleToggle = async () => {
        setIsOpen(!isOpen);

        if (!isOpen && generos.length === 0) {
            setIsLoading(true);
            setError(false);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generos`);
                if (!res.ok) throw new Error();
                const data: Genero[] = await res.json();
                const sortedData = data.sort((a, b) => a.nombre.localeCompare(b.nombre));
                setGeneros(sortedData);
            } catch (err) {
                setError(true);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${isOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}
            >
                <Clapperboard size={18} />
                Movies
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-blue-900/10 py-2 z-60 animate-in fade-in slide-in-from-top-2 duration-200">

                    {/* State: Loading */}
                    {isLoading && (
                        <div className="flex items-center gap-3 px-4 py-3 text-slate-400 text-sm">
                            <Loader2 size={16} className="animate-spin text-blue-500" />
                            <span>Loading...</span>
                        </div>
                    )}

                    {/* State: Error or Empty */}
                    {!isLoading && (error || generos.length === 0) && (
                        <div className="flex items-center gap-2 px-4 py-3 text-amber-600 bg-amber-50 mx-2 rounded-xl text-xs font-bold">
                            <AlertCircle size={14} />
                            <span>No genres available</span>
                        </div>
                    )}

                    {/* Genres List */}
                    {!isLoading && generos.length > 0 && (
                        <div className="max-h-72 overflow-y-auto px-2">
                            <p className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Explore by genre</p>
                            {generos.map((genero) => (
                                <Link
                                    key={genero.id}
                                    href={`/genre/${genero.nombre.toLowerCase()}`}
                                    onClick={() => setIsOpen(false)}
                                    className="block px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                                >
                                    {genero.nombre}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
