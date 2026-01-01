import React from 'react';
import { Plan } from '../../types';

interface FeatureComparisonProps {
  plans: Plan[];
}

const FeatureComparison: React.FC<FeatureComparisonProps> = ({ plans }) => {
  const allFeatures = [
    { name: 'Number of Invitations', basic: '5/year', premium: 'Unlimited' },
    { name: 'Template Selection', basic: '10 Basic', premium: '30+ Premium' },
    { name: 'Customization Options', basic: 'Standard', premium: 'Advanced' },
    { name: 'RSVP Limit per Invitation', basic: '50', premium: '500' },
    { name: 'Analytics', basic: 'Basic', premium: 'Advanced Dashboard' },
    { name: 'Support', basic: 'Email', premium: 'Priority' },
    { name: 'Custom Domain', basic: '❌', premium: '✅' },
    { name: 'AI Assistant', basic: '❌', premium: '✅' },
    { name: 'Gallery Images', basic: '3', premium: '10' }
  ];

  return (
    <div className="bg-gray-50 rounded-3xl p-8 overflow-hidden">
      <h3 className="text-2xl font-serif font-bold text-center text-gray-900 mb-8">
        Compare Features
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-6 font-bold text-gray-900">Feature</th>
              <th className="text-center py-4 px-6 font-bold text-gray-900">Basic</th>
              <th className="text-center py-4 px-6 font-bold text-gray-900">Premium</th>
            </tr>
          </thead>
          <tbody>
            {allFeatures.map((feature, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-white transition">
                <td className="py-4 px-6 font-medium text-gray-900">{feature.name}</td>
                <td className="py-4 px-6 text-center text-gray-700">{feature.basic}</td>
                <td className="py-4 px-6 text-center text-gray-700">{feature.premium}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeatureComparison;