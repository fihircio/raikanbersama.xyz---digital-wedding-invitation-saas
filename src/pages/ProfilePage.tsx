import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { buildApiUrl } from '../config';
import {
    CheckBadgeIcon,
    ArrowPathIcon,
    XMarkIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    TicketIcon,
    UserGroupIcon,
    BanknotesIcon
} from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';

interface Earning {
    id: string;
    amount: string;
    commission_rate: string;
    status: 'pending' | 'paid' | 'cancelled';
    created_at: string;
    order: {
        amount: string;
    };
}

interface AffiliateDetails {
    referral_code: string;
    commission_rate: string;
    status: string;
    coupons: Array<{
        code: string;
        usage_count: number;
        usage_limit: number | null;
    }>;
    earnings_total: string;
    successful_referrals: number;
}

const ProfilePage: React.FC = () => {
    const { user, token, updateUser } = useAuth();
    const location = useLocation();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [csrfToken, setCsrfToken] = useState<string | null>(null);
    const [affiliateStatus, setAffiliateStatus] = useState<'pending' | 'active' | 'rejected' | null>(null);
    const [earnings, setEarnings] = useState<Earning[]>([]);
    const [affiliateDetails, setAffiliateDetails] = useState<AffiliateDetails | null>(null);
    const [isLoadingEarnings, setIsLoadingEarnings] = useState(false);
    const [showAffiliateModal, setShowAffiliateModal] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone_number: '',
        company_name: ''
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user && token) {
            fetchProfile();
            fetchAffiliateStatus();
        }
    }, [user, token]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('tab') === 'vendor' && affiliateStatus === 'active') {
            openAffiliateModal();
        }
    }, [location.search, affiliateStatus]);

    const fetchAffiliateStatus = async () => {
        try {
            const response = await fetch(buildApiUrl('/affiliates/my-status'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success && data.data) {
                setAffiliateStatus(data.data.status);
                if (data.data.status === 'active') {
                    fetchAffiliateDetails();
                }
            }
        } catch (err) {
            console.error('Failed to fetch affiliate status');
        }
    };

    const fetchAffiliateDetails = async () => {
        try {
            const statusRes = await fetch(buildApiUrl('/affiliates/my-status'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const statusData = await statusRes.json();

            if (statusData.success && statusData.data) {
                setAffiliateDetails({
                    referral_code: statusData.data.referral_code,
                    commission_rate: statusData.data.commission_rate,
                    status: statusData.data.status,
                    coupons: [],
                    earnings_total: '0.00',
                    successful_referrals: 0
                });
            }
        } catch (err) {
            console.error("Failed to fetch affiliate details");
        }
    };

    const fetchEarnings = async () => {
        setIsLoadingEarnings(true);
        try {
            const response = await fetch(buildApiUrl('/affiliates/my-earnings'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            // Try to fetch coupon data if endpoint exists, or mock empty for now
            let couponsData = { success: false, data: [] };
            try {
                const couponsRes = await fetch(buildApiUrl('/coupons/my-coupons'), {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (couponsRes.ok) couponsData = await couponsRes.json();
            } catch (e) { }

            if (data.success) {
                setEarnings(data.data);

                const total = data.data.reduce((acc: number, curr: Earning) => acc + parseFloat(curr.amount), 0);
                const count = data.data.length;

                setAffiliateDetails(prev => prev ? ({
                    ...prev,
                    earnings_total: total.toFixed(2),
                    successful_referrals: count,
                    coupons: couponsData.success ? couponsData.data : []
                }) : null);
            }
        } catch (err) {
            console.error('Failed to fetch earnings');
        } finally {
            setIsLoadingEarnings(false);
        }
    };

    const openAffiliateModal = () => {
        setShowAffiliateModal(true);
        fetchEarnings();
        fetchAffiliateDetails();
    };

    const fetchProfile = async () => {
        try {
            const response = await fetch(buildApiUrl('/profile'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });

            // Capture CSRF token
            const newToken = response.headers.get('X-CSRF-Token');
            if (newToken) setCsrfToken(newToken);

            if (response.ok) {
                const data = await response.json();
                const profile = data.data;
                setFormData({
                    name: profile.name || '',
                    phone_number: profile.phone_number || '',
                    company_name: profile.company_name || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        try {
            const headers: Record<string, string> = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

            const response = await fetch(buildApiUrl('/profile'), {
                method: 'PUT',
                headers,
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            // Refresh token
            const newToken = response.headers.get('X-CSRF-Token');
            if (newToken) setCsrfToken(newToken);

            if (response.ok) {
                const data = await response.json();
                setMessage({ type: 'success', text: 'Profile updated successfully' });
                setIsEditing(false);
                // Update user in context to ensure it's refreshed everywhere (like Payment Modal)
                if (data.data) {
                    updateUser(data.data);
                }
            } else {
                const data = await response.json();
                setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        try {
            const headers: Record<string, string> = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

            const response = await fetch(buildApiUrl('/profile/password'), {
                method: 'PUT',
                headers,
                credentials: 'include',
                body: JSON.stringify({
                    oldPassword: passwordData.oldPassword,
                    newPassword: passwordData.newPassword
                })
            });

            // Refresh token
            const newToken = response.headers.get('X-CSRF-Token');
            if (newToken) setCsrfToken(newToken);

            if (response.ok) {
                setMessage({ type: 'success', text: 'Password changed successfully' });
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                const data = await response.json();
                setMessage({ type: 'error', text: data.error || 'Failed to change password' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        }
    };

    if (isLoading) {
        return (
            <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {message && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-12 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold font-serif italic">{formData.name || user?.name}</h1>
                                    <p className="text-white/80 mt-1">{user?.email}</p>
                                    <div className="mt-3 inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full">
                                        <span className="text-sm font-bold uppercase tracking-wider">{user?.membership_tier} Member</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                {affiliateStatus === 'active' && (
                                    <button
                                        onClick={openAffiliateModal}
                                        className="bg-rose-100 text-rose-600 px-6 py-2 rounded-full font-bold hover:bg-rose-200 transition flex items-center justify-center gap-2"
                                    >
                                        <CheckBadgeIcon className="w-5 h-5" />
                                        Vendor
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="bg-white text-rose-600 px-6 py-2 rounded-full font-bold hover:bg-rose-50 transition"
                                >
                                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 font-serif italic">Profile Settings</h2>

                        <form onSubmit={handleUpdateProfile}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium disabled:opacity-70 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
                                        placeholder="Your full name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 font-medium cursor-not-allowed"
                                        title="Email cannot be changed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="text"
                                        value={formData.phone_number}
                                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium disabled:opacity-70 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
                                        placeholder="e.g. 0123456789"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Company Name</label>
                                    <input
                                        type="text"
                                        value={formData.company_name}
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium disabled:opacity-70 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
                                        placeholder="Optional"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Membership Tier</label>
                                    <input
                                        type="text"
                                        value={user?.membership_tier || ''}
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 font-bold uppercase cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {isEditing && (
                                <div className="mt-8 flex justify-end">
                                    <button
                                        type="submit"
                                        className="bg-rose-600 text-white px-8 py-3 rounded-full font-bold hover:bg-rose-700 transition shadow-lg shadow-rose-100"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Password Change Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 font-serif italic">Security</h2>
                    <form onSubmit={handleChangePassword}>
                        <div className="space-y-6 max-w-lg">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.oldPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-gray-800 text-white px-8 py-3 rounded-full font-bold hover:bg-black transition shadow-lg shadow-gray-100"
                            >
                                Change Password
                            </button>
                        </div>
                    </form>
                </div>

                {/* Affiliate Earnings Modal */}
                {showAffiliateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in flex flex-col">
                            {/* Modal Header */}
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-rose-50/30">
                                <div>
                                    <h3 className="text-2xl font-serif italic font-bold text-gray-900">Dashboard Vendor</h3>
                                    <p className="text-xs text-rose-600 font-bold uppercase tracking-widest mt-1">Status: Aktif</p>
                                </div>
                                <button
                                    onClick={() => setShowAffiliateModal(false)}
                                    className="p-2 hover:bg-rose-100 rounded-full text-gray-400 hover:text-rose-600 transition"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {isLoadingEarnings ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <ArrowPathIcon className="w-10 h-10 text-rose-500 animate-spin mb-4" />
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Memuat turun data...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {/* Referral Code & Tier Progress */}
                                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col justify-between relative overflow-hidden">
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <TicketIcon className="w-4 h-4 text-rose-500" />
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kod Referral</span>
                                                    </div>
                                                    <div className="text-lg font-black text-gray-900 font-mono tracking-wider mb-2">
                                                        {affiliateDetails?.referral_code || '-'}
                                                    </div>

                                                    {/* Tier Progress Bar */}
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                                                        <div
                                                            className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
                                                            style={{ width: `${Math.min(100, Math.max(0, ((affiliateDetails?.successful_referrals || 0) / (affiliateDetails?.successful_referrals && affiliateDetails.successful_referrals >= 26 ? 26 : (affiliateDetails?.successful_referrals && affiliateDetails.successful_referrals >= 11 ? 25 : 10))) * 100))}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-wider">
                                                        <span>{affiliateDetails?.successful_referrals || 0} / {affiliateDetails?.successful_referrals && affiliateDetails.successful_referrals >= 26 ? 'MAX' : (affiliateDetails?.successful_referrals && affiliateDetails.successful_referrals >= 11 ? '25' : '10')}</span>
                                                        <span>Tier {affiliateDetails?.successful_referrals && affiliateDetails.successful_referrals >= 26 ? '3' : (affiliateDetails?.successful_referrals && affiliateDetails.successful_referrals >= 11 ? '2' : '1')}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Commission Rate & Badge */}
                                            <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 flex flex-col justify-between relative overflow-hidden">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <BanknotesIcon className="w-4 h-4 text-rose-600" />
                                                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Komisen</span>
                                                    </div>
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${(affiliateDetails?.successful_referrals || 0) >= 26 ? 'bg-amber-100 text-amber-600 border-amber-200' :
                                                            (affiliateDetails?.successful_referrals || 0) >= 11 ? 'bg-slate-200 text-slate-600 border-slate-300' :
                                                                'bg-rose-100 text-rose-600 border-rose-200'
                                                        }`}>
                                                        Tier {(affiliateDetails?.successful_referrals || 0) >= 26 ? '3' : ((affiliateDetails?.successful_referrals || 0) >= 11 ? '2' : '1')}
                                                    </span>
                                                </div>
                                                <div className="text-lg font-black text-rose-600">
                                                    {affiliateDetails?.commission_rate || '0'}%
                                                </div>
                                                <div className="text-[10px] text-rose-400 mt-1">
                                                    Setiap jualan
                                                </div>
                                            </div>

                                            {/* Usage Stats (Aggregated for now) */}
                                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col justify-between">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <UserGroupIcon className="w-4 h-4 text-blue-500" />
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jualan</span>
                                                </div>
                                                <div className="text-lg font-black text-gray-900">
                                                    {affiliateDetails?.successful_referrals || 0}
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-1">
                                                    Berjaya
                                                </div>
                                            </div>

                                            {/* Total Earnings */}
                                            <div className="bg-green-50 p-5 rounded-2xl border border-green-100 flex flex-col justify-between">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
                                                    <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Jumlah Untung</span>
                                                </div>
                                                <div className="text-lg font-black text-green-700">
                                                    RM {affiliateDetails?.earnings_total || '0.00'}
                                                </div>
                                                <div className="text-[10px] text-green-600 mt-1">
                                                    Diterima
                                                </div>
                                            </div>
                                        </div>

                                        {/* Commission History Table */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-l-4 border-rose-500 pl-3">Sejarah Transaksi</h4>

                                            {earnings.length > 0 ? (
                                                <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
                                                    <div className="hidden sm:grid grid-cols-4 bg-gray-50 px-6 py-4 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                        <div>Tarikh</div>
                                                        <div>Jualan</div>
                                                        <div>% Komisen</div>
                                                        <div className="text-right">Untung</div>
                                                    </div>
                                                    <div className="divide-y divide-gray-50">
                                                        {earnings.map((e) => (
                                                            <div key={e.id} className="p-6 sm:grid sm:grid-cols-4 items-center hover:bg-gray-50 transition gap-4">
                                                                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                                                    <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                                                                        <CalendarIcon className="w-4 h-4" />
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-xs font-bold text-gray-900">
                                                                            {new Date(e.created_at || (e as any).createdAt).toLocaleDateString('ms-MY', {
                                                                                day: 'numeric', month: 'short', year: 'numeric'
                                                                            })}
                                                                        </span>
                                                                        <span className="text-[10px] text-gray-400">
                                                                            {new Date(e.created_at || (e as any).createdAt).toLocaleTimeString('ms-MY', {
                                                                                hour: '2-digit', minute: '2-digit'
                                                                            })}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between sm:block mb-1 sm:mb-0">
                                                                    <span className="sm:hidden text-[10px] font-bold text-gray-400 uppercase">Jualan:</span>
                                                                    <span className="text-xs font-bold text-gray-600">RM {Number(e.order.amount).toLocaleString()}</span>
                                                                </div>

                                                                <div className="flex items-center justify-between sm:block mb-1 sm:mb-0">
                                                                    <span className="sm:hidden text-[10px] font-bold text-gray-400 uppercase">Rate:</span>
                                                                    <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-1 rounded-full border border-rose-200">
                                                                        {e.commission_rate}%
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center justify-between sm:justify-end gap-2">
                                                                    <span className="sm:hidden text-[10px] font-bold text-rose-400 uppercase">Untung:</span>
                                                                    <div className="flex items-center gap-2 text-green-600">
                                                                        <span className="text-sm font-black">+ RM {Number(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-16 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <CurrencyDollarIcon className="w-8 h-8 text-gray-300" />
                                                    </div>
                                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tiada Rekod Jualan</h4>
                                                    <p className="text-xs text-gray-300 mt-2">Belum ada komisen yang direkodkan.</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                                <button
                                    onClick={() => setShowAffiliateModal(false)}
                                    className="px-8 py-3 bg-black text-white rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-gray-800 transition shadow-lg"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
