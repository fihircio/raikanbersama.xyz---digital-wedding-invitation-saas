import React from 'react';

const FAQPage: React.FC = () => {
    const faqs = [
        {
            question: 'Berapa lama link jemputan saya akan aktif?',
            answer: 'Link jemputan anda aktif selama-lamanya (Lifetime Access). Ia boleh dijadikan kenang-kenangan digital untuk anda dan tetamu.'
        },
        {
            question: 'Bolehkah saya menukar maklumat selepas membeli?',
            answer: 'Boleh. Setiap pelan mempunyai tempoh "Edit Window" (60, 120, atau Tanpa Had) untuk anda mengemaskini maklumat majlis.'
        },
        {
            question: 'Apa itu Money Gift (E-Angpow)?',
            answer: 'Ciri yang membolehkan tetamu memberikan sumbangan secara digital terus ke akaun bank anda melalui paparan yang elegan.'
        },
        {
            question: 'Adakah saya boleh menggunakan lagu sendiri?',
            answer: 'Ya, anda boleh memasukkan link lagu dari YouTube atau upload file MP3 anda sendiri di bahagian Media.'
        },
        {
            question: 'Bagaimana cara untuk berkongsi link jemputan?',
            answer: 'Selepas anda menyimpan kad anda, anda akan mendapat link unik (slug). Anda boleh copy link tersebut dan share melalui WhatsApp, Telegram, atau Media Sosial.'
        }
    ];

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
                    {faqs.map((faq, index) => (
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
