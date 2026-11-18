import { usePlatformLanguage } from '../../src/i18n/PlatformLanguage';
import React from 'react';
import PricingCard from './PricingCard';
import FeatureComparison from './FeatureComparison';
import SEO from '../SEO';
import { Plan } from '../../types';
import { trackViewContent } from '../../src/utils/metaPixel';

import { useSearchParams } from 'react-router-dom';

const PricingPage: React.FC = () => {
  const { t } = usePlatformLanguage();
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get('invitationId');

  // ViewContent feeds the "viewed pricing, did not purchase" retargeting
  // audience. Ref-guarded so React StrictMode cannot double-fire it in dev.
  const viewContentSent = React.useRef(false);
  React.useEffect(() => {
    if (viewContentSent.current) return;
    viewContentSent.current = true;
    trackViewContent('Pricing', { content_category: 'pricing', content_type: 'product' });
  }, []);

  const plans: Plan[] = [
    {
      id: 'lite',
      name: 'Lite',
      label: 'Asas',
      price: 'RM29',
      period: '',
      periodKey: 'pricing.perInvitation',
      description: '',
      descKey: 'pricing.plan.lite.desc',
      features: [],
      featureKeys: [
        'pricing.feature.calendar',
        'pricing.feature.contact',
        'pricing.feature.countdown',
        'pricing.feature.location',
        'pricing.feature.music',
      ],
      isPopular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      label: 'Pilihan Popular',
      price: 'RM49',
      period: '',
      periodKey: 'pricing.perInvitation',
      description: '',
      descKey: 'pricing.plan.pro.desc',
      features: [],
      featureKeys: [
        'pricing.feature.calendar',
        'pricing.feature.contact',
        'pricing.feature.countdown',
        'pricing.feature.location',
        'pricing.feature.music',
        'pricing.feature.rsvp',
        'pricing.feature.attendance',
        'pricing.feature.effects',
        'pricing.feature.wishes',
      ],
      isPopular: true
    },
    {
      id: 'elite',
      name: 'Elite',
      label: 'Eksklusif',
      price: 'RM69',
      period: '',
      periodKey: 'pricing.perInvitation',
      description: '',
      descKey: 'pricing.plan.elite.desc',
      features: [],
      featureKeys: [
        'pricing.feature.calendar',
        'pricing.feature.contact',
        'pricing.feature.countdown',
        'pricing.feature.location',
        'pricing.feature.music',
        'pricing.feature.rsvp',
        'pricing.feature.attendance',
        'pricing.feature.effects',
        'pricing.feature.wishes',
        'pricing.feature.gallery',
        'pricing.feature.gift',
        'pricing.feature.wishlist',
        'pricing.feature.backgrounds',
        'pricing.feature.magicLink',
      ],
      isPopular: false
    }
  ];


  return (
    <div className="pt-24 min-h-screen bg-white">
      <SEO
        title={t('pricing.seoTitle')}
        description={t('pricing.seoDesc')}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold text-gray-900 mb-6">
            {t('pricing.heading')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('pricing.subheading')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} invitationId={invitationId || undefined} />
          ))}
        </div>

        {/* Feature Comparison */}
        <FeatureComparison plans={plans} />

      </div>
    </div>
  );
};

export default PricingPage;
