# Technical Specifications for Catalog & Pricing Pages

## 1. Catalog Page Implementation

### 1.1 Component Structure

```typescript
// types.ts additions
export interface BackgroundImage {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  category: 'popular' | 'minimalist' | 'elegant' | 'floral';
  isPremium: boolean;
  tags: string[];
}

export interface CatalogState {
  backgrounds: BackgroundImage[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  selectedBackground: BackgroundImage | null;
  isAuthenticated: boolean;
}
```

### 1.2 CatalogPage Component

```typescript
// components/Catalog/CatalogPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundGrid from './BackgroundGrid';
import Pagination from './Pagination';
import { BackgroundImage } from '../../types';

const CatalogPage: React.FC = () => {
  const [state, setState] = useState<CatalogState>({
    backgrounds: [],
    currentPage: 1,
    totalPages: 3,
    isLoading: true,
    selectedBackground: null,
    isAuthenticated: false // Check from auth context
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch backgrounds for current page
    fetchBackgrounds(state.currentPage);
    // Check authentication status
    checkAuthStatus();
  }, [state.currentPage]);

  const fetchBackgrounds = async (page: number) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    // Mock data - replace with API call
    const mockBackgrounds: BackgroundImage[] = Array.from({ length: 15 }, (_, i) => ({
      id: `bg-${page}-${i + 1}`,
      name: `Background ${(page - 1) * 15 + i + 1}`,
      url: `https://picsum.photos/seed/bg${page}${i}/800/1200.jpg`,
      thumbnail: `https://picsum.photos/seed/bg${page}${i}/400/600.jpg`,
      category: ['popular', 'minimalist', 'elegant', 'floral'][Math.floor(Math.random() * 4)] as any,
      isPremium: Math.random() > 0.7,
      tags: ['wedding', 'elegant', 'modern']
    }));
    
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        backgrounds: mockBackgrounds,
        isLoading: false
      }));
    }, 500);
  };

  const handleBackgroundSelect = (background: BackgroundImage) => {
    if (!state.isAuthenticated) {
      // Redirect to login with return URL
      navigate('/login?redirect=/catalog&bg=' + background.id);
      return;
    }
    
    // Store selected background in sessionStorage
    sessionStorage.setItem('selectedBackground', JSON.stringify(background));
    
    // Navigate to editor with new invitation or existing
    navigate('/edit/new'); // Or navigate to existing invitation
  };

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
            Pilih Tema Kad Jemputan Anda
          </h1>
          <p className="text-lg text-gray-600">
            Koleksi premium untuk majlis perkahwinan istimewa anda
          </p>
        </div>
        
        {state.isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <BackgroundGrid 
            backgrounds={state.backgrounds}
            onSelect={handleBackgroundSelect}
            isAuthenticated={state.isAuthenticated}
          />
        )}
        
        <Pagination 
          currentPage={state.currentPage}
          totalPages={state.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default CatalogPage;
```

### 1.3 BackgroundGrid Component

```typescript
// components/Catalog/BackgroundGrid.tsx
import React from 'react';
import BackgroundCard from './BackgroundCard';
import { BackgroundImage } from '../../types';

interface BackgroundGridProps {
  backgrounds: BackgroundImage[];
  onSelect: (background: BackgroundImage) => void;
  isAuthenticated: boolean;
}

const BackgroundGrid: React.FC<BackgroundGridProps> = ({ 
  backgrounds, 
  onSelect, 
  isAuthenticated 
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
      {backgrounds.map((background) => (
        <BackgroundCard
          key={background.id}
          background={background}
          onSelect={() => onSelect(background)}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  );
};

export default BackgroundGrid;
```

### 1.4 BackgroundCard Component

```typescript
// components/Catalog/BackgroundCard.tsx
import React, { useState } from 'react';
import { BackgroundImage } from '../../types';

interface BackgroundCardProps {
  background: BackgroundImage;
  onSelect: () => void;
  isAuthenticated: boolean;
}

const BackgroundCard: React.FC<BackgroundCardProps> = ({ 
  background, 
  onSelect, 
  isAuthenticated 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105">
        <img 
          src={background.thumbnail} 
          alt={background.name}
          className="w-full h-full object-cover"
        />
        
        {background.isPremium && (
          <div className="absolute top-3 right-3 bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Premium
          </div>
        )}
        
        {isHovered && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300">
            <div className="text-center">
              <button className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold text-sm mb-2 hover:bg-gray-100 transition">
                {isAuthenticated ? 'Apply' : 'Login to Apply'}
              </button>
              <p className="text-white text-xs">{background.name}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 text-center">
        <p className="text-sm font-medium text-gray-900">{background.name}</p>
        <p className="text-xs text-gray-500 capitalize">{background.category}</p>
      </div>
    </div>
  );
};

export default BackgroundCard;
```

### 1.5 Pagination Component

```typescript
// components/Catalog/Pagination.tsx
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-lg font-bold transition ${
            currentPage === page
              ? 'bg-rose-600 text-white'
              : 'border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
```

## 2. Pricing Page Implementation

### 2.1 PricingPage Component

```typescript
// components/Pricing/PricingPage.tsx
import React from 'react';
import PricingCard from './PricingCard';
import FeatureComparison from './FeatureComparison';

const PricingPage: React.FC = () => {
  const plans = [
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
```

### 2.2 PricingCard Component

```typescript
// components/Pricing/PricingCard.tsx
import React, { useState } from 'react';
import PaymentModal from './PaymentModal';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular: boolean;
}

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
          className={`w-full py-4 rounded-full font-bold text-lg transition ${
            plan.isPopular
              ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          {plan.isPopular ? 'Start Premium Trial' : 'Choose Basic'}
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
```

### 2.3 FeatureComparison Component

```typescript
// components/Pricing/FeatureComparison.tsx
import React from 'react';

interface Plan {
  id: string;
  name: string;
  features: string[];
}

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
```

### 2.4 PaymentModal Component

```typescript
// components/Pricing/PaymentModal.tsx
import React, { useState } from 'react';

interface Plan {
  id: string;
  name: string;
  price: string;
}

interface PaymentModalProps {
  plan: Plan;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ plan, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    paymentMethod: 'card'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      alert('Payment successful! Redirecting to dashboard...');
      onClose();
      // Navigate to dashboard or success page
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Complete Purchase</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-lg text-gray-900">{plan.name} Plan</h3>
          <p className="text-3xl font-bold text-rose-600 mt-2">{plan.price}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
            >
              <option value="card">Credit/Debit Card</option>
              <option value="online">Online Banking</option>
              <option value="ewallet">E-Wallet</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-rose-600 text-white py-3 rounded-lg font-bold hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : `Pay ${plan.price}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
```

## 3. Integration with Editor Studio

### 3.1 Update Editor.tsx to handle selected background

```typescript
// In Editor.tsx component
useEffect(() => {
  const found = MOCK_INVITATIONS.find(item => item.id === id);
  if (found) {
    // Check for selected background from catalog
    const selectedBackground = sessionStorage.getItem('selectedBackground');
    if (selectedBackground) {
      const background = JSON.parse(selectedBackground);
      setInv({ 
        ...found, 
        settings: { 
          ...found.settings, 
          background_image: background.url 
        } 
      });
      // Clear from sessionStorage after applying
      sessionStorage.removeItem('selectedBackground');
    } else {
      setInv(found);
    }
  }
}, [id]);
```

## 4. Routing Updates

### 4.1 Update App.tsx

```typescript
// In App.tsx, add new routes
<Routes>
  <Route path="/" element={<><Navbar /><Home /></>} />
  <Route path="/catalog" element={<><Navbar /><CatalogPage /></>} />
  <Route path="/pricing" element={<><Navbar /><PricingPage /></>} />
  <Route path="/dashboard" element={<><Navbar /><Dashboard /></>} />
  <Route path="/edit/:id" element={<><Navbar /><Editor /></>} />
  <Route path="/manage/:id" element={<><Navbar /><ManageInvitation /></>} />
  <Route path="/i/:slug" element={<PublicInvitation />} />
</Routes>
```

### 4.2 Update Navbar.tsx

```typescript
// In Navbar.tsx, update links
<Link to="/catalog" className="text-gray-600 hover:text-rose-600 font-medium transition">Templates</Link>
<Link to="/pricing" className="text-gray-600 hover:text-rose-600 font-medium transition">Pricing</Link>
```

## 5. Authentication Integration

### 5.1 Auth Context Setup

```typescript
// contexts/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication status on mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    // Implementation for checking auth status
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  };

  const login = async (email: string, password: string) => {
    // Implementation for login
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
```

This technical specification provides detailed implementation guidance for both the catalog and pricing pages, including all necessary components, state management, routing, and integration points with the existing system.