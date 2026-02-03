import React from 'react';
import { Plan } from '../../types';

interface FeatureComparisonProps {
  plans: Plan[];
}

const FeatureComparison: React.FC<FeatureComparisonProps> = ({ plans }) => {
  const allFeatures = [
    { name: 'Calendar / Add to Calendar', lite: true, pro: true, elite: true },
    { name: 'Contact', lite: true, pro: true, elite: true },
    { name: 'Countdown Timer Majlis', lite: true, pro: true, elite: true },
    { name: 'Lokasi (Google Maps / Waze)', lite: true, pro: true, elite: true },
    { name: 'Muzik Latar', lite: true, pro: true, elite: true },
    { name: 'Sistem RSVP', lite: false, pro: true, elite: true },
    { name: 'Attendance Management', lite: false, pro: true, elite: true },
    { name: 'Visual Effects', lite: false, pro: true, elite: true },
    { name: 'Guestbook (Ucapan Tetamu)', lite: false, pro: true, elite: true },
    { name: 'Gallery Gambar', lite: false, pro: false, elite: true },
    { name: 'Money Gift', lite: false, pro: false, elite: true },
    { name: 'Wish List', lite: false, pro: false, elite: true },
    { name: 'Custom Domain/Slug Link', lite: false, pro: false, elite: true },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-serif font-bold text-center text-gray-900 mb-12">
          Bandingkan Pelan
        </h2>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-4 px-6 text-sm font-semibold text-gray-700">Ciri-ciri</th>
                <th className="py-4 px-6 text-sm font-semibold text-center text-gray-700">Lite</th>
                <th className="py-4 px-6 text-sm font-semibold text-center text-gray-700">Pro</th>
                <th className="py-4 px-6 text-sm font-semibold text-center text-gray-700">Elite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allFeatures.map((feature) => (
                <tr key={feature.name} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-sm text-gray-600">{feature.name}</td>
                  <td className="py-4 px-6 text-sm text-center">
                    {typeof feature.lite === 'boolean' ? (
                      feature.lite ? <span className="text-green-500 text-lg">✓</span> : <span className="text-gray-300 text-lg">✕</span>
                    ) : (
                      <span className="text-gray-900 font-medium">{feature.lite}</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-sm text-center">
                    {typeof feature.pro === 'boolean' ? (
                      feature.pro ? <span className="text-green-500 text-lg">✓</span> : <span className="text-gray-300 text-lg">✕</span>
                    ) : (
                      <span className="text-gray-900 font-medium">{feature.pro}</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-sm text-center">
                    {typeof feature.elite === 'boolean' ? (
                      feature.elite ? <span className="text-green-500 text-lg">✓</span> : <span className="text-gray-300 text-lg">✕</span>
                    ) : (
                      <span className="text-gray-900 font-medium">{feature.elite}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default FeatureComparison;