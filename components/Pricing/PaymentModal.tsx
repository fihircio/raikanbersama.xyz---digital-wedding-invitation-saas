import React, { useState } from 'react';
import { Plan } from '../../types';
import { buildApiUrl } from '../../src/config';
import { useAuth } from '../../src/contexts/AuthContext';
import { XMarkIcon, TagIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface PaymentModalProps {
  plan: Plan;
  invitationId?: string;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ plan, invitationId, onClose }) => {
  const { user, token } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');

  // Sync phone number if user object refreshes
  React.useEffect(() => {
    if (user?.phone_number && !phoneNumber) {
      setPhoneNumber(user.phone_number);
    }
  }, [user?.phone_number]);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [discountInfo, setDiscountInfo] = useState<{ discount_type: string, discount_value: number, business_name: string } | null>(null);

  const priceStr = plan.price.toString();
  const originalPrice = Number(priceStr.replace(/RM\s*/, ''));

  const calculateDiscountedPrice = () => {
    if (!discountInfo) return originalPrice;
    if (discountInfo.discount_type === 'percentage') {
      return originalPrice * (1 - discountInfo.discount_value / 100);
    }
    return Math.max(0, originalPrice - discountInfo.discount_value);
  };

  const discountedPrice = calculateDiscountedPrice();

  const handleValidateCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    setCouponError(null);
    try {
      const response = await fetch(buildApiUrl('/coupons/validate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await response.json();
      if (data.success) {
        setDiscountInfo(data.data);
      } else {
        setCouponError(data.message || data.error || 'Kod kupon tidak sah');
        setDiscountInfo(null);
      }
    } catch (error) {
      setCouponError('Ralat sistem. Cuba lagi.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      alert('Sila masukkan nombor telefon untuk tujuan rujukan pembayaran.');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(buildApiUrl('/payments/checkout'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planId: plan.id,
          invitationId: invitationId,
          couponCode: discountInfo ? couponCode : undefined,
          phone: phoneNumber // Send phone to backend
        })
      });

      const data = await response.json();

      if (data.success && data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert('Gagal memulakan pembayaran: ' + (data.error || 'Ralat tidak diketahui'));
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment Error:', error);
      alert('Ralat rangkaian. Sila cuba lagi.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden animate-scale-in border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="p-5 pb-3">
          <div className="relative flex items-center justify-center mb-6">
            <button
              onClick={onClose}
              className="absolute left-0 text-gray-500 hover:text-rose-500 transition flex items-center gap-2 group"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span className="text-[11px] font-bold uppercase tracking-widest hidden sm:inline">Back to Plans</span>
            </button>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Checkout</h2>
          </div>

          <p className="text-center text-gray-400 text-[11px] font-medium mb-4 leading-relaxed max-w-[280px] mx-auto">
            Review your plan selection & apply coupon codes
          </p>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-5 py-2 no-scrollbar space-y-4">

          {/* Plan Details Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-4 flex items-center gap-4 shadow-sm group hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-100 flex-shrink-0 animate-pulse-slow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{plan.name} Plan</h3>
                {plan.period === 'one-time' && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[7px] font-black rounded-md uppercase">Per invitation</span>
                )}
              </div>

              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xs font-black text-gray-900 uppercase">RM</span>
                <span className="text-3xl font-black text-gray-900 tracking-tighter">{originalPrice.toFixed(2)}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-1">/{plan.period === 'monthly' ? 'month' : 'invitation'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Phone Number Field */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-900 uppercase tracking-[0.2em] ml-1 block">Phone Number</label>
              <div className="relative group">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 group-focus-within:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 0123456789"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl text-[12px] font-bold transition-all outline-none focus:border-rose-300 focus:bg-white"
                />
              </div>
            </div>

            {/* Coupon Section */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-900 uppercase tracking-[0.2em] ml-1 block">Coupon Code (Optional)</label>
              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 group-focus-within:text-rose-500 transition-colors" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border-2 rounded-2xl text-[12px] font-bold tracking-widest transition-all outline-none ${couponError ? 'border-red-100 bg-red-50 text-red-600' : 'border-transparent focus:border-rose-300 focus:bg-white'}`}
                  />
                  {discountInfo && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleValidateCoupon}
                  disabled={isValidatingCoupon || !couponCode}
                  className="px-6 py-3 bg-green-200 text-green-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-300 transition-all shadow-sm disabled:opacity-50"
                >
                  {isValidatingCoupon ? '...' : 'Apply'}
                </button>
              </div>
              {couponError && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1 animate-shake">{couponError}</p>}
            </div>

            {/* Order Summary */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.15em] ml-1">Order Summary</h4>
              <div className="space-y-2 bg-gray-50/50 p-4 rounded-3xl border border-gray-50">
                <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <span>{plan.name} Plan</span>
                  <span className="text-gray-900">RM{originalPrice.toFixed(2)}</span>
                </div>
                {discountInfo && (
                  <div className="flex justify-between text-[10px] font-bold text-green-600 uppercase tracking-widest">
                    <span>Discount Applied</span>
                    <span>-RM{(originalPrice - discountedPrice).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-2 border-t border-gray-100 mt-2">
                  <span className="text-md font-black text-gray-900 uppercase tracking-tighter">Total</span>
                  <span className="text-2xl font-black text-gray-900 tracking-tighter">RM{discountedPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button - Sticky at bottom */}
        <div className="p-5 bg-white border-t border-gray-50 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-[12px] uppercase tracking-[0.15em] shadow-lg shadow-green-100 hover:bg-green-700 hover:shadow-green-200 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isProcessing ? 'Processing...' : (
              <>
                <span>Confirm Purchase</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
                <span className="tracking-tight">RM{discountedPrice.toFixed(2)}</span>
              </>
            )}
          </button>

          <div className="flex flex-col items-center justify-center gap-1 mt-3 text-gray-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheckIcon className="w-3 h-3 text-green-500" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Secure payment by Billplz</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;