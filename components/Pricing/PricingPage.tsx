import React from 'react';
import PricingCard from './PricingCard';
import FeatureComparison from './FeatureComparison';
import { Plan } from '../../types';

const PricingPage: React.FC = () => {
  const plans: Plan[] = [
    {
      id: 'lite',
      name: 'Lite',
      price: 'RM29',
      period: 'per invitation',
      description: 'The essential wedding invitation',
      features: [
        'Tiada Had Pelawat (Unlimited Visitors)',
        'Tiada Tarikh Luput Link (Lifetime Access)',
        'Maklumat Boleh Tukar (60 Hari)',
        'Gallery (1 Image)',
        'Location (Google Maps/Waze)',
        'Muzik Latar',
        'RSVP System',
        'Guestbook (Ucapan)'
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
        'Tiada Had Pelawat (Unlimited Visitors)',
        'Tiada Tarikh Luput Link (Lifetime Access)',
        'Maklumat Boleh Tukar (120 Hari)',
        'Gallery (5 Images)',
        'Money Gift (E-Angpow)',
        'RSVP System (Advanced)',
        'Guestbook (Ucapan)',
        'Priority support'
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
        'Tiada Had Pelawat (Unlimited Visitors)',
        'Tiada Tarikh Luput Link (Lifetime Access)',
        'Maklumat Boleh Tukar (Lifetime Edit)',
        'Video Youtube Embed',
        'Unlimited Gallery Images',
        'Money Gift (E-Angpow)',
        'Physical Wishlist (Gift Registry)',
        'Bilingual Support (Melayu/English)',
        'Custom Design Requests',
        'PDF Invitation (BETA)'
      ],
      isPopular: false
    }
  ];

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
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        {/* Feature Comparison */}
        <FeatureComparison plans={plans} />

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-serif font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;