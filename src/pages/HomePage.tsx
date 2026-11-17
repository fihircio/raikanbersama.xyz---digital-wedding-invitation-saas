import { usePlatformLanguage } from '../i18n/PlatformLanguage';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  GiftIcon,
  HeartIcon,
  MapPinIcon,
  PaintBrushIcon,
  PhotoIcon,
  SparklesIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import SEO from '../../components/SEO';
import { BackgroundImage } from '../../types';
import { buildApiUrl } from '../config';

const catalogCategories = [
  { name: 'Floral', icon: HeartIcon, tone: 'bg-rose-50 text-rose-600 border-rose-100' },
  { name: 'Islamic', icon: SparklesIcon, tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { name: 'Modern', icon: PaintBrushIcon, tone: 'bg-slate-50 text-slate-700 border-slate-100' },
  { name: 'Watercolor', icon: PhotoIcon, tone: 'bg-sky-50 text-sky-700 border-sky-100' },
  { name: 'Traditional', icon: GiftIcon, tone: 'bg-amber-50 text-amber-700 border-amber-100' },
  { name: 'Minimalist', icon: CheckCircleIcon, tone: 'bg-gray-50 text-gray-700 border-gray-100' }
];

const tutorialSteps = [
  { step: '01', titleKey: 'home.t1.title', descKey: 'home.t1.desc' },
  { step: '02', titleKey: 'home.t2.title', descKey: 'home.t2.desc' },
  { step: '03', titleKey: 'home.t3.title', descKey: 'home.t3.desc' },
  { step: '04', titleKey: 'home.t4.title', descKey: 'home.t4.desc' }
];

const pricingRows = [
  { plan: 'Lite', price: 'RM29', bestForKey: 'home.row.lite.best', featureKeys: ['home.row.lite.f1', 'home.row.lite.f2', 'home.row.lite.f3'] },
  { plan: 'Pro', price: 'RM49', bestForKey: 'home.row.pro.best', featureKeys: ['home.row.pro.f1', 'home.row.pro.f2', 'home.row.pro.f3'] },
  { plan: 'Elite', price: 'RM69', bestForKey: 'home.row.elite.best', featureKeys: ['home.row.elite.f1', 'home.row.elite.f2', 'home.row.elite.f3'] }
];

const featureCards = [
  { titleKey: 'home.f1.title', descKey: 'home.f1.desc', icon: PaintBrushIcon },
  { titleKey: 'home.f2.title', descKey: 'home.f2.desc', icon: UserGroupIcon },
  { titleKey: 'home.f3.title', descKey: 'home.f3.desc', icon: CalendarDaysIcon }
];

const HomePage: React.FC = () => {
  const { t } = usePlatformLanguage();
  const [catalogPreview, setCatalogPreview] = useState<BackgroundImage[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchCatalogPreview = async () => {
      try {
        const response = await fetch(buildApiUrl('/backgrounds?page=1&limit=6&sort=latest'), {
          credentials: 'include'
        });
        if (!response.ok) return;
        const data = await response.json();
        if (isMounted) {
          setCatalogPreview(data.data || []);
        }
      } catch (error) {
        console.error('Failed to load homepage catalog preview:', error);
      }
    };

    fetchCatalogPreview();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-white overflow-hidden">
      <SEO
        title={t('home.seoTitle')}
        description="{t('home.heroDesc')} Mudah & Pantas."
      />

      <section className="relative">
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(244,63,94,0.14),transparent_58%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <div className="inline-block bg-rose-50 text-rose-600 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] mb-12 border border-rose-100 shadow-sm font-sans">
            {t('home.badge')}
          </div>
          <h1 className="text-6xl md:text-9xl font-serif font-bold text-gray-900 mb-10 tracking-tighter leading-[0.9]">
            {t('home.hero1')}<br />
            <span className="text-rose-600 italic">{t('home.hero2')}</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-16 font-light leading-relaxed font-sans">
            {t('home.heroDesc')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/dashboard"
              className="bg-rose-600 text-white px-12 py-6 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-rose-700 shadow-2xl shadow-rose-200 transition transform hover:-translate-y-2 active:scale-95"
            >
              {t('home.ctaBuild')}
            </Link>
            <Link
              to="/catalog"
              className="bg-white border border-gray-100 text-gray-700 px-12 py-6 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gray-50 transition shadow-xl"
            >
              {t('home.ctaCatalog')}
            </Link>
          </div>

          <div className="mt-40 grid md:grid-cols-3 gap-12">
            {featureCards.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.titleKey} className="bg-gray-50/50 p-12 rounded-[3.5rem] border border-gray-100 hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition duration-700 text-left group">
                  <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-8 group-hover:rotate-12 transition shadow-inner">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 font-serif italic tracking-tight">{t(feat.titleKey)}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed font-light font-sans">{t(feat.descKey)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-500 mb-4">{t('home.catalog.eyebrow')}</p>
            <h2 className="text-4xl md:text-6xl font-serif italic font-bold text-gray-950 tracking-tight">{t('home.catalog.title')}</h2>
            <p className="mt-5 max-w-2xl text-gray-500 leading-7">{t('home.catalog.desc')}</p>
          </div>
          <Link to="/catalog" className="inline-flex items-center gap-3 rounded-full bg-gray-950 px-7 py-4 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-black">
            Buka Katalog
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
          <div className="grid sm:grid-cols-2 gap-4">
            {catalogCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.name}
                  to={`/catalog?search=${encodeURIComponent(category.name)}`}
                  className={`group rounded-[2rem] border p-6 transition hover:-translate-y-1 hover:shadow-xl ${category.tone}`}
                >
                  <Icon className="w-8 h-8 mb-8 transition group-hover:scale-110" />
                  <p className="text-lg font-serif italic font-bold">{category.name}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-widest opacity-60">{t('home.catalog.view')}</p>
                </Link>
              );
            })}
          </div>

          <div className="rounded-[3rem] bg-gray-950 p-4 md:p-6 shadow-2xl shadow-gray-200">
            <div className="grid grid-cols-3 gap-3">
              {(catalogPreview.length > 0 ? catalogPreview : Array.from({ length: 6 })).map((item, index) => (
                <Link
                  key={catalogPreview.length > 0 ? (item as BackgroundImage).id : index}
                  to="/catalog"
                  className="aspect-[9/13] overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-rose-100 via-white to-amber-100"
                >
                  {catalogPreview.length > 0 && (
                    <img
                      src={(item as BackgroundImage).url}
                      alt={(item as BackgroundImage).name}
                      className="h-full w-full object-cover transition duration-700 hover:scale-110"
                      loading="lazy"
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-rose-50/50 py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-500 mb-4">{t('home.tutorial.eyebrow')}</p>
            <h2 className="text-4xl md:text-6xl font-serif italic font-bold text-gray-950">{t('home.tutorial.title')}</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {tutorialSteps.map((item) => (
              <div key={item.step} className="rounded-[2.5rem] bg-white p-8 border border-rose-100/70 shadow-sm">
                <span className="text-5xl font-serif italic font-bold text-rose-100">{item.step}</span>
                <h3 className="mt-8 text-xl font-bold text-gray-950">{t(item.titleKey)}</h3>
                <p className="mt-4 text-sm leading-6 text-gray-500">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/tutorial" className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-800 shadow-lg transition hover:-translate-y-1">
              {t('home.tutorial.cta')}
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <div className="rounded-[3.5rem] border border-gray-100 bg-white p-6 md:p-10 shadow-[0_35px_90px_-40px_rgba(15,23,42,0.35)]">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-500 mb-4">{t('home.pricing.eyebrow')}</p>
              <h2 className="text-4xl md:text-5xl font-serif italic font-bold text-gray-950">{t('home.pricing.title')}</h2>
            </div>
            <Link to="/pricing" className="inline-flex items-center gap-3 rounded-full bg-rose-600 px-7 py-4 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl shadow-rose-100 transition hover:bg-rose-700">
              {t('home.pricing.compare')}
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-[2.5rem] border border-gray-100">
            <div className="hidden md:grid grid-cols-[1fr_0.8fr_1.4fr_1.4fr] bg-gray-50 px-7 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span>{t('home.pricing.plan')}</span>
              <span>{t('home.pricing.price')}</span>
              <span>{t('home.pricing.bestFor')}</span>
              <span>{t('home.pricing.features')}</span>
            </div>
            {pricingRows.map((row) => (
              <div key={row.plan} className="grid md:grid-cols-[1fr_0.8fr_1.4fr_1.4fr] gap-4 border-t border-gray-100 px-7 py-6 text-sm">
                <div className="font-serif italic text-2xl font-bold text-gray-950">{row.plan}</div>
                <div className="font-black text-rose-600">{row.price}</div>
                <div className="text-gray-500">{t(row.bestForKey)}</div>
                <div className="flex flex-wrap gap-2">
                  {row.featureKeys.map((featureKey) => (
                    <span key={featureKey} className="rounded-full bg-gray-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      {t(featureKey)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        <div className="relative overflow-hidden rounded-[4rem] bg-gray-950 p-10 md:p-16 text-white">
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-rose-500/30 blur-[100px]" />
          <div className="relative grid lg:grid-cols-[1fr_0.7fr] gap-10 items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-300 mb-5">{t('home.aff.eyebrow')}</p>
              <h2 className="text-4xl md:text-6xl font-serif italic font-bold leading-tight">{t('home.aff.title')}</h2>
              <p className="mt-6 max-w-2xl text-gray-300 leading-7">
                {t('home.aff.desc')}
              </p>
            </div>
            <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8">
              <div className="flex items-center gap-4 text-rose-200">
                <MapPinIcon className="w-8 h-8" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Affiliate CTA</span>
              </div>
              <p className="mt-8 text-3xl font-serif italic font-bold">{t('home.aff.join')}</p>
              <Link to="/affiliates" className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-white px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-950 transition hover:bg-rose-50">
                {t('home.aff.cta')}
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
