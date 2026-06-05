import React from 'react';
import { Link } from 'react-router-dom';

const TutorialPage: React.FC = () => {
    const steps = [
        {
            title: 'Pilih Pakej & Background',
            description: 'Mulakan dengan pakej, design katalog, warna latar, animasi pembukaan dan effect. Tetamu boleh cuba editor penuh sebelum bayar.',
            label: 'Step 1/9'
        },
        {
            title: 'Lengkapkan Cover',
            description: 'Isi wording utama, tajuk cover, tarikh, lokasi dan hashtag. Data cover membantu mengurangkan kerja mengisi semula di step seterusnya.',
            label: 'Step 2/9'
        },
        {
            title: 'Butiran Majlis',
            description: 'Semak masa, tarikh, tempat, koordinat GPS, kata aluan, atur cara, ucapan doa dan maklumat tambahan.',
            label: 'Step 3/9'
        },
        {
            title: 'Tema & Visual',
            description: 'Laraskan font tajuk seksyen, margin kandungan, warna, identiti visual dan gaya keseluruhan kad.',
            label: 'Step 4/9'
        },
        {
            title: 'Media',
            description: 'Masukkan muzik atau YouTube. Editor akan anchor ke panel berkaitan supaya anda nampak kawasan yang sedang diedit.',
            label: 'Step 5/9'
        },
        {
            title: 'RSVP',
            description: 'Aktifkan pengesahan kehadiran, tetapkan field RSVP, had pax, slot sesi dan cara tetamu menghantar ucapan.',
            label: 'Step 6/9'
        },
        {
            title: 'Hadiah',
            description: 'Sediakan Money Gift, maklumat bank atau QR supaya tetamu boleh memberi hadiah secara digital.',
            label: 'Step 7/9'
        },
        {
            title: 'Wishlist',
            description: 'Untuk Elite, tambah physical wishlist dengan pautan hadiah dan alamat penerima.',
            label: 'Step 8/9'
        },
        {
            title: 'Publish & Kongsi',
            description: 'Semak live preview, aktifkan pakej, publish, kemudian kongsi link utama atau Magic Link untuk tetamu tertentu.',
            label: 'Step 9/9'
        }
    ];

    const checkpoints = [
        'Gunakan live preview telefon untuk pastikan desktop editor dan paparan mobile tetamu konsisten.',
        'Klik Buka pada animasi pembukaan untuk semak transisi sebelum tetamu masuk ke cover.',
        'Simpan draft melalui Save & Unlock jika anda bermula sebagai guest.',
        'Publish hanya selepas pembayaran pakej selesai.'
    ];

    return (
        <div className="pt-32 pb-20 min-h-screen bg-[#fbf7ef]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-12 items-start mb-20">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-rose-500 mb-5">Tutorial Design Studio</p>
                        <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-950 leading-tight mb-6 italic">
                            Bina kad dari pilihan pakej sampai publish.
                        </h1>
                        <p className="text-gray-600 text-lg leading-relaxed mb-8">
                            Tutorial ini disusun mengikut onboarding editor 9 langkah supaya anda tahu panel mana perlu diisi, apa yang akan berubah di live preview, dan bila kad boleh dikongsi kepada tetamu.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link to="/catalog" className="inline-flex items-center justify-center rounded-full bg-rose-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-rose-100 transition hover:bg-rose-700">
                                Mula Dari Catalog
                            </Link>
                            <Link to="/pricing" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-gray-800 border border-gray-200 transition hover:border-rose-200 hover:text-rose-600">
                                Lihat Pakej
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-[3rem] bg-white p-5 shadow-2xl shadow-rose-100/70 border border-white">
                        <div className="aspect-[9/16] rounded-[2.4rem] overflow-hidden bg-gradient-to-b from-rose-100 via-white to-amber-50 border border-gray-100 relative">
                            <div className="absolute inset-x-8 top-10 rounded-[2rem] bg-white/80 backdrop-blur p-5 shadow-xl">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-rose-500">Live Preview</p>
                                <h3 className="mt-3 font-serif text-3xl font-bold italic text-gray-950">Cover, Butiran, RSVP</h3>
                                <p className="mt-3 text-xs leading-relaxed text-gray-500">Setiap step akan membawa preview ke bahagian yang sedang diedit.</p>
                            </div>
                            <div className="absolute inset-x-8 bottom-10 rounded-[2rem] bg-gray-950 p-5 text-white shadow-2xl">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-rose-200">Save & Unlock</p>
                                <p className="mt-3 text-sm text-white/75">Cuba sebagai guest dahulu, kemudian simpan ke akaun apabila sudah puas hati.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-[1fr_320px] gap-10 items-start">
                    <div className="grid md:grid-cols-2 gap-5">
                        {steps.map((step, index) => (
                            <div key={step.label} className="rounded-[2rem] bg-white p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-rose-100/60 transition">
                                <div className="flex items-center justify-between gap-4 mb-5">
                                    <span className="rounded-full bg-rose-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-600">{step.label}</span>
                                    <span className="text-3xl font-serif italic text-gray-200">{String(index + 1).padStart(2, '0')}</span>
                                </div>
                                <h3 className="font-serif text-2xl font-bold text-gray-950 mb-3">{step.title}</h3>
                                <p className="text-sm leading-relaxed text-gray-500">{step.description}</p>
                            </div>
                        ))}
                    </div>

                    <aside className="lg:sticky lg:top-28 rounded-[2.5rem] bg-gray-950 p-7 text-white shadow-2xl">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-300 mb-5">Checklist Sebelum Publish</p>
                        <div className="space-y-4">
                            {checkpoints.map((item) => (
                                <div key={item} className="flex gap-3">
                                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-[11px] font-black text-gray-950">✓</span>
                                    <p className="text-sm leading-relaxed text-white/75">{item}</p>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default TutorialPage;
