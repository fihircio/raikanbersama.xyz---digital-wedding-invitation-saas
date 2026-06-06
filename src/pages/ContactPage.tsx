import React, { useState } from 'react';
import { buildApiUrl } from '../config';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import SEO from '../../components/SEO';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(buildApiUrl('/contacts'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setIsSuccess(true);
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                setError(data.error || 'Failed to send message. Please try again.');
            }
        } catch (err) {
            setError('An error occurred. Please check your connection.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pt-32 pb-20 min-h-screen bg-white flex flex-col">
            <SEO
                title="Hubungi Kami"
                description="Ada soalan atau perlukan bantuan? Hubungi pasukan RaikanBersama.xyz. Kami sedia membantu anda."
            />
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4 italic">
                        Hubungi Kami
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Kami sedia membantu anda. Sila isi borang di bawah atau hubungi kami melalui maklumat yang disediakan.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Contact Form */}
                    <div className="bg-gray-50 rounded-[3rem] p-10 border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-xl">
                        {isSuccess ? (
                            <div className="text-center py-16 animate-scale-in">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                                    <CheckCircleIcon className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-serif italic font-bold text-gray-900 mb-4">Mesej Dihantar!</h2>
                                <p className="text-gray-500">Terima kasih kerana menghubungi kami. Pasukan kami akan membalas mesej anda melalui email secepat mungkin.</p>
                                <button
                                    onClick={() => setIsSuccess(false)}
                                    className="mt-8 text-rose-600 font-bold uppercase text-[10px] tracking-widest hover:underline"
                                >
                                    Hantar Mesej Lain
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-gray-900 mb-8 font-serif italic tracking-tight">Borang Hubungi</h2>
                                {error && (
                                    <div className="mb-6 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold">
                                        <ExclamationCircleIcon className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Penuh</label>
                                            <input required name="name" value={formData.name} onChange={handleChange} type="text" placeholder="Nama anda" className="w-full px-6 py-4 bg-white border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                                            <input required name="email" value={formData.email} onChange={handleChange} type="email" placeholder="email@contoh.com" className="w-full px-6 py-4 bg-white border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-bold" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Subjek</label>
                                        <input required name="subject" value={formData.subject} onChange={handleChange} type="text" placeholder="Bantuan / Pertanyaan" className="w-full px-6 py-4 bg-white border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mesej</label>
                                        <textarea required name="message" value={formData.message} onChange={handleChange} rows={5} placeholder="Apa yang boleh kami bantu?" className="w-full px-6 py-4 bg-white border border-transparent rounded-3xl focus:border-rose-300 transition text-sm outline-none font-medium leading-relaxed" />
                                    </div>
                                    <button
                                        disabled={isSubmitting}
                                        className="w-full py-5 bg-rose-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-rose-100 hover:bg-rose-700 transition transform active:scale-95 uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : 'Hantar Mesej'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>

                    {/* Company Details */}
                    <div className="space-y-12">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 font-serif italic tracking-tight">Maklumat Syarikat</h2>
                            <div className="space-y-8">
                                <div className="flex items-start">
                                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mr-6 shadow-sm border border-rose-100 flex-shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">EEE LAB VISUAL</h3>
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">(002278324-V)</p>
                                        <p className="text-gray-500 text-sm leading-relaxed">
                                            Kuala Lumpur, Malaysia.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mr-6 shadow-sm border border-rose-100 flex-shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Email Sokongan</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">
                                            raikanbersamaxyz@gmail.com
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mr-6 shadow-sm border border-rose-100 flex-shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Waktu Operasi</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">
                                            Isnin - Jumaat: 10:00 AM - 6:00 PM<br />
                                            Weekends & Public Holidays: - Tutup
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContactPage;
