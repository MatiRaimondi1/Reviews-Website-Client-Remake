"use client";

import { useEffect, useState, use } from 'react';
import { Star, Clock, Calendar, Tag, ChevronLeft, MessageSquare, Loader2, AlertCircle, User, Trash2, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import AddReviewForm from '@/components/AddReviewForm';
import ReviewComments from '@/components/ReviewComments';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

/**
 * Interface for the Review object
 */
interface Review {
    id: number;
    texto: string;
    puntuacion: number;
    user: {
        id: number;
        username: string;
        urlImagen?: string;
    };
}

/**
 * Interface for the Movie detail object
 */
interface MovieDetail {
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
 * Movie detail page component
 * @param param0 
 * @returns 
 */
export default function Movie({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const router = useRouter();

    /**
     * State for the movie detail
     */
    const [movie, setMovie] = useState<MovieDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    /**
     * State for the reviews
     */
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);
    const [expandedReview, setExpandedReview] = useState<number | null>(null);

    /**
     * State for editing reviews
     */
    const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const [editPuntuacion, setEditPuntuacion] = useState(0);

    /**
     * Effect to initialize the current user ID from the JWT token
     */
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                setCurrentUserId(decoded.sub);
            } catch (e) { console.error("Invalid token"); }
        }
    }, []);

    /**
     * Effect to fetch movie details
     */
    useEffect(() => {
        const fetchMovieDetail = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/peliculas/${id}`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                setMovie(data);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetail();
    }, [id]);

    /**
     * Effect to fetch reviews
     */
    useEffect(() => {
        const fetchReviews = async () => {
            setLoadingReviews(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${id}?page=0`);
                if (res.status === 404) {
                    setReviews([]);
                    return;
                }
                const data = await res.json();
                setReviews(data);
            } catch (err) {
                console.error("Error loading reviews: ", err);
            } finally {
                setLoadingReviews(false);
            }
        };
        fetchReviews();
    }, [id]);

    /**
     * Handles the addition of a new review
     * @param newReview 
     */
    const handleReviewAdded = (newReview: Review) => {
        setReviews(prev => [newReview, ...prev]);
    };

    /**
     * Handles the deletion of a review
     * @param reviewId 
     * @returns 
     */
    const handleDeleteReview = async (reviewId: number) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setReviews(prev => prev.filter(r => r.id !== reviewId));
            } else {
                alert("Could not delete the review.");
            }
        } catch (err) {
            console.error("Error deleting review:", err);
        }
    };

    /**
     * Handles the editing of a review
     * @param reviewId 
     */
    const handleEditReview = async (reviewId: number) => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${reviewId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    texto: editText,
                    puntuacion: editPuntuacion
                })
            });

            if (res.ok) {
                const updatedReview = await res.json();
                setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, ...updatedReview } : r));
                setEditingReviewId(null);
            } else {
                alert("Could not update the review.");
            }
        } catch (err) {
            console.error("Error updating review:", err);
        }
    };

    /**
     * Starts the editing process for a review
     * @param review 
     */
    const startEditing = (review: Review) => {
        setEditingReviewId(review.id);
        setEditText(review.texto);
        setEditPuntuacion(review.puntuacion);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
                <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                <p className="font-bold text-xl">Loading...</p>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
                <AlertCircle size={64} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-black text-slate-900">Movie not found</h2>
                <button onClick={() => router.back()} className="mt-6 text-blue-600 font-bold hover:underline">
                    Go back
                </button>
            </div>
        );
    }

    /**
     * Calculates the duration text for the movie
     */
    const hours = Math.floor(movie.duracion / 60);
    const minutes = movie.duracion % 60;
    const durationText = `${hours}h ${minutes}m`;
    const releaseDate = new Date(movie.fechaEstreno).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <Navbar />

            {/* Header */}
            <section className="relative bg-slate-900 text-white pb-12 pt-8 px-8 overflow-hidden">
                <div className="absolute inset-0 opacity-20 blur-3xl scale-110">
                    <img
                        src={movie.urlImagen}
                        alt={movie.nombre}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="max-w-6xl mx-auto mb-8 relative z-10">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-sm"
                    >
                        <div className="p-2 rounded-full bg-slate-800/50 group-hover:bg-blue-600 transition-all">
                            <ChevronLeft size={20} />
                        </div>
                        Go back
                    </button>
                </div>

                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 items-start relative z-10">

                    {/* Movie Portrait */}
                    <div className="w-full md:w-72 shrink-0 shadow-2xl rounded-3xl overflow-hidden border-4 border-slate-800 bg-slate-800 aspect-2/3">
                        {movie.urlImagen ? (
                            <img
                                src={movie.urlImagen}
                                alt={movie.nombre}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-xs uppercase font-bold text-slate-500">No image</span>
                            </div>
                        )}
                    </div>

                    {/* Principal Information */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-1 text-yellow-400 font-black">
                                <Star size={20} className="fill-yellow-400" />
                                <span className="text-2xl">{movie.calificacion.toFixed(1)}</span>
                                <span className="text-slate-400 text-sm font-normal">/ 10</span>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">{movie.nombre}</h1>

                        {/* Meta Data */}
                        <div className="flex flex-wrap gap-6 mb-8 text-slate-300">
                            <div className="flex items-center gap-2 text-sm font-bold">
                                <Calendar size={18} className="text-blue-400" />
                                <span>{releaseDate}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold">
                                <Clock size={18} className="text-blue-400" />
                                <span>{durationText}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold">
                                <Tag size={18} className="text-blue-400" />
                                <span>{movie.genero.nombre}</span>
                            </div>
                        </div>

                        <div className="max-w-2xl">
                            <h3 className="text-xl font-black mb-3 text-blue-400 uppercase tracking-widest">Synopsis</h3>
                            <p className="text-slate-200 leading-relaxed text-lg font-medium">
                                {movie.sinopsis}
                            </p>
                        </div>

                        <a
                            className="mt-8 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-900/40 active:scale-95 inline-block"
                            href="#add-review"
                        >
                            Write a review
                        </a>
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <main className="max-w-6xl mx-auto px-8 py-16">
                <div className="flex items-center justify-between mb-10 border-l-8 border-blue-600 pl-6">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="text-blue-600" size={32} />
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Community</h2>
                    </div>
                    <span className="text-slate-400 font-bold">{reviews.length} reviews</span>
                </div>

                <div className="grid gap-8 mb-16">
                    {loadingReviews ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
                    ) : reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.id}>
                                <article className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-200 overflow-hidden shadow-inner">
                                                {review.user.urlImagen ? (
                                                    <img src={`${process.env.NEXT_PUBLIC_API_URL}${review.user.urlImagen}`} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-blue-600">
                                                        <User size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900">{review.user.username}</h4>
                                                <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">User</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {editingReviewId !== review.id && (
                                                <div className="flex gap-1 text-yellow-500 mr-2">
                                                    {[...Array(10)].map((_, i) => (
                                                        <Star key={i} size={14} className={i < review.puntuacion ? "fill-current" : "text-slate-100"} />
                                                    ))}
                                                </div>
                                            )}

                                            {currentUserId === review.user.id && (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => editingReviewId === review.id ? setEditingReviewId(null) : startEditing(review)}
                                                        className={`p-2 rounded-xl transition-all ${editingReviewId === review.id ? 'bg-slate-100 text-slate-600' : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50'}`}
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteReview(review.id)}
                                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {editingReviewId === review.id ? (
                                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="flex gap-1 text-yellow-500">
                                                {[...Array(10)].map((_, i) => (
                                                    <button key={i} onClick={() => setEditPuntuacion(i + 1)}>
                                                        <Star size={20} className={i < editPuntuacion ? "fill-current" : "text-slate-200"} />
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                className="w-full p-4 bg-slate-50 border-2 border-blue-500 rounded-2xl outline-none font-medium text-slate-700 resize-none"
                                                rows={3}
                                            />
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleEditReview(review.id)}
                                                    className="px-6 py-2 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all text-sm"
                                                >
                                                    Save Changes
                                                </button>
                                                <button
                                                    onClick={() => setEditingReviewId(null)}
                                                    className="px-6 py-2 bg-slate-100 text-slate-500 font-black rounded-xl hover:bg-slate-200 transition-all text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-slate-700 leading-relaxed mb-6 font-medium text-lg">"{review.texto}"</p>
                                    )}

                                    <div className="flex items-center gap-6 text-slate-400 text-sm border-t border-slate-50 pt-6">
                                        <button
                                            onClick={() => setExpandedReview(expandedReview === review.id ? null : review.id)}
                                            className={`flex items-center gap-2 transition-colors font-black ${expandedReview === review.id ? 'text-blue-600' : 'hover:text-blue-600'}`}
                                        >
                                            <MessageSquare size={18} />
                                            <span>Comments</span>
                                        </button>
                                    </div>

                                    {expandedReview === review.id && (
                                        <div className="mt-6 pt-6 border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <ReviewComments
                                                reviewId={review.id}
                                                currentUserId={currentUserId}
                                            />
                                        </div>
                                    )}
                                </article>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white p-12 rounded-4xl text-center border-2 border-dashed border-slate-200 text-slate-400 font-bold">
                            Be the first to write a review about this movie.
                        </div>
                    )}
                </div>

                <section id="add-review">
                    <AddReviewForm movie={movie} onReviewAdded={handleReviewAdded} />
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
