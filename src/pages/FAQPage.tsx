import { usePlatformLanguage } from '../i18n/PlatformLanguage';
import React from 'react';

const FAQPage: React.FC = () => {
  const { t } = usePlatformLanguage();
    const faqs = [
        {
            questionKey: 'faq.q1',
            answerKey: 'faq.a1'
        },
        {
            questionKey: 'faq.q2',
            answerKey: 'faq.a2'
        },
        {
            questionKey: 'faq.q3',
            answerKey: 'faq.a3'
        },
        {
            questionKey: 'faq.q4',
            answerKey: 'faq.a4'
        },
        {
            questionKey: 'faq.q5',
            answerKey: 'faq.a5'
        },
        {
            questionKey: 'faq.q6',
            answerKey: 'faq.a6'
        },
        {
            questionKey: 'faq.q7',
            answerKey: 'faq.a7'
        },
        {
            questionKey: 'faq.q8',
            answerKey: 'faq.a8'
        }
    ];

    const affiliateFaqs = [
        {
            questionKey: 'faq.q9',
            answerKey: 'faq.a9'
        },
        {
            questionKey: 'faq.q10',
            answerKey: 'faq.a10'
        },
        {
            questionKey: 'faq.q11',
            answerKey: 'faq.a11'
        }
    ];

    const allFaqs = [...faqs, ...affiliateFaqs];

    return (
        <div className="pt-32 pb-20 min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4 italic">
                        {t('faq.title')}
                    </h1>
                    <p className="text-gray-500">
                        {t('faq.subtitle')}
                    </p>
                </div>

                <div className="space-y-6">
                    {allFaqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-rose-200 transition duration-500 group"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-rose-600 transition">
                                {t(faq.questionKey)}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {t(faq.answerKey)}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-20 p-10 bg-rose-50 rounded-[3rem] text-center border border-rose-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif">{t('faq.stillQuestions')}</h3>
                    <p className="text-gray-600 mb-6 text-sm">{t('faq.contactSupport')}</p>
                    <a href="#/contact" className="inline-block bg-rose-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-rose-100 hover:bg-rose-700 transition transform active:scale-95">
                        {t('contact.heading')}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
