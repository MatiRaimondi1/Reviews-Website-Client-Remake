"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Film, User, LogOut, ChevronDown, Users } from 'lucide-react';
import GenresDropdown from './GenresDropdown';

/**
 * Navbar Component
 * @returns 
 */
export default function Navbar() {
    const { user, logout } = useAuth();

    /**
     * State for the dropdown menu
     */
    const [menuOpen, setMenuOpen] = useState(false);

    const pathname = usePathname();

    const linkStyle = (path: string) =>
        `flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${pathname === path
            ? 'bg-blue-50 text-blue-600'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`;

    return (
        <nav className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">

                {/* Logo and Navigation */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 group mr-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-blue-200">
                            <Film className="text-white" size={20} />
                        </div>
                        <span className="text-xl font-black text-blue-900 tracking-tighter">MovieRate</span>
                    </Link>

                    {/* Main Navigation Buttons */}
                    <div className="hidden md:flex items-center gap-2">
                        <GenresDropdown />
                        <Link href="/groups" className={linkStyle('/groups')}>
                            <Users size={18} />
                            Groups
                        </Link>
                    </div>
                </div>

                {/* Profile Section */}
                <div className="flex items-center gap-6">
                    {user ? (
                        <div className="flex items-center gap-5">
                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className="flex items-center gap-3 p-1 pl-3 pr-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-all"
                                >
                                    <span className="text-sm font-bold text-slate-700">{user.username}</span>
                                    <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 overflow-hidden shadow-inner">
                                        {user.urlImagen ? (
                                            <img src={`${process.env.NEXT_PUBLIC_API_URL}${user.urlImagen}`} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-blue-600">
                                                <User size={16} />
                                            </div>
                                        )}
                                    </div>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {menuOpen && (
                                    <div className="absolute right-0 mt-3 w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-blue-900/10 py-2 z-50 animate-in fade-in zoom-in duration-150">
                                        <div className="px-4 py-2 border-b border-slate-50 mb-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">My account</p>
                                        </div>
                                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                            <User size={18} /> Profile
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut size={18} /> Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link href="/login" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                                Sign In
                            </Link>
                            <Link href="/register" className="px-5 py-2.5 text-sm bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95 transition-all">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
