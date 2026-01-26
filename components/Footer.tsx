import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand section */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="text-2xl font-bold text-rose-600 font-serif mb-4 block">
                            RaikanBersama<span className="text-gray-400">.xyz</span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Platform jemputan digital premium untuk majlis perkahwinan dan pelbagai acara. Bina kad digital anda dengan mudah dan pantas.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            <li><Link to="/catalog" className="text-gray-500 hover:text-rose-600 transition text-sm">Catalog Design</Link></li>
                            <li><Link to="/pricing" className="text-gray-500 hover:text-rose-600 transition text-sm">Pakej & Harga</Link></li>
                            <li><Link to="/tutorial" className="text-gray-500 hover:text-rose-600 transition text-sm">Cara Guna</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Sokongan</h4>
                        <ul className="space-y-4">
                            <li><Link to="/faq" className="text-gray-500 hover:text-rose-600 transition text-sm">Soalan Lazim (FAQ)</Link></li>
                            <li><Link to="/contact" className="text-gray-500 hover:text-rose-600 transition text-sm">Hubungi Kami</Link></li>
                            <li><a href="#" className="text-gray-500 hover:text-rose-600 transition text-sm">Terma & Syarat</a></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Social</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition">
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition">
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition">
                                <i className="fab fa-tiktok"></i>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-50 pt-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                    <p className="text-gray-400 text-xs mb-4 md:mb-0">
                        &copy; 2026 EEE LAB VISUAL (002278324-V). All right reserved
                    </p>
                    <div className="flex space-x-6">
                        <span className="text-gray-300 text-[10px] font-bold uppercase tracking-widest">Premium Digital Invitation</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
