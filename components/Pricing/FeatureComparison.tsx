import React from 'react';
import { Plan } from '../../types';

interface FeatureComparisonProps {
  plans: Plan[];
}

const FeatureComparison: React.FC<FeatureComparisonProps> = ({ plans }) => {
  const allFeatures = [
    { name: 'Kalendar / Tambah ke Kalendar', lite: true, pro: true, elite: true },
    { name: 'Hubungi keluarga', lite: true, pro: true, elite: true },
    { name: 'Kiraan detik majlis', lite: true, pro: true, elite: true },
    { name: 'Lokasi (Google Maps / Waze)', lite: true, pro: true, elite: true },
    { name: 'Muzik Latar', lite: true, pro: true, elite: true },
    { name: 'Sistem RSVP', lite: false, pro: true, elite: true },
    { name: 'Pengurusan kehadiran', lite: false, pro: true, elite: true },
    { name: 'Kesan visual', lite: false, pro: true, elite: true },
    { name: 'Buku ucapan tetamu', lite: false, pro: true, elite: true },
    { name: 'Galeri gambar', lite: false, pro: false, elite: true },
    { name: 'Hadiah wang digital', lite: false, pro: false, elite: true },
    { name: 'Wishlist fizikal', lite: false, pro: false, elite: true },
    { name: 'Ubah background katalog sendiri', lite: false, pro: false, elite: true },
    { name: 'Penjana Magic Link (URL jemputan unik)', lite: false, pro: false, elite: true },
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
