"use client";

import { useState, useEffect } from 'react';
import { Users, Plus, Search, Globe, X, Loader2, Calendar, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

/**
 * Interface for the Group data structure
 */
interface Grupo {
    id: number;
    nombre: string;
    descripcion: string;
    createdAt: string;
    miembrosCount?: number;
    isPublico?: boolean;
}

export default function GroupsPage() {
    /**
     * State for the groups list
     */
    const [groups, setGroups] = useState<Grupo[]>([]);
    const [loading, setLoading] = useState(true);

    /**
     * State for the search term
     */
    const [searchTerm, setSearchTerm] = useState('');

    /**
     * State for the create group modal
     */
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    /**
     * Fetches the list of groups when the component mounts
     */
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grupos`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                setGroups(data);
            } catch (err) {
                console.error("Error loading groups: ", err);
            } finally {
                setLoading(false);
            }
        };
        fetchGroups();
    }, []);

    /**
     * Filters the groups based on the search term
     */
    const filteredGroups = groups.filter(g =>
        g.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    /**
     * Handles the creation of a new group
     * @param e 
     */
    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg(null);

        try {
            const token = localStorage.getItem('access_token');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grupos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nombre, descripcion }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    throw new Error(data.message || 'You already have a group or that name is already taken');
                }
                throw new Error(data.message || 'Error creating group');
            }

            setGroups(prev => [data, ...prev]);
            setIsModalOpen(false);
            setNombre('');
            setDescripcion('');
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Navbar */}
            <Navbar />

            {/* Header */}
            <header className="bg-white border-b border-slate-200 py-12 px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                                <span className="text-blue-600">Community</span> groups
                            </h1>
                            <p className="text-slate-500 mt-2 text-lg font-medium">
                                Join discussions, share recommendations, and connect with the community.
                            </p>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 shrink-0"
                        >
                            <Plus size={20} />
                            Create new group
                        </button>
                    </div>

                    <div className="mt-10 relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search groups by name or topic..."
                            className="w-full pl-12 pr-4 py-4 bg-slate-100 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-2xl outline-none transition-all text-slate-900 font-bold"
                        />
                    </div>
                </div>
            </header>

            {/* Groups Grid */}
            <main className="max-w-7xl mx-auto px-8 py-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                        <p className="text-slate-500 font-bold">Loading communities...</p>
                    </div>
                ) : filteredGroups.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredGroups.map((grupo) => (
                            <Link key={grupo.id} href={`/groups/${grupo.id}`}>
                                <article className="bg-white rounded-4xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer flex flex-col h-full">
                                    {/* Card Header */}
                                    <div className="h-24 bg-slate-900 p-6 flex items-end justify-between relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl -mr-16 -mt-16"></div>
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-lg relative z-10">
                                            <Users size={24} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-800 px-3 py-1 rounded-full relative z-10">
                                            ID: {grupo.id}
                                        </span>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-8 flex-1 flex flex-col">
                                        <h3 className="text-2xl font-black mb-3 group-hover:text-blue-600 transition-colors text-slate-900 leading-tight">
                                            {grupo.nombre}
                                        </h3>
                                        <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6 flex-1">
                                            {grupo.descripcion}
                                        </p>

                                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between text-slate-400">
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1.5 text-xs font-bold">
                                                    <Globe size={14} className="text-blue-500" /> Public
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs font-bold">
                                                    <Calendar size={14} />
                                                    {new Date(grupo.createdAt).getFullYear()}
                                                </span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <Plus size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                        <Users size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-black text-slate-900">No groups found</h3>
                        <p className="text-slate-500 font-medium">Try searching with a different name or create your own.</p>
                    </div>
                )}
            </main>

            {/* Creation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !isSubmitting && setIsModalOpen(false)}></div>

                    <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in duration-200">
                        <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-slate-900">New Group</h2>
                            <button onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleCreateGroup} className="p-10 space-y-6">
                            {errorMsg && (
                                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold">
                                    <AlertCircle size={18} />
                                    {errorMsg}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">Group name</label>
                                <input
                                    required
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Group name..."
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Describe what makes this group special..."
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all resize-none font-medium text-slate-900"
                                ></textarea>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-slate-50 text-slate-900">
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 text-slate-500 font-black hover:bg-slate-50 rounded-2xl transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-2 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 active:scale-95 transition-all disabled:bg-slate-300 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        "Create Group"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Footer */}
            <Footer />
        </div>
    );
}
