"use client";

import { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, MessageSquare, UserPlus, Loader2, AlertCircle, CheckCircle2, User, Crown, Film, Hash, Star, LogOut, Trash2, Edit, ExternalLink, Calendar, CalendarOff, X, Plus } from 'lucide-react';
import GroupReviewPoster from '@/components/GroupReviewPoster';
import { jwtDecode } from 'jwt-decode';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * Interface for the Group detail data structure
 */
interface GrupoDetail {
    id: number;
    nombre: string;
    descripcion: string;
    createdAt: string;
    lider?: { id: number; username: string };
    miembros?: { id: number; username: string }[];
}

/**
 * Interface for the Member data structure
 */
interface Miembro {
    id: number;
    nombre: string;
    urlImagen?: string | null;
    rol: 'lider' | 'miembro';
}

/**
 * Interface for the Review data structure
 */
interface Review {
    id: number;
    texto: string;
    puntuacion: number;
    user: { id: number, username: string, urlImagen?: string | null };
    pelicula: { nombre: string; id: number };
}

/**
 * GroupDetailPage component
 * @param param0 
 * @returns 
 */
export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const router = useRouter();

    const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);

    /**
     * State for the group details
     */
    const [grupo, setGrupo] = useState<GrupoDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    /**
     * State for the group meeting
     */
    const [reunion, setReunion] = useState<{ fecha: string; link: string } | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newFecha, setNewFecha] = useState('');
    const [newLink, setNewLink] = useState('');

    /**
     * State for the group membership and related actions
     */
    const [joining, setJoining] = useState(false);
    const [joined, setJoined] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    /**
     * State for the group members
     */
    const [miembros, setMiembros] = useState<Miembro[]>([]);
    const [loadingMiembros, setLoadingMiembros] = useState(true);

    /**
     * State for the group reviews
     */
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);

    /**
     * State for editing reviews
     */
    const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const [editPuntuacion, setEditPuntuacion] = useState(0);

    /**
     * State for the user's membership status and role
     */
    const [isMember, setIsMember] = useState(false); // Estado de membresía
    const [userRole, setUserRole] = useState<string | null>(null);

    /**
     * State for the loading status of user actions
     */
    const [actionLoading, setActionLoading] = useState(false);

    /**
     * Gets the user ID from the JWT token
     * @returns The user ID or null if not found
     */
    const getUserId = () => {
        const token = localStorage.getItem('access_token');
        if (!token) return null;
        try {
            const decoded: any = jwtDecode(token);
            return decoded.sub;
        } catch { return null; }
    };

    /**
     * Checks the user's membership status in the group
     */
    const checkMembership = useCallback(async () => {
        const userId = getUserId();
        if (!userId) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grupos/${id}/membership/${userId}`);
            const data = await res.json();
            setIsMember(data.enGrupo === true || data.enGrupo === "true");
            setUserRole(data.rol);
        } catch (err) {
            console.error("Error verifying membership:", err);
        }
    }, [id]);

    /**
     * Fetches the reviews for the group
     */
    const fetchGroupReviews = useCallback(async () => {
        try {
            setLoadingReviews(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/grupo/${id}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setReviews(data);
        } catch (err) {
            console.error("Error loading reviews:", err);
        } finally {
            setLoadingReviews(false);
        }
    }, [id]);

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
     * Fetches the details for the group
     */
    useEffect(() => {
        const fetchGroupDetail = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grupos/${id}`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                setGrupo(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchGroupDetail();
    }, [id]);

    useEffect(() => {
        const fetchReunion = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reuniones`, { // Ajusta la ruta según tu controller
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setReunion(data);
                }
            } catch (error) {
                console.error("Error cargando reunión:", error);
            }
        };
        fetchReunion();
    }, []);

    /**
     * Fetches the reviews for the group
     */
    useEffect(() => {
        fetchGroupReviews();
    }, [fetchGroupReviews]);

    /**
     * Fetches the members for the group
     */
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grupos/${id}/members`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                setMiembros(data);
            } catch (err) {
                console.error("Error loading members:", err);
            } finally {
                setLoadingMiembros(false);
            }
        };
        fetchMembers();
    }, [id]);

    /**
     * Loads the initial data for the group
     */
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grupos/${id}`).then(res => res.json()).then(setGrupo),
                checkMembership()
            ]);
            setLoading(false);
        };
        loadInitialData();
    }, [id, checkMembership]);

    /**
     * Handles the user joining the group
     */
    const handleJoin = async () => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grupos/${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setIsMember(true);
                window.location.reload();
            }
        } catch (err) { console.error(err); }
        finally { setActionLoading(false); }
    };

    /**
     * Handles the user leaving the group
     * @returns 
     */
    const handleLeave = async () => {
        if (!confirm("Are you sure you want to leave this group?")) return;

        setActionLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grupos/${id}/leave`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setIsMember(false);
                setUserRole(null);
                router.push('/groups');
            }
        } catch (err) { console.error(err); }
        finally { setActionLoading(false); }
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
                setReviews(prev => prev.map(r =>
                    r.id === reviewId ? { ...r, texto: editText, puntuacion: editPuntuacion } : r
                ));
                setEditingReviewId(null);
            } else {
                alert("Error while updating the review");
            }
        } catch (err) {
            console.error("Error:", err);
        }
    };

    /**
     * Starts the editing process for a review
     * @param review 
     */
    const startEditing = (review: any) => {
        setEditingReviewId(review.id);
        setEditText(review.texto);
        setEditPuntuacion(review.puntuacion);
    };

    /**
     * Handles the creation of a group meeting
     */
    const handleCreateReunion = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reuniones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ fecha: newFecha, link: newLink })
            });

            if (res.ok) {
                const data = await res.json();
                setReunion(data);
                setIsCreating(false);
                setNewFecha('');
                setNewLink('');
            }
        } catch (error) {
            console.error("Error while creating meeting:", error);
        }
    };

    /**
     * Handles the deletion of a group meeting
     * @returns 
     */
    const handleDeleteReunion = async () => {
        if (!confirm("Are you sure you want to delete this meeting?")) return;
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reuniones`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setReunion(null);
        } catch (error) {
            console.error("Error while deleting meeting:", error);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="font-black text-xl tracking-tight">Loading...</p>
        </div>
    );

    if (error || !grupo) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-slate-900">
            <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 text-center max-w-md">
                <AlertCircle size={64} className="text-red-500 mx-auto mb-6" />
                <h1 className="text-3xl font-black mb-4">Group not found</h1>
                <p className="text-slate-500 font-medium mb-8">It seems this group has been dissolved or the link is incorrect.</p>
                <button
                    onClick={() => router.push('/grupos')}
                    className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all"
                >
                    Go back
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />

            {/* Header */}
            <header className="bg-white border-b border-slate-200 pt-10 pb-16 px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mt-10">
                        <div className="flex-1">
                            <h1 className="text-6xl font-black tracking-tighter mb-4 text-slate-900">{grupo.nombre}</h1>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl">{grupo.descripcion}</p>

                            {/* Meeting Section */}
                            <div className="mt-8 p-6 bg-slate-50 rounded-4xl border border-slate-100 inline-block min-w-87.5 relative overflow-hidden">
                                {isCreating ? (
                                    <div className="space-y-3 animate-in zoom-in-95 duration-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">New Meeting</p>
                                            <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <input
                                            type="datetime-local"
                                            value={newFecha}
                                            onChange={(e) => setNewFecha(e.target.value)}
                                            className="w-full p-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                                        />
                                        <input
                                            type="url"
                                            placeholder="Meeting Link (Google Meet, Zoom...)"
                                            value={newLink}
                                            onChange={(e) => setNewLink(e.target.value)}
                                            className="w-full p-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                                        />
                                        <button
                                            onClick={handleCreateReunion}
                                            className="w-full py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition-all"
                                        >
                                            SCHEDULE MEETING
                                        </button>
                                    </div>
                                ) : reunion ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-slate-900">
                                                <div className="p-2 bg-blue-600 rounded-lg text-white">
                                                    <Calendar size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-1">Next Meeting</p>
                                                    <p className="font-bold text-lg">
                                                        {new Date(reunion.fecha).toLocaleDateString('es-ES', {
                                                            weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            {userRole === 'lider' && (
                                                <button
                                                    onClick={handleDeleteReunion}
                                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        <a href={reunion.link} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center justify-between gap-4 w-full px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all group">
                                            <span className="text-sm font-black uppercase tracking-tight">Join Meeting</span>
                                            <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </a>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-8 py-2">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <div className="p-2 bg-slate-200 rounded-lg">
                                                <CalendarOff size={18} />
                                            </div>
                                            <p className="text-sm font-bold italic">No meeting planned</p>
                                        </div>
                                        {userRole === 'lider' && (
                                            <button
                                                onClick={() => setIsCreating(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-black rounded-xl hover:bg-blue-100 transition-all border border-blue-100"
                                            >
                                                <Plus size={14} /> Create
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* Feedback Message */}
                            {message && (
                                <div className={`mt-6 flex items-center gap-2 font-bold text-sm animate-in fade-in slide-in-from-left-4 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                    {message.text}
                                </div>
                            )}
                        </div>

                        {/* Join/Leave Button */}
                        <div className="flex gap-4 w-full md:w-auto">
                            {isMember ? (
                                <button
                                    onClick={handleLeave}
                                    disabled={actionLoading}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition-all border border-red-100"
                                >
                                    {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <LogOut size={20} />}
                                    Leave Group
                                </button>
                            ) : (
                                <button
                                    onClick={handleJoin}
                                    disabled={actionLoading}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
                                >
                                    {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                                    Join Group
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-6xl mx-auto px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Group Reviews */}
                    <div className="lg:col-span-2 space-y-8">
                        <GroupReviewPoster
                            grupoId={Number(id)}
                            onReviewPublished={() => fetchGroupReviews()}
                        />
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900">
                                <MessageSquare className="text-blue-600" size={28} />
                                Activity of the <span className="text-blue-600">Group</span>
                            </h2>
                        </div>

                        {loadingReviews ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="animate-spin text-blue-600" size={32} />
                            </div>
                        ) : reviews.length > 0 ? (
                            <div className="grid gap-6">
                                {reviews.map((review) => (
                                    <div key={review.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                {/* User Avatar */}
                                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black">
                                                    {review.user.urlImagen ? (
                                                        <img
                                                            src={`${process.env.NEXT_PUBLIC_API_URL}${review.user.urlImagen}`}
                                                            alt={review.user.username}
                                                            className="w-11 h-11 rounded-xl object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                                            <User size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">{review.user.username}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Member of the group</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {editingReviewId !== review.id && (
                                                    <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100 mr-2">
                                                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                                        <span className="text-sm font-black text-yellow-700">{review.puntuacion}</span>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                {currentUserId === review.user.id && (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => editingReviewId === review.id ? setEditingReviewId(null) : startEditing(review)}
                                                            className={`p-2 rounded-xl transition-all ${editingReviewId === review.id ? 'bg-blue-100 text-blue-600' : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50'}`}
                                                            title="Edit review"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteReview(review.id)}
                                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                            title="Delete review"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Edit Mode */}
                                        {editingReviewId === review.id ? (
                                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                                <div className="flex gap-1 text-yellow-500">
                                                    {[...Array(10)].map((_, i) => (
                                                        <button key={i} onClick={() => setEditPuntuacion(i + 1)} type="button">
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
                                                        Save
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
                                            <p className="text-slate-600 font-medium leading-relaxed mb-6 italic">
                                                "{review.texto}"
                                            </p>
                                        )}

                                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-blue-600">
                                                <Film size={16} />
                                                <span className="text-xs font-black uppercase tracking-tight">
                                                    {review.pelicula.nombre}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <Hash size={32} className="text-slate-300" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">Silence in the set</h3>
                                <p className="text-slate-500 font-medium">No one has published reviews in this group yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Members */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black flex items-center gap-2">
                                    <Users size={22} className="text-blue-600" />
                                    Members
                                    <span className="ml-2 px-2.5 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
                                        {miembros.length}
                                    </span>
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {loadingMiembros ? (
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="animate-spin text-slate-300" />
                                    </div>
                                ) : miembros.length > 0 ? (
                                    miembros.map((miembro) => (
                                        <div
                                            key={miembro.id}
                                            className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Avatar */}
                                                <div className="relative">
                                                    {miembro.urlImagen ? (
                                                        <img
                                                            src={`${process.env.NEXT_PUBLIC_API_URL}${miembro.urlImagen}`}
                                                            alt={miembro.nombre}
                                                            className="w-11 h-11 rounded-xl object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                                            <User size={20} />
                                                        </div>
                                                    )}

                                                    {/* Badge */}
                                                    {miembro.rol === 'lider' && (
                                                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-white p-1 rounded-lg shadow-sm border-2 border-white">
                                                            <Crown size={10} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                                        {miembro.nombre}
                                                    </p>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                        {miembro.rol === 'lider' ? 'Founder' : 'User'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Optional status indicator */}
                                            <div className="w-2 h-2 rounded-full bg-green-400" title="Online" />
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-400 text-sm font-medium py-4">
                                        There are no members yet.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
