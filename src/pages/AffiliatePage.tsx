import React, { useState } from 'react';

const AffiliatePage: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 1500);
    };

    return (
        <div className="pt-32 pb-20 min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-24 animate-fade-in">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.4em] mb-4 block">Program Rakan Kongsi</span>
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6 italic leading-tight">
                        Jana Pendapatan Bersama <br />
                        <span className="text-rose-600">RaikanBersama.xyz</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
                        Sertai komuniti vendor kami dan tawarkan jemputan digital premium kepada pelanggan anda. Sesuai untuk Photographers, Event Planners, dan Wedding Vendors.
                    </p>
                    <div className="mt-10 flex justify-center gap-4">
                        <a href="#join" className="px-10 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition shadow-xl shadow-rose-100 uppercase text-xs tracking-widest">
                            Sertai Sekarang
                        </a>
                        <a href="#benefits" className="px-10 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition uppercase text-xs tracking-widest border border-gray-100">
                            Lihat Kelebihan
                        </a>
                    </div>
                </div>

                {/* How It Works */}
                <div className="mb-32">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { step: '01', title: 'Daftar Sebagai Rakan', desc: 'Isi borang permohonan vendor dan sertai rangkaian eksklusif kami tanpa kos pendaftaran.' },
                            { step: '02', title: 'Tawarkan Kepada Pelanggan', desc: 'Promosikan jemputan digital kami sebagai sebahagian daripada pakej perkhidmatan anda.' },
                            { step: '03', title: 'Terima Komisen Tinggi', desc: 'Dapatkan harga istimewa vendor dan Jana pendapatan pasif bagi setiap tempahan berjaya.' },
                        ].map((item, i) => (
                            <div key={i} className="relative p-10 bg-gray-50 rounded-[3rem] border border-gray-100 group hover:bg-white hover:shadow-2xl hover:shadow-rose-50 transition-all duration-500">
                                <span className="text-5xl font-serif italic font-bold text-rose-100 absolute top-8 right-10 group-hover:text-rose-200 transition-colors">{item.step}</span>
                                <h3 className="text-xl font-bold text-gray-900 mb-4 pr-12">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Benefits Section */}
                <div id="benefits" className="mb-32">
                    <div className="bg-black rounded-[4rem] p-12 md:p-20 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/20 blur-[120px] rounded-full -mr-48 -mt-48"></div>
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <h2 className="text-4xl font-serif font-bold italic mb-8">Kelebihan Eksklusif <br />Vendor RaikanBersama</h2>
                                <div className="space-y-6">
                                    {[
                                        'Harga Diskaun Vendor (Sehingga 40%)',
                                        'Tiada Yuran Pendaftaran atau Tahunan',
                                        'Support VIP & Keutamaan Design Baru',
                                        'Dashboard Khas (Akan Datang)',
                                        'Akses Lifetime untuk Semua Design',
                                        'Material Pemasaran Percuma'
                                    ].map((benefit, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                            </div>
                                            <span className="text-gray-300 font-medium">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 text-center">
                                    <p className="text-3xl font-bold mb-2">0%</p>
                                    <p className="text-[10px] uppercase tracking-widest text-rose-400 font-bold">Kos Permulaan</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 text-center">
                                    <p className="text-3xl font-bold mb-2">40%</p>
                                    <p className="text-[10px] uppercase tracking-widest text-rose-400 font-bold">Margin Keuntungan</p>
                                </div>
                                <div className="col-span-2 bg-rose-600 p-8 rounded-[2.5rem] text-center shadow-2xl shadow-rose-900/20">
                                    <p className="text-lg font-serif italic mb-1">Rakan Kongsi Dipercayai</p>
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-80">Wedding Industry Expert</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inquiry Form */}
                <div id="join" className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                    <div>
                        <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6 italic tracking-tight">Kembangkan Bisnes Anda Hari Ini</h2>
                        <p className="text-gray-500 mb-10 leading-relaxed">
                            Berminat untuk menjadi sebahagian daripada keluarga RaikanBersama.xyz? Sila lengkapkan maklumat perniagaan anda di sebelah. Pasukan kami akan meneliti permohonan anda dan menghubungi anda dalam masa 24-48 jam.
                        </p>

                        <div className="space-y-8">
                            <div className="flex gap-6">
                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-rose-600 border border-gray-100 flex-shrink-0">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">Potensi Pendapatan Tinggi</h4>
                                    <p className="text-sm text-gray-500">Tingkatkan revenue sedia ada anda dengan produk digital yang mempunyai demand tinggi.</p>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-rose-600 border border-gray-100 flex-shrink-0">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">Mula Dengan Pantas</h4>
                                    <p className="text-sm text-gray-500">Proses pendaftaran yang mudah. Selepas diluluskan, anda boleh terus mula menjual.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-[3.5rem] p-12 border border-gray-100 shadow-sm relative">
                        {isSuccess ? (
                            <div className="text-center py-16 animate-scale-in">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <h3 className="text-2xl font-serif italic font-bold text-gray-900 mb-4">Permohonan Diterima!</h3>
                                <p className="text-gray-500">Terima kasih kerana berminat. Pasukan kami akan menghubungi anda melalui WhatsApp/Email dalam masa terdekat.</p>
                                <button onClick={() => setIsSuccess(false)} className="mt-8 text-rose-600 font-bold uppercase text-[10px] tracking-widest hover:underline">Hantar Permohonan Lain</button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-gray-900 mb-8 font-serif italic tracking-tight">Borang Permohonan Vendor</h2>
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Penuh</label>
                                            <input required type="text" placeholder="Nama anda" className="w-full px-6 py-4 bg-white border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Bisnes</label>
                                            <input required type="text" placeholder="E.g. Indah Photography" className="w-full px-6 py-4 bg-white border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-bold" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Business</label>
                                            <input required type="email" placeholder="business@email.com" className="w-full px-6 py-4 bg-white border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">No. Telefon / WhatsApp</label>
                                            <input required type="text" placeholder="01X-XXXXXXX" className="w-full px-6 py-4 bg-white border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-bold" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Jenis Perniagaan</label>
                                        <select className="w-full px-6 py-4 bg-white border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-bold appearance-none">
                                            <option>Photographer / Videographer</option>
                                            <option>Wedding / Event Planner</option>
                                            <option>Bridal / Boutique</option>
                                            <option>Venue Owner</option>
                                            <option>Catering</option>
                                            <option>Lain-lain</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Website / Instagram / FB Link</label>
                                        <input required type="text" placeholder="https://instagram.com/..." className="w-full px-6 py-4 bg-white border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-bold" />
                                    </div>
                                    <button
                                        disabled={isSubmitting}
                                        className="w-full py-6 bg-rose-600 text-white rounded-[2rem] font-bold text-sm shadow-xl shadow-rose-100 hover:bg-rose-700 transition transform active:scale-95 uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : 'Hantar Permohonan'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AffiliatePage;
