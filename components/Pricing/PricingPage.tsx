import React from 'react';
import PricingCard from './PricingCard';
import FeatureComparison from './FeatureComparison';
import { Plan } from '../../types';

import { useSearchParams } from 'react-router-dom';

const PricingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get('invitationId');
  const plans: Plan[] = [
    {
      id: 'lite',
      name: 'Lite',
      price: 'RM29',
      period: 'per invitation',
      description: 'The essential wedding invitation',
      features: [
        'Calendar',
        'Contact',
        'Countdown',
        'Location (Google Maps/Waze)',
        'Muzik Latar'
      ],
      isPopular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'RM49',
      period: 'per invitation',
      description: 'The preferred choice for couples',
      features: [
        'Calendar',
        'Contact',
        'Countdown',
        'Location (Google Maps/Waze)',
        'Muzik Latar',
        'RSVP System',
        'Attendance',
        'Effect',
        'Guestbook (Ucapan)',
      ],
      isPopular: true
    },
    {
      id: 'elite',
      name: 'Elite',
      price: 'RM69',
      period: 'per invitation',
      description: 'The ultimate digital experience',
      features: [
        'Calendar',
        'Contact',
        'Countdown',
        'Location (Google Maps/Waze)',
        'Muzik Latar',
        'RSVP System',
        'Attendance',
        'Effect',
        'Guestbook (Ucapan)',
        'Gallery Gambar',
        'Money Gift',
        'Wish List',
        'Custom link'
      ],
      isPopular: false
    }
  ];


  return (
    <div className="pt-24 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold text-gray-900 mb-6">
            Pilih Pelan Anda
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Jemputan digital yang premium, bermakna, dan kekal selamanya.
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