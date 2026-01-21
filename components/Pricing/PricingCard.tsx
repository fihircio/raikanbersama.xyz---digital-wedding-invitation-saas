import React, { useState } from 'react';
import PaymentModal from './PaymentModal';
import { Plan } from '../../types';

interface PricingCardProps {
  plan: Plan;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <>
      <div className={`relative rounded-3xl p-8 ${plan.isPopular ? 'bg-rose-50 border-2 border-rose-200 shadow-xl' : 'bg-white border border-gray-200 shadow-lg'}`}>
        {plan.isPopular && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-rose-600 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
              Most Popular
            </span>
          </div>
        )}

        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
          <div className="mb-4">
            <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
            <span className="text-gray-600 ml-2">{plan.period}</span>
          </div>
          <p className="text-gray-600">{plan.description}</p>
        </div>

        <ul className="space-y-4 mb-8">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => setShowPaymentModal(true)}
          className={`w-full py-4 rounded-full font-bold text-lg transition ${plan.isPopular
              ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
        >
          Pilih Sekarang
        </button>
      </div>

      {showPaymentModal && (
        <PaymentModal
          plan={plan}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </>
  );
};

export default PricingCard;