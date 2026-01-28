import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentModal from './PaymentModal';
import { Plan } from '../../types';

interface PricingCardProps {
  plan: Plan;
  invitationId?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, invitationId }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();

  const handlePilih = () => {
    if (!invitationId) {
      navigate(`/catalog?plan=${plan.id}`);
    } else {
      setShowPaymentModal(true);
    }
  };

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

        <div className="flex flex-col gap-3">
          <button
            onClick={handlePilih}
            className={`w-full py-4 rounded-full font-bold text-lg transition ${plan.isPopular
              ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
          >
            Pilih Sekarang
          </button>

          <a
            href={`#/i/${plan.id === 'lite' ? 'sample-pakej-aswa' :
              plan.id === 'pro' ? 'sample-pakej-asmaradana' :
                'sample-pakej-kayangan'
              }`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-full font-bold text-sm text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-100 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            Lihat Contoh
          </a>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          plan={plan}
          invitationId={invitationId}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </>
  );
};

export default PricingCard;