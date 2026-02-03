import React, { useState } from 'react';
import { buildApiUrl } from '../config';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

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

                        <div className="p-8 bg-black rounded-[2.5rem] text-white">
                            <h3 className="text-xl font-bold mb-4 font-serif italic">Segera?</h3>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">Gunakan bantuan WhatsApp kami untuk jawapan yang lebih pantas mengenai pesanan anda.</p>
                            <a href="#" className="flex items-center justify-center space-x-3 w-full py-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl transition font-bold text-sm tracking-widest uppercase">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                <span>WhatsApp Kami</span>
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContactPage;
