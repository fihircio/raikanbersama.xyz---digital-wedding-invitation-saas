import React from 'react';
import PricingCard from './PricingCard';
import FeatureComparison from './FeatureComparison';
import { Plan } from '../../types';

const PricingPage: React.FC = () => {
  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 'RM27.90',
      period: 'per invitation',
      description: 'Perfect for intimate weddings',
      features: [
        '5 invitations per year',
        '10 basic templates',
        'Standard customization',
        '50 RSVPs per invitation',
        'Basic analytics',
        'Email support'
      ],
      isPopular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'RM57.90',
      period: 'per invitation',
      description: 'For the ultimate wedding experience',
      features: [
        'Unlimited invitations',
        '30+ premium templates',
        'Advanced customization',
        '500 RSVPs per invitation',
        'Advanced analytics dashboard',
        'Priority support',
        'Custom domain option',
        'AI Assistant access',
        'Gallery with 10 images'
      ],
      isPopular: true
    }
  ];

  const faqs = [
    {
      question: 'Can I change my plan later?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and online banking.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, we offer a 7-day free trial for the Premium plan.'
    }
  ];

  return (
    <div className="pt-24 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your wedding invitation needs. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
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