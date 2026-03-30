"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Lock, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

/**
 * Register page component
 * @returns 
 */
export default function RegisterPage() {
    /**
     * State for the registration form data
     */
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });

    /**
     * State for the loading status
     */
    const [isLoading, setIsLoading] = useState(false);

    const { register, error } = useAuth();

    /**
     * Handles the form submission for user registration
     * @param e The form event
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await register(formData);
            toast.success("Account created!", {
                description: "Welcome to the community."
            });
        } catch (error: any) {
            toast.error("Registration error", {
                description: error.message || "Could not create your account."
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

                <h2 className="text-center text-3xl font-black text-slate-900">Create Account</h2>

                <form className="mt-8 space-y-5 bg-white p-8 rounded-2xl shadow-xl border border-slate-100" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-400" size={20} />
                            <input
                                type="text"
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900"
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                            <input
                                type="password"
                                required
                                minLength={8}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        disabled={isLoading}
                        className="w-full py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Creating account...
                            </>
                        ) : (
                            "Register"
                        )}
                    </button>

                    <div className="text-center">
                        <span className="text-sm text-slate-600">
                            Already have an account? <a href="/login" className="text-blue-600 hover:underline">Log in</a>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
}
