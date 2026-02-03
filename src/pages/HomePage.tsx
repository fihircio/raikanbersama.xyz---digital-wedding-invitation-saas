import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const HomePage: React.FC = () => (
  <div className="pt-24 min-h-screen bg-white">
    <SEO
      title="Bina Kad Jemputan Digital & Wedding No.1 Malaysia"
      description="Platform premium untuk kad jemputan digital. Bina sendiri kad idaman anda secara real-time dari peranti anda. Mudah & Pantas."
    />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
      <div className="inline-block bg-rose-50 text-rose-600 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] mb-12 animate-bounce border border-rose-100 shadow-sm font-sans">
        Digital E-Invitation
      </div>
      <h1 className="text-6xl md:text-9xl font-serif font-bold text-gray-900 mb-10 tracking-tighter leading-[0.9]">
        Raikan Cinta <br />
        <span className="text-rose-600 italic">Secara Elegan.</span>
      </h1>
      <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-16 font-light leading-relaxed font-sans">
        Platform premium untuk kad jemputan digital. Bina sendiri kad idaman anda secara real-time dari peranti anda.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-6">
        <Link
          to="/dashboard"
          className="bg-rose-600 text-white px-12 py-6 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-rose-700 shadow-2xl shadow-rose-200 transition transform hover:-translate-y-2 active:scale-95"
        >
          Mula Bina Percuma
        </Link>
        <Link
          to="/catalog"
          className="bg-white border border-gray-100 text-gray-700 px-12 py-6 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gray-50 transition shadow-xl"
        >
          Lihat Katalog
        </Link>
      </div>

      <div className="mt-40 grid md:grid-cols-3 gap-12">
        {[
          { title: 'Editor Studio', desc: 'Reka kad jemputan digital anda sendiri dalam masa 5 minit.' },
          { title: 'Analitik Real-time', desc: 'Pantau jumlah tetamu & view kad anda secara langsung.' },
          { title: 'Sistem RSVP', desc: 'Uruskan maklum balas tetamu & hadiah dengan mudah.' }
        ].map((feat, i) => (
          <div key={i} className="bg-gray-50/50 p-12 rounded-[3.5rem] border border-gray-100 hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition duration-700 text-left group">
            <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-8 group-hover:rotate-12 transition shadow-inner">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 font-serif italic tracking-tight">{feat.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light font-sans">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default HomePage;