"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";

/**
 * Interface for the User object
 */
interface User {
    id: number;
    username: string;
    email: string;
    urlImagen?: string;
    token: string;
}

/**
 * Interface for the authentication context
 */
interface AuthContextType {
    user: User | null;
    login: (credentials: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    error: string | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

/**
 * AuthProvider component
 * @param param0
 * @returns 
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    /**
     * State for the authenticated user
     */
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const router = useRouter();

    /**
     * Fetches user data based on the provided token
     * @param token
     */
    const fetchUserData = async (token: string) => {
        try {
            const decoded: any = jwtDecode(token);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${decoded.sub}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setUser({ ...data, token });
            }
        } catch (err) {
            console.error("Error loading user data", err);
            logout();
        } finally {
            setLoading(false);
        }
    };

    /**
     * Loads user data on component mount
     */
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchUserData(token);
        } else {
            setLoading(false);
        }
    }, []);

    /**
     * Registers a new user
     * @param data 
     */
    const register = async (data: any) => {
        setError(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Error while registering');

            router.push('/login');
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    /**
     * Logs in a user
     * @param credentials
     */
    const login = async (credentials: any) => {
        setError(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.message || 'Invalid credentials');

            const token = result.access_token;

            localStorage.setItem('access_token', token);
            document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax`;

            const decoded: any = jwtDecode(token);

            const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${decoded.sub}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const userData = await userRes.json();

            if (!userRes.ok) throw new Error(userData.message || 'Error while fetching user data');

            setUser({
                ...userData,
                token: token
            });

            router.push('/');
        } catch (err: any) {
            setError(err.message);
            localStorage.removeItem('access_token');
            document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            throw err;
        }
    };

    /**
     * Logs out the current user
     */
    const logout = () => {
        localStorage.removeItem('access_token');
        document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
