import { Github, Linkedin } from 'lucide-react';

/**
 * Footer component
 * @returns 
 */
export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-400 py-12 px-8 mt-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">

                {/* Copyright */}
                <div className="space-y-1 text-center">
                    <p className="text-sm font-medium text-slate-300">
                        © 2026 Matias Raimondi
                    </p>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-6">
                    <a
                        href="https://github.com/MatiRaimondi1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"
                        aria-label="GitHub"
                    >
                        <Github size={20} />
                    </a>
                    <a
                        href="https://www.linkedin.com/in/mat%C3%ADas-raimondi/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition-colors p-2 hover:bg-slate-800 rounded-full"
                        aria-label="LinkedIn"
                    >
                        <Linkedin size={20} />
                    </a>
                </div>

            </div>
        </footer>
    );
}
