import React from 'react';

const FAQPage: React.FC = () => {
    const faqs = [
        {
            question: 'Berapa lama link jemputan saya akan aktif?',
            answer: 'Link jemputan anda aktif selama-lamanya melalui akses seumur hidup. Ia boleh dijadikan kenang-kenangan digital untuk anda dan tetamu.'
        },
        {
            question: 'Boleh cuba editor sebelum bayar?',
            answer: 'Ya. Anda boleh pilih design di katalog dan cuba editor penuh sebagai tetamu. Butang publish dan fungsi simpan kekal hanya dibuka selepas Save & Unlock, daftar/log masuk, dan aktifkan pakej.'
        },
        {
            question: 'Apa maksud Save & Unlock?',
            answer: 'Save & Unlock akan menyimpan draft tetamu ke akaun anda. Selepas log masuk atau daftar, sistem akan menukar draft demo kepada kad sebenar supaya anda boleh terus sambung edit.'
        },
        {
            question: 'Boleh upload background design sendiri?',
            answer: 'Boleh untuk pakej Elite. Anda boleh upload gambar sendiri untuk background katalog, background butiran, logo footer dan beberapa elemen visual lain. Sistem akan simpan gambar tersebut ke storage akaun jemputan anda.'
        },
        {
            question: 'Apa itu Hadiah Wang Digital?',
            answer: 'Ciri yang membolehkan tetamu memberikan sumbangan secara digital terus ke akaun bank anda melalui paparan yang elegan.'
        },
        {
            question: 'Adakah saya boleh menggunakan lagu sendiri?',
            answer: 'Ya, anda boleh memasukkan link lagu dari YouTube di bahagian Media. Untuk preview editor, step Media akan anchor terus ke panel muzik supaya lebih mudah semak hasilnya.'
        },
        {
            question: 'Bagaimana cara untuk berkongsi link jemputan?',
            answer: 'Selepas kad diaktifkan dan dipublish, anda akan mendapat link utama. Pakej Elite turut mempunyai Magic Link Generator untuk bina URL unik mengikut nama tetamu.'
        },
        {
            question: 'Kenapa saya tidak boleh publish kad?',
            answer: 'Publish dikunci sehingga pembayaran pakej selesai. Ini memastikan tetamu hanya boleh membuka kad yang sudah diaktifkan.'
        }
    ];

    const affiliateFaqs = [
        {
            question: 'Bagaimana Program Affiliate berfungsi?',
            answer: 'Anda daftar sebagai vendor, dapatkan kod referral unik, dan kongsikan kepada pelanggan anda. Setiap pembelian menggunakan kod anda akan memberikan anda komisen.'
        },
        {
            question: 'Berapakah kadar komisen yang ditawarkan?',
            answer: 'Komisen bermula dari 20% (Tier 1) dan boleh meningkat sehingga 25% (Tier 3) bergantung kepada prestasi jualan anda. Pelanggan anda juga akan mendapat diskaun 10%.'
        },
        {
            question: 'Adakah terdapat yuran penyertaan?',
            answer: 'Tidak. Penyertaan Program Affiliate RaikanBersama adalah percuma sepenuhnya.'
        }
    ];

    const allFaqs = [...faqs, ...affiliateFaqs];

    return (
        <div className="pt-32 pb-20 min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4 italic">
                        Soalan Lazim (FAQ)
                    </h1>
                    <p className="text-gray-500">
                        Segala jawapan untuk persoalan anda mengenai RaikanBersama.
                    </p>
                </div>

                <div className="space-y-6">
                    {allFaqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-rose-200 transition duration-500 group"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-rose-600 transition">
                                {faq.question}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-20 p-10 bg-rose-50 rounded-[3rem] text-center border border-rose-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif">Masih ada soalan?</h3>
                    <p className="text-gray-600 mb-6 text-sm">Jika anda tidak menjumpai jawapan di sini, sila hubungi team bantuan kami.</p>
                    <a href="#/contact" className="inline-block bg-rose-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-rose-100 hover:bg-rose-700 transition transform active:scale-95">
                        Hubungi Kami
                    </a>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
