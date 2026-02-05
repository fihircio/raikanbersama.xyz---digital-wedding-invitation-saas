import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import {
    BriefcaseIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ExclamationCircleIcon,
    ArrowPathIcon,
    LinkIcon,
    CurrencyDollarIcon,
    UserGroupIcon,
    TrashIcon,
    UserIcon
} from '@heroicons/react/24/outline';

interface Affiliate {
    id: string;
    business_name: string;
    business_type: string;
    social_link: string;
    status: 'pending' | 'active' | 'rejected';
    referral_code: string;
    commission_rate: number;
    earnings_total: number;
    user: {
        name: string;
        email: string;
    };
    coupons?: Array<{
        code: string;
        discount_value: number;
        discount_type: string;
    }>;
    created_at: string;
}

const AffiliateManagement: React.FC = () => {
    const { token } = useAuth();
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchAffiliates();
    }, [token]);

    const fetchAffiliates = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await fetch(buildApiUrl('/admin/affiliates'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setAffiliates(data.data);
            } else {
                setError(data.error || 'Failed to fetch affiliates');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string, referralCode?: string) => {
        if (!token) return;
        setIsProcessing(id);
        try {
            const response = await fetch(buildApiUrl(`/admin/affiliates/${id}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, referral_code: referralCode }),
            });

            const data = await response.json();
            if (data.success) {
                setAffiliates(affiliates.map(a => a.id === id ? { ...a, status: status as any, referral_code: referralCode || a.referral_code } : a));
            } else {
                alert(data.error || 'Failed to update status');
            }
        } catch (err) {
            alert('Error updating status');
        } finally {
            setIsProcessing(null);
        }
    };



    const handleDeleteAffiliate = async (id: string) => {
        if (!window.confirm('Adakah anda pasti mahu memadam profile affiliate ini? Semua kupon berkaitan akan dinyahaktifkan.')) return;
        if (!token) return;
        setIsProcessing(id);
        try {
            const response = await fetch(buildApiUrl(`/admin/affiliates/${id}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                setAffiliates(affiliates.filter(a => a.id !== id));
            } else {
                alert(data.error || 'Failed to delete affiliate');
            }
        } catch (err) {
            alert('Error deleting affiliate');
        } finally {
            setIsProcessing(null);
        }
    };

    const generateReferralCode = (businessName: string) => {
        const prefix = businessName.substring(0, 3).toUpperCase().replace(/ /g, '');
        const random = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}${random}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-serif italic tracking-tight">Urus Affiliate</h1>
                        <p className="text-gray-500 text-sm">Review dan urus permohonan rakan kongsi vendor.</p>
                    </div>
                    <button onClick={fetchAffiliates} className="p-2 bg-white rounded-full border border-gray-100 shadow-sm hover:bg-gray-50 transition">
                        <ArrowPathIcon className={`w-5 h-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {error && (
                    <div className="mb-8 bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-2 text-sm font-bold">
                        <ExclamationCircleIcon className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Pemohon & Bisnes</th>
                                    <th className="px-8 py-5">Diskaun Pelanggan</th>
                                    <th className="px-8 py-5">Kod Referral</th>
                                    <th className="px-8 py-5">Info Profil</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Tindakan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {affiliates.map((affiliate) => (
                                    <tr key={affiliate.id} className="text-sm group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-gray-900">{affiliate.business_name}</div>
                                            <div className="text-xs text-rose-600 font-medium mb-1">{affiliate.business_type}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{affiliate.user.name} • {affiliate.user.email}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                {affiliate.coupons && affiliate.coupons.length > 0 ? (
                                                    <span className="text-xs font-bold text-gray-900">
                                                        -{affiliate.coupons[0].discount_value}{affiliate.coupons[0].discount_type === 'percentage' ? '%' : ' MYR'}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300 text-[10px] italic">—</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-1">
                                                {affiliate.coupons && affiliate.coupons.length > 0 ? (
                                                    affiliate.coupons.map(c => (
                                                        <span key={c.code} className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 text-[10px]">
                                                            {c.code}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-300 text-[10px] italic">Tiada Kod</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <a
                                                href={affiliate.social_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition shadow-sm border border-blue-100"
                                                title="Lihat Media Sosial"
                                            >
                                                <LinkIcon className="w-4 h-4" />
                                            </a>
                                        </td>
                                        <td className="px-8 py-6">
                                            <StatusBadge status={affiliate.status} />
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                {affiliate.status !== 'active' && (
                                                    <button
                                                        disabled={isProcessing === affiliate.id}
                                                        onClick={() => handleUpdateStatus(affiliate.id, 'active', affiliate.referral_code || generateReferralCode(affiliate.business_name))}
                                                        className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition shadow-sm border border-green-100 disabled:opacity-50"
                                                        title="Terima / Aktifkan"
                                                    >
                                                        <CheckCircleIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {affiliate.status !== 'rejected' && (
                                                    <button
                                                        disabled={isProcessing === affiliate.id}
                                                        onClick={() => handleUpdateStatus(affiliate.id, 'rejected')}
                                                        className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition shadow-sm border border-amber-100 disabled:opacity-50"
                                                        title="Tolak / Nyahaktif"
                                                    >
                                                        <XCircleIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <button
                                                    disabled={isProcessing === affiliate.id}
                                                    onClick={() => handleDeleteAffiliate(affiliate.id)}
                                                    className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition shadow-sm border border-rose-100 disabled:opacity-50"
                                                    title="Padam Affiliate"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {affiliates.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <BriefcaseIcon className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                                            <p className="text-gray-400 font-medium italic">Tiada permohonan affiliate ditemui.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            <Footer />

            {/* Explanation Modal or Note */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
                <div className="bg-rose-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-rose-200">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                                    <CurrencyDollarIcon className="w-6 h-6 text-rose-300" />
                                </div>
                                <h3 className="text-2xl font-serif italic font-bold">Dual-Benefit System</h3>
                            </div>
                            <p className="text-rose-100 text-sm leading-relaxed mb-6">
                                Sistem kami menyokong strategi menang-menang untuk vendor dan pelanggan.
                                Setiap referral code bertindak sebagai <strong>Kupon Diskaun</strong> untuk pelanggan
                                dan <strong>ID Komisen</strong> untuk vendor.
                            </p>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Diskaun Pelanggan (e.g. 10%)</p>
                                        <p className="text-white/60 text-xs italic">Ditetapkan dalam menu 'Kupon'. Menggalakkan pelanggan guna kod vendor.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Komisen Vendor (e.g. 20%)</p>
                                        <p className="text-white/60 text-xs italic">Ditetapkan mengikut vendor. Vendor dapat peratusan daripada 'Actual Paid' amount.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
                            <div className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.2em] mb-4">Contoh Pengiraan</div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-medium py-2 border-b border-white/10">
                                    <span className="text-white/60 uppercase tracking-widest">Harga Asal</span>
                                    <span>RM 50.00</span>
                                </div>
                                <div className="flex justify-between text-xs font-medium py-2 border-b border-white/10">
                                    <span className="text-rose-300 uppercase tracking-widest">Diskaun Pelanggan (10%)</span>
                                    <span>- RM 5.00</span>
                                </div>
                                <div className="flex justify-between text-base font-bold py-4">
                                    <span className="uppercase tracking-[0.2em]">Pendapatan Bersih</span>
                                    <span>RM 45.00</span>
                                </div>
                                <div className="p-4 bg-rose-500/20 rounded-2xl border border-rose-500/30">
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">Komisen Vendor (20%)</span>
                                            <span className="text-lg font-black italic">RM 9.00</span>
                                        </div>
                                        <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-900/50">
                                            <CurrencyDollarIcon className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'active':
            return <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-[9px] font-bold uppercase tracking-wider">Aktif</span>;
        case 'rejected':
            return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-[9px] font-bold uppercase tracking-wider">Ditolak</span>;
        default:
            return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-[9px] font-bold uppercase tracking-wider">Menunggu</span>;
    }
};

export default AffiliateManagement;
