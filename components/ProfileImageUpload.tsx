"use client";

import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';

/**
 * ProfileImageUpload component
 * @param param0 
 * @returns 
 */
export default function ProfileImageUpload({ currentImage }: { currentImage?: string }) {
    /**
     * State for the uploading status and preview image
     */
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Handles the file change event
     * @param e 
     * @returns 
     */
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile-image`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) throw new Error("Error while uploading image");

            window.location.reload();
        } catch (err) {
            alert("Image could not be uploaded.");
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative group">
            {/* Avatar Content */}
            <div className="w-24 h-24 rounded-3xl bg-slate-200 border-4 border-white shadow-xl overflow-hidden relative">
                {preview || currentImage ? (
                    <img
                        src={preview || `${process.env.NEXT_PUBLIC_API_URL}${currentImage}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-black text-2xl">
                        {/* Initial Placeholder */}
                        U
                    </div>
                )}

                {/* loading/Hover Overlay */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-wait"
                >
                    {uploading ? (
                        <Loader2 className="text-white animate-spin" />
                    ) : (
                        <Camera className="text-white" size={24} />
                    )}
                </button>
            </div>

            {/* Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
        </div>
    );
}
