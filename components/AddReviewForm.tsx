"use client";

import { useEffect, useState } from 'react';
import { Star, Send, Loader2, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import Link from 'next/link';

/**
 * Interface for the Movie object
 */
interface Movie {
    id: number;
    nombre: string;
}

/**
 * Interface for the props of the AddReviewForm component
 */
interface AddReviewFormProps {
    movie: Movie;
    onReviewAdded: (newReview: any) => void;
}

/**
 * AddReviewForm component
 * @param param0 
 * @returns 
 */
export default function AddReviewForm({ movie, onReviewAdded }: AddReviewFormProps) {
    /**
     * State for the review text and rating
     */
    const [texto, setTexto] = useState('');
    const [puntuacion, setPuntuacion] = useState(0);
    const [hover, setHover] = useState(0);

    /**
     * State for the user's login status
     */
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    /**
     * State for the submission status and messages
     */
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

    /**
     * Initializes the login status based on the presence of an access token
     */
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        setIsLoggedIn(!!token);
    }, []);

    /**
     * Handles the form submission
     * @param e 
     * @returns 
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (puntuacion === 0) {
            setStatus({ type: 'error', message: 'Please, select a rating' });
            return;
        }

        setIsSubmitting(true);
        setStatus({ type: null, message: '' });

        try {
            const token = localStorage.getItem('access_token');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${movie.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    texto,
                    puntuacion,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) throw new Error('You have already written a review for this movie');
                if (response.status === 401) throw new Error('You must be logged in to comment');
                throw new Error(data.message || 'Error submitting review');
            }

            setStatus({ type: 'success', message: 'Review submitted successfully!' });
            setTexto('');
            setPuntuacion(0);
            onReviewAdded(data);
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-6">
                    <Lock size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Join the conversation</h3>
                <p className="text-slate-500 mb-8 font-medium max-w-sm">
                    You need to be logged in to share your thoughts on <span className="text-blue-600">{movie.nombre}</span>.
                </p>
                <Link 
                    href="/login" 
                    className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                    Log in to Review
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Your oppinion counts</h3>
            <p className="text-slate-500 mb-8 font-medium">What did you think of <span className="text-blue-600"> {movie.nombre}</span>?</p>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Star Selector */}
                <div className="flex flex-col gap-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Rating</label>
                    <div className="flex gap-1">
                        {[...Array(10)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <button
                                    key={index}
                                    type="button"
                                    className="transition-transform active:scale-90"
                                    onClick={() => setPuntuacion(ratingValue)}
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(0)}
                                >
                                    <Star
                                        size={28}
                                        className={`transition-colors ${ratingValue <= (hover || puntuacion)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-slate-200"
                                            }`}
                                    />
                                </button>
                            );
                        })}
                        <span className="ml-4 text-2xl font-black text-slate-300">
                            {puntuacion > 0 ? puntuacion : (hover || 0)}
                            <span className="text-sm font-bold">/10</span>
                        </span>
                    </div>
                </div>

                {/* Text Area */}
                <div className="flex flex-col gap-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Your Review</label>
                    <textarea
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        required
                        placeholder="Write your film review here..."
                        className="w-full min-h-37.5 p-6 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-700 font-medium resize-none"
                    />
                </div>

                {/* Status Messages */}
                {status.type && (
                    <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-bottom-2 ${status.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                        {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        {status.message}
                    </div>
                )}

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 group"
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                            <span>Post Review</span>
                            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
