"use client";

import { useEffect, useState, useCallback } from 'react';
import { MessageSquare, Send, Trash2, Loader2, User as UserIcon } from 'lucide-react';

/**
 * Interface for the Comment object
 */
interface Comment {
    id: number;
    texto: string;
    user: { id: number; username: string; urlImagen?: string };
}

/**
 * ReviewComments component
 * @param param0 
 * @returns 
 */
export default function ReviewComments({ reviewId, currentUserId }: { reviewId: number, currentUserId?: number }) { 
    /**
     * State for the comments and loading status
     */    
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    
    /**
     * State for the new comment and sending status
     */
    const [newComment, setNewComment] = useState("");
    const [sending, setSending] = useState(false);

    /**
     * Fetches the comments for the given review
     */
    const fetchComments = useCallback(async () => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comentarios/${reviewId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            } else if (res.status === 404) {
                setComments([]);
            }
        } catch (err) {
            console.error("Error while fetching comments:", err);
        } finally {
            setLoading(false);
        }
    }, [reviewId]);

    useEffect(() => { fetchComments(); }, [fetchComments]);

    /**
     * Handles posting a new comment
     * @param e 
     * @returns 
     */
    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSending(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comentarios/${reviewId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ texto: newComment })
            });

            if (res.ok) {
                setNewComment("");
                fetchComments();
            }
        } catch (err) {
            alert("Comment could not be posted.");
        } finally {
            setSending(false);
        }
    };

    /**
     * Handles deleting a comment
     * @param commentId 
     * @returns 
     */
    const handleDeleteComment = async (commentId: number) => {
        if (!confirm("Delete Comment?")) return;
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comentarios/${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchComments();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="mt-4 bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MessageSquare size={14} /> Comments ({comments.length})
            </h4>

            {/* Comments List */}
            <div className="space-y-4 mb-6">
                {loading ? (
                    <Loader2 className="animate-spin text-blue-600 mx-auto" size={20} />
                ) : comments.length > 0 ? (
                    comments.map((c) => (
                        <div key={c.id} className="flex gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 overflow-hidden border border-blue-200">
                                {c.user.urlImagen ? (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}${c.user.urlImagen}`}
                                        alt={c.user.username}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <UserIcon size={14} />
                                )}
                            </div>
                            <div className="flex-1 bg-white p-3 rounded-2xl border border-slate-100 relative">
                                <p className="text-xs font-bold text-blue-600 mb-1">@{c.user.username}</p>
                                <p className="text-sm text-slate-700">{c.texto}</p>

                                {currentUserId === c.user.id && (
                                    <button
                                        onClick={() => handleDeleteComment(c.id)}
                                        className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-slate-400 italic">Be the first to comment...</p>
                )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="relative">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-blue-400 transition-all"
                />
                <button
                    disabled={sending || !newComment.trim()}
                    className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
                >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
            </form>
        </div>
    );
}
