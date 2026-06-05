import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    const socials = [
        {
            label: 'Facebook',
            href: 'https://www.facebook.com/people/RaikanBersama/61587348694685/',
            icon: (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M22 12.06C22 6.48 17.52 2 12 2S2 6.48 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.47h-1.25c-1.24 0-1.63.78-1.63 1.56v1.88h2.77l-.44 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
                </svg>
            )
        },
        {
            label: 'Instagram',
            href: 'https://www.instagram.com/raikanbersamaxyz/',
            icon: (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <path d="M17.5 6.5h.01" strokeLinecap="round" />
                </svg>
            )
        },
        {
            label: 'Threads',
            href: 'https://www.threads.com/@raikanbersamaxyz',
            icon: (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 21c-4.7 0-7.5-3.2-7.5-8.8S7.3 3 12.1 3c3.8 0 6.4 2 7.1 5.3" strokeLinecap="round" />
                    <path d="M8.7 12.4c.7-1.1 1.9-1.7 3.6-1.7 2.2 0 3.8 1.1 3.8 3.1 0 1.9-1.4 3.2-3.8 3.2-2.1 0-3.5-1-3.5-2.5 0-1.7 1.7-2.6 4.4-2.3 4.2.4 6.3 2.2 6.3 5.1" strokeLinecap="round" />
                </svg>
            )
        }
    ];

    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand section */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="inline-block group relative mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="relative h-12 w-12 rounded-full overflow-hidden border border-gray-100 shadow-inner">
                                    <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_15px_rgba(0,0,0,0.15)] rounded-full"></div>
                                    <img
                                        src="/logo.png"
                                        alt="RaikanBersama Logo"
                                        className="h-full w-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                                <span className="text-lg font-serif font-bold text-gray-900 tracking-tight">
                                    RaikanBersama.xyz
                                </span>
                            </div>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Platform jemputan digital premium RaikanBersama.xyz untuk majlis perkahwinan dan pelbagai acara.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            <li><Link to="/catalog" className="text-gray-500 hover:text-rose-600 transition text-sm">Catalog Design</Link></li>
                            <li><Link to="/pricing" className="text-gray-500 hover:text-rose-600 transition text-sm">Pakej & Harga</Link></li>
                            <li><Link to="/tutorial" className="text-gray-500 hover:text-rose-600 transition text-sm">Tutorial</Link></li>
                            <li><Link to="/affiliates" className="text-gray-500 hover:text-rose-600 transition text-sm font-bold border-b border-rose-100">Affiliate Program</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Sokongan</h4>
                        <ul className="space-y-4">
                            <li><Link to="/faq" className="text-gray-500 hover:text-rose-600 transition text-sm">Soalan Lazim (FAQ)</Link></li>
                            <li><Link to="/contact" className="text-gray-500 hover:text-rose-600 transition text-sm">Hubungi Kami</Link></li>
                            <li><Link to="/terms" className="text-gray-500 hover:text-rose-600 transition text-sm">Terma & Syarat</Link></li>
                            <li><Link to="/privacy" className="text-gray-500 hover:text-rose-600 transition text-sm">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Social</h4>
                        <div className="flex space-x-4">
                            {socials.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.label}
                                    className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                        <p className="mt-4 text-xs text-gray-400">Ikuti update katalog, tutorial dan contoh kad terkini.</p>
                    </div>
                </div>

                <div className="border-t border-gray-50 pt-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                    <p className="text-gray-400 text-xs mb-4 md:mb-0">
                        &copy; 2026 EEE LAB VISUAL (002278324-V). All right reserved
                    </p>
                    <div className="flex space-x-6">
                        <span className="text-gray-300 text-[10px] font-bold uppercase tracking-widest">Digital E-Invitation</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
