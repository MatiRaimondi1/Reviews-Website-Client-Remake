"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  User as UserIcon, Settings, MessageSquare, Heart, Star,
  Clock, LogOut, Edit3, Trash2, ChevronRight, Loader2,
  Home
} from 'lucide-react';
import ProfileImageUpload from '@/components/ProfileImageUpload'; // Asegúrate de crear este archivo
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface UserData {
  id: number;
  username: string;
  email: string;
  urlImagen: string | null;
  rol: string;
}

interface UserReview {
  id: number;
  texto: string;
  puntuacion: number;
  pelicula: { id: number; nombre: string; };
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem('access_token');

    // Si no hay token, no podemos cargar nada. Quitamos el loading y salimos.
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const userId = decoded.sub;

      // Ejecutamos las peticiones con manejo de errores individual para que 
      // si una falla (ej. 404), la otra pueda seguir.
      const [userRes, reviewsRes] = await Promise.allSettled([
        fetch(`http://localhost:3000/api/users/${userId}`),
        fetch(`http://localhost:3000/api/reviews/user/${userId}`)
      ]);

      // Procesar resultado del Usuario
      if (userRes.status === 'fulfilled' && userRes.value.ok) {
        const userData = await userRes.value.json();
        setUser(userData);
      }

      // Procesar resultado de Reseñas
      if (reviewsRes.status === 'fulfilled') {
        if (reviewsRes.value.ok) {
          const reviewsData = await reviewsRes.value.json();
          setReviews(reviewsData);
        } else {
          // Si es 404 u otro error, asumimos lista vacía
          setReviews([]);
        }
      }

    } catch (err) {
      console.error("Error crítico en el dashboard:", err);
    } finally {
      // ESTA LÍNEA ES VITAL: Se ejecuta siempre, pase lo que pase.
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <><div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 pt-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-6">
            <ProfileImageUpload currentImage={user?.urlImagen || undefined} />
            <div>
              <h1 className="text-3xl font-black text-slate-900 leading-tight">
                Hello, <span className="text-blue-600">{user?.username}</span>
              </h1>
              <p className="text-slate-500 font-medium">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-6 py-3 bg-slate-50 text-slate-700 font-bold rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center gap-2 border border-transparent hover:border-blue-100"
            >
              <Home size={18} />
              <span>Home</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all flex items-center gap-2 border border-red-100"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 text-slate-900">
          {[
            { label: 'Reviews', value: reviews.length, icon: <MessageSquare className="text-blue-600" />, color: 'bg-blue-50' },
            {
              label: 'Average',
              value: reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.puntuacion, 0) / reviews.length).toFixed(1) : '0',
              icon: <Star className="text-yellow-500" />,
              color: 'bg-yellow-50'
            },
            { label: 'Role', value: user?.rol ? user.rol.charAt(0).toUpperCase() + user.rol.slice(1) : 'N/A', icon: <Clock className="text-emerald-500" />, color: 'bg-emerald-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-4 group hover:border-blue-200 transition-all">
              <div className={`p-4 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Activity Table */}
        <section className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30 text-slate-900">
            <h2 className="text-xl font-black">Review Activity</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase text-slate-400 font-black tracking-[0.2em] border-b border-slate-100">
                  <th className="px-8 py-6">Movie</th>
                  <th className="px-8 py-6">Rating</th>
                  <th className="px-8 py-6">Comment</th>
                  <th className="px-8 py-6 text-right text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6 font-bold text-slate-900">{review.pelicula.nombre}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1 text-yellow-500 font-black">
                          <Star size={16} className="fill-current" />
                          <span className="text-slate-900">{review.puntuacion.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-500 font-medium max-w-xs truncate">
                        "{review.texto}"
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={18} /></button>
                          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-24 text-center text-slate-400 font-bold">
                      You haven't written any reviews yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div><Footer />
    </>
  );
}