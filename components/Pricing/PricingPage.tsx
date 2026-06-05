import React from 'react';
import PricingCard from './PricingCard';
import FeatureComparison from './FeatureComparison';
import SEO from '../SEO';
import { Plan } from '../../types';

import { useSearchParams } from 'react-router-dom';

const PricingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get('invitationId');
  const plans: Plan[] = [
    {
      id: 'lite',
      name: 'Lite',
      label: 'Asas',
      price: 'RM29',
      period: 'setiap jemputan',
      description: 'Jemputan digital asas untuk majlis ringkas dan kemas',
      features: [
        'Kalendar',
        'Hubungi keluarga',
        'Kiraan detik majlis',
        'Lokasi (Google Maps/Waze)',
        'Muzik Latar'
      ],
      isPopular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      label: 'Pilihan Popular',
      price: 'RM49',
      period: 'setiap jemputan',
      description: 'Pilihan lengkap untuk pasangan yang perlukan RSVP dan ucapan tetamu',
      features: [
        'Kalendar',
        'Hubungi keluarga',
        'Kiraan detik majlis',
        'Lokasi (Google Maps/Waze)',
        'Muzik Latar',
        'Sistem RSVP',
        'Pengurusan kehadiran',
        'Kesan visual',
        'Buku ucapan tetamu',
      ],
      isPopular: true
    },
    {
      id: 'elite',
      name: 'Elite',
      label: 'Eksklusif',
      price: 'RM69',
      period: 'setiap jemputan',
      description: 'Pengalaman digital paling lengkap untuk jemputan premium',
      features: [
        'Kalendar',
        'Hubungi keluarga',
        'Kiraan detik majlis',
        'Lokasi (Google Maps/Waze)',
        'Muzik Latar',
        'Sistem RSVP',
        'Pengurusan kehadiran',
        'Kesan visual',
        'Buku ucapan tetamu',
        'Galeri gambar',
        'Hadiah wang digital',
        'Wishlist fizikal',
        'Ubah background katalog sendiri',
        'Penjana Magic Link (URL jemputan unik)'
      ],
      isPopular: false
    }
  ];


  return (
    <div className="pt-24 min-h-screen bg-white">
      <SEO
        title="Harga & Pelan"
        description="Pilih pelan kad jemputan digital yang sesuai dengan bajet anda. Pelan Lite, Pro dan Elite dengan pelbagai ciri premium."
      />
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
