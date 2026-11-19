import { usePlatformLanguage } from '../i18n/PlatformLanguage';
import React from 'react';
import { Link } from 'react-router-dom';

interface GuideStep {
    titleKey: string;
    descriptionKey: string;
    label: string;
    /** Optional: steps without a screenshot render as a text-only card. */
    image?: string;
}

interface Guide {
    id: string;
    number: string;
    titleKey: string;
    descKey: string;
    metaKey: string;
    steps: GuideStep[];
}

/**
 * Tutorial page: a hub of five guides that anchor to their detail sections on
 * the same page.
 *
 * Screenshots are real captures of the 9-step editor in order. Grouping them
 * into five guides keeps the hub readable while every individual step still
 * gets its own card and screenshot, matching the order the editor actually
 * presents (Package, Cover, Details, Design, Media, Contacts, Gifts, Wishlist,
 * RSVP) and then Publish as a separate action.
 */
const TutorialPage: React.FC = () => {
    const { t } = usePlatformLanguage();

    const step = (n: number, titleKey: string, descriptionKey: string): GuideStep => ({
        titleKey,
        descriptionKey,
        label: `Step ${n}/9`,
        image: `/tutorial/step${n}.jpg`,
    });

    // Guide 6 covers the post-publish workflow on /manage, so it does not follow
    // the 9-step editor numbering and uses its own screenshots.
    const manageStep = (n: number, titleKey: string, descriptionKey: string, image?: string): GuideStep => ({
        titleKey,
        descriptionKey,
        label: `Manage ${n}/6`,
        image,
    });

    const guides: Guide[] = [
        {
            id: 'g1',
            number: '1',
            titleKey: 'tut.g1.title',
            descKey: 'tut.g1.desc',
            metaKey: 'tut.g1.meta',
            steps: [
                step(1, 'tut.s1.title', 'tut.s1.desc'),
                step(2, 'tut.s2.title', 'tut.s2.desc'),
            ],
        },
        {
            id: 'g2',
            number: '2',
            titleKey: 'tut.g2.title',
            descKey: 'tut.g2.desc',
            metaKey: 'tut.g2.meta',
            steps: [
                step(3, 'tut.s3.title', 'tut.s3.desc'),
                step(4, 'tut.s4.title', 'tut.s4.desc'),
            ],
        },
        {
            id: 'g3',
            number: '3',
            titleKey: 'tut.g3.title',
            descKey: 'tut.g3.desc',
            metaKey: 'tut.g3.meta',
            steps: [
                step(5, 'tut.s5.title', 'tut.s5.desc'),
                step(6, 'tut.s6.title', 'tut.s6.desc'),
            ],
        },
        {
            id: 'g4',
            number: '4',
            titleKey: 'tut.g4.title',
            descKey: 'tut.g4.desc',
            metaKey: 'tut.g4.meta',
            steps: [
                step(7, 'tut.s7.title', 'tut.s7.desc'),
                step(8, 'tut.s8.title', 'tut.s8.desc'),
            ],
        },
        {
            id: 'g5',
            number: '5',
            titleKey: 'tut.g5.title',
            descKey: 'tut.g5.desc',
            metaKey: 'tut.g5.meta',
            steps: [
                step(9, 'tut.s9.title', 'tut.s9.desc'),
            ],
        },
        {
            id: 'g6',
            number: '6',
            titleKey: 'tut.g6.title',
            descKey: 'tut.g6.desc',
            metaKey: 'tut.g6.meta',
            steps: [
                manageStep(1, 'tut.m1.title', 'tut.m1.desc', '/tutorial/manage-guests.jpg'),
                manageStep(2, 'tut.m2.title', 'tut.m2.desc', '/tutorial/manage-wishes.jpg'),
                manageStep(3, 'tut.m3.title', 'tut.m3.desc', '/tutorial/manage-magic.jpg'),
                manageStep(4, 'tut.m4.title', 'tut.m4.desc', '/tutorial/manage-magiclink.jpg'),
                manageStep(5, 'tut.m5.title', 'tut.m5.desc', '/tutorial/manage-share.jpg'),
                manageStep(6, 'tut.m6.title', 'tut.m6.desc'),
            ],
        },
    ];

    const checkpoints = ['tut.c1', 'tut.c2', 'tut.c3', 'tut.c4'];

    const ScrollToTopOnHash = () => {
        React.useEffect(() => {
            if (window.location.hash) {
                const el = document.getElementById(window.location.hash.slice(1));
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, []);
        return null;
    };

    return (
        <div className="pt-32 pb-20 min-h-screen bg-[#fbf7ef]">
            <ScrollToTopOnHash />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-12 items-start mb-16">
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
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-rose-200">Save &amp; Unlock</p>
                                <p className="mt-3 text-sm text-white/75">{t('tut.saveUnlockDesc')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hub: five guides, each anchoring to its detail section below */}
                <div className="mb-20">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold italic text-gray-950 mb-2">{t('tut.hubTitle')}</h2>
                    <p className="text-sm text-gray-500 mb-8 max-w-2xl">{t('tut.hubDesc')}</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {guides.map((g) => (
                            <a
                                key={g.id}
                                href={`#${g.id}`}
                                className="group rounded-[2rem] bg-white p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-rose-100/60 transition flex flex-col"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-lg font-black text-rose-600">
                                        {g.number}
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-3">{t(g.metaKey)}</span>
                                </div>
                                <h3 className="font-serif text-2xl font-bold text-gray-950 mb-2">{t(g.titleKey)}</h3>
                                <p className="text-sm leading-relaxed text-gray-500 flex-1">{t(g.descKey)}</p>
                                <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-rose-600 group-hover:gap-3 transition-all">
                                    {t('tut.guide.start')}
                                    <span aria-hidden="true">→</span>
                                </span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Detail sections: same page, reached by the hub anchors */}
                <div className="space-y-14">
                    {guides.map((g) => (
                        <section key={g.id} id={g.id} className="scroll-mt-32">
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-950 text-sm font-black text-white">
                                    {g.number}
                                </span>
                                <h2 className="font-serif text-2xl md:text-3xl font-bold italic text-gray-950">{t(g.titleKey)}</h2>
                                <span className="rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 border border-gray-100">
                                    {t(g.metaKey)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-6 max-w-2xl">{t(g.descKey)}</p>
                            <div className={`grid gap-5 ${g.steps.length > 1 ? 'sm:grid-cols-2 xl:grid-cols-2' : ''} ${g.id === 'g5' ? 'md:grid-cols-2' : ''}`}>
                                {g.steps.map((s, i) => (
                                    <div key={s.label} className="overflow-hidden rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-rose-100/60 transition">
                                        {s.image ? (
                                            <img
                                                src={s.image}
                                                alt={t(s.titleKey)}
                                                loading="lazy"
                                                className="w-full border-b border-gray-100 bg-gray-50 object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-40 items-center justify-center border-b border-gray-100 bg-gradient-to-br from-rose-50 via-white to-amber-50">
                                                <span className="font-serif text-5xl italic font-bold text-rose-200">
                                                    {String(i + 1).padStart(2, '0')}
                                                </span>
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <div className="flex items-center justify-between gap-4 mb-5">
                                                <span className="rounded-full bg-rose-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-600">{s.label}</span>
                                                <span className="text-3xl font-serif italic text-gray-200">{String(i + 1).padStart(2, '0')}</span>
                                            </div>
                                            <h3 className="font-serif text-2xl font-bold text-gray-950 mb-3">{t(s.titleKey)}</h3>
                                            <p className="text-sm leading-relaxed text-gray-500">{t(s.descriptionKey)}</p>
                                        </div>
                                    </div>
                                ))}

                                {g.id === 'g5' && (
                                    <div id="publish" className="scroll-mt-32 rounded-[2rem] bg-gray-950 p-7 text-white shadow-2xl flex flex-col">
                                        <span className="w-fit rounded-full bg-rose-600/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-200">
                                            {t('tut.publish.title')}
                                        </span>
                                        <h3 className="mt-5 font-serif text-2xl md:text-3xl font-bold italic">{t('tut.publish.title')}</h3>
                                        <p className="mt-3 text-sm leading-relaxed text-white/70">{t('tut.publish.desc')}</p>
                                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                            <Link to="/catalog" className="inline-flex items-center justify-center rounded-full bg-rose-600 px-7 py-3.5 text-xs font-black uppercase tracking-widest text-white hover:bg-rose-700 transition">
                                                {t('tut.startCatalog')}
                                            </Link>
                                            <Link to="/pricing" className="inline-flex items-center justify-center rounded-full bg-white/10 px-7 py-3.5 text-xs font-black uppercase tracking-widest text-white hover:bg-white/20 transition">
                                                {t('tut.viewPackages')}
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    ))}
                </div>

                <aside className="mt-14 rounded-[2.5rem] bg-gray-950 p-7 text-white shadow-2xl">
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
    );
};

export default TutorialPage;
