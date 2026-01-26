import React from 'react';

const TutorialPage: React.FC = () => {
    const steps = [
        {
            title: 'Pilih Design',
            description: 'Layari Catalog kami dan pilih design yang paling sesuai dengan tema majlis anda. Klik "Bina Kad" untuk memulakan.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>
            )
        },
        {
            title: 'Ubah Suai Kandungan',
            description: 'Di Design Studio, anda boleh menukar nama pengantin, tarikh, lokasi, dan menambah kisah cinta anda di tab "Utama".',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            )
        },
        {
            title: 'Preview & Live Update',
            description: 'Lihat perubahan anda secara "Real-Time" pada paparan telefon di sebelah kanan. Cuba semua butang interaktif untuk memastikan segalanya sempurna.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            )
        },
        {
            title: 'Simpan & Daftar',
            description: 'Klik "Save & Unlock All" untuk menyimpan draft anda. Anda akan diminta untuk Log Masuk atau Daftar untuk memindahkan hasil kerja ke akaun kekal anda.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
            )
        },
        {
            title: 'Aktifkan Pakej',
            description: 'Pilih pakej (Lite, Pro, atau Elite) untuk membuka fungsi-fungsi premium seperti RSVP, Gallery, dan E-Angpow.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            )
        }
    ];

    return (
        <div className="pt-32 pb-20 min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h1 className="text-5xl font-serif font-bold text-gray-900 mb-6 italic italic">
                        Cara Menggunakan Design Studio
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                        Bina jemputan digital idaman anda hanya dalam beberapa langkah mudah.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-16">
                        {steps.map((step, index) => (
                            <div key={index} className="flex group">
                                <div className="flex-shrink-0 mr-6">
                                    <div className="w-14 h-14 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-rose-100 group-hover:scale-110 transition duration-500">
                                        {step.icon}
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className="w-0.5 h-16 bg-rose-100 mx-auto mt-4 rounded-full"></div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif group-hover:text-rose-600 transition tracking-tight">Step {index + 1}: {step.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="hidden md:block">
                        <div className="sticky top-32 bg-white rounded-[3rem] p-4 shadow-2xl shadow-rose-100 border border-rose-50 overflow-hidden group">
                            <div className="relative aspect-[9/16] bg-gray-100 rounded-[2.5rem] overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800"
                                    alt="Editor Preview"
                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-[2s]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                    <div>
                                        <span className="text-white/70 text-[10px] uppercase font-bold tracking-[0.2em]">RaikanBersama.xyz</span>
                                        <h4 className="text-white text-2xl font-serif italic font-bold">Premium Digital Invitation Studio</h4>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 text-center">
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Start your journey today</p>
                                <a href="#/catalog" className="inline-block bg-rose-600 text-white px-10 py-4 rounded-full font-bold shadow-xl hover:bg-rose-700 transition transform active:scale-95 text-sm">
                                    Mula Bina Kad Sekarang
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorialPage;
