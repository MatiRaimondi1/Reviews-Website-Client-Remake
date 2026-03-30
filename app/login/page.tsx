"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, AlertCircle, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

/**
 * Login page component
 * @returns 
 */
export default function LoginPage() {
    /**
     * State for the login form data
     */
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    /**
     * State for the loading status
     */
    const [isLoading, setIsLoading] = useState(false);

    const { login, error } = useAuth();

    /**
     * Handles the form submission for user login
     * @param e The form event
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login({ email, password });
            toast.success("Welcome back!", {
                description: "You have logged in successfully."
            });
        } catch (error: any) {
            toast.error("Login failed", {
                description: error.message || "Please check your credentials."
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 w-fit font-bold text-sm"
                >
                    <ChevronLeft size={18} />
                    Home
                </Link>

                <h2 className="text-center text-3xl font-black text-slate-900">Sign In</h2>

                <form className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-slate-100" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Signing in...
                            </>
                        ) : (
                            "Log In"
                        )}
                    </button>

                    <div className="text-center">
                        <span className="text-sm text-slate-600">
                            Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Register</a>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
}
