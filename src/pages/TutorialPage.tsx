import { usePlatformLanguage } from '../i18n/PlatformLanguage';
import React from 'react';
import { Link } from 'react-router-dom';

const TutorialPage: React.FC = () => {
    const { t } = usePlatformLanguage();
    // Screenshots are real captures of the 9-step editor, in order.
    const steps = [
        { titleKey: 'tut.s1.title', descriptionKey: 'tut.s1.desc', label: 'Step 1/9', image: '/tutorial/step1.jpg' },
        { titleKey: 'tut.s2.title', descriptionKey: 'tut.s2.desc', label: 'Step 2/9', image: '/tutorial/step2.jpg' },
        { titleKey: 'tut.s3.title', descriptionKey: 'tut.s3.desc', label: 'Step 3/9', image: '/tutorial/step3.jpg' },
        { titleKey: 'tut.s4.title', descriptionKey: 'tut.s4.desc', label: 'Step 4/9', image: '/tutorial/step4.jpg' },
        { titleKey: 'tut.s5.title', descriptionKey: 'tut.s5.desc', label: 'Step 5/9', image: '/tutorial/step5.jpg' },
        { titleKey: 'tut.s6.title', descriptionKey: 'tut.s6.desc', label: 'Step 6/9', image: '/tutorial/step6.jpg' },
        { titleKey: 'tut.s7.title', descriptionKey: 'tut.s7.desc', label: 'Step 7/9', image: '/tutorial/step7.jpg' },
        { titleKey: 'tut.s8.title', descriptionKey: 'tut.s8.desc', label: 'Step 8/9', image: '/tutorial/step8.jpg' },
        { titleKey: 'tut.s9.title', descriptionKey: 'tut.s9.desc', label: 'Step 9/9', image: '/tutorial/step9.jpg' }
    ];

    const checkpoints = ['tut.c1', 'tut.c2', 'tut.c3', 'tut.c4'];

    return (
        <div className="pt-32 pb-20 min-h-screen bg-[#fbf7ef]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-12 items-start mb-20">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-rose-500 mb-5">{t('tut.eyebrow')}</p>
                        <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-950 leading-tight mb-6 italic">
                            {t('tut.title')}
                        </h1>
                        <p className="text-gray-600 text-lg leading-relaxed mb-8">
                            {t('tut.intro')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link to="/catalog" className="inline-flex items-center justify-center rounded-full bg-rose-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-rose-100 transition hover:bg-rose-700">
                                {t('tut.startCatalog')}
                            </Link>
                            <Link to="/pricing" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-gray-800 border border-gray-200 transition hover:border-rose-200 hover:text-rose-600">
                                {t('tut.viewPackages')}
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-[3rem] bg-white p-5 shadow-2xl shadow-rose-100/70 border border-white">
                        <div className="aspect-[9/16] rounded-[2.4rem] overflow-hidden bg-gradient-to-b from-rose-100 via-white to-amber-50 border border-gray-100 relative">
                            <img
                                src="/tutorial/hero.jpg"
                                alt={t('tut.livePreviewTitle')}
                                className="absolute inset-0 h-full w-full object-cover object-top"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-white/40" />
                            <div className="absolute inset-x-8 top-10 rounded-[2rem] bg-white/80 backdrop-blur p-5 shadow-xl">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-rose-500">{t('tut.livePreview')}</p>
                                <h3 className="mt-3 font-serif text-3xl font-bold italic text-gray-950">{t('tut.livePreviewTitle')}</h3>
                                <p className="mt-3 text-xs leading-relaxed text-gray-500">{t('tut.livePreviewDesc')}</p>
                            </div>
                            <div className="absolute inset-x-8 bottom-10 rounded-[2rem] bg-gray-950 p-5 text-white shadow-2xl">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-rose-200">Save & Unlock</p>
                                <p className="mt-3 text-sm text-white/75">{t('tut.saveUnlockDesc')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {steps.map((step, index) => (
                            <div key={step.label} className="overflow-hidden rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-rose-100/60 transition">
                                <img
                                    src={step.image}
                                    alt={t(step.titleKey)}
                                    loading="lazy"
                                    className="w-full border-b border-gray-100 bg-gray-50 object-cover"
                                />
                                <div className="p-6">
                                <div className="flex items-center justify-between gap-4 mb-5">
                                    <span className="rounded-full bg-rose-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-600">{step.label}</span>
                                    <span className="text-3xl font-serif italic text-gray-200">{String(index + 1).padStart(2, '0')}</span>
                                </div>
                                <h3 className="font-serif text-2xl font-bold text-gray-950 mb-3">{t(step.titleKey)}</h3>
                                <p className="text-sm leading-relaxed text-gray-500">{t(step.descriptionKey)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="sm:col-span-2 xl:col-span-3 rounded-[2rem] bg-gray-950 p-7 text-white shadow-2xl">
                        <span className="rounded-full bg-rose-600/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-200">
                            {t('tut.publish.title')}
                        </span>
                        <h3 className="mt-5 font-serif text-2xl md:text-3xl font-bold italic">{t('tut.publish.title')}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-white/70 max-w-2xl">{t('tut.publish.desc')}</p>
                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                            <Link to="/catalog" className="inline-flex items-center justify-center rounded-full bg-rose-600 px-7 py-3.5 text-xs font-black uppercase tracking-widest text-white hover:bg-rose-700 transition">
                                {t('tut.startCatalog')}
                            </Link>
                            <Link to="/pricing" className="inline-flex items-center justify-center rounded-full bg-white/10 px-7 py-3.5 text-xs font-black uppercase tracking-widest text-white hover:bg-white/20 transition">
                                {t('tut.viewPackages')}
                            </Link>
                        </div>
                    </div>

                    <aside className="rounded-[2.5rem] bg-gray-950 p-7 text-white shadow-2xl">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-300 mb-5">{t('tut.checklist')}</p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {checkpoints.map((item) => (
                                <div key={item} className="flex gap-3">
                                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-[11px] font-black text-gray-950">✓</span>
                                    <p className="text-sm leading-relaxed text-white/75">{t(item)}</p>
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
