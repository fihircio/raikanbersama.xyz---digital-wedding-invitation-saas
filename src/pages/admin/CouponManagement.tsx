import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import {
    TicketIcon,
    PlusIcon,
    TagIcon,
    CalendarIcon,
    ArrowPathIcon,
    BriefcaseIcon,
    TrashIcon,
    PencilSquareIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    affiliate_id?: string | null;
    affiliate?: {
        business_name: string;
        commission_rate: number;
        earnings_total: number;
    };
    expiry_date?: string;
    max_uses?: number;
    current_uses: number;
    is_active: boolean;
    created_at: string;
    commission_rate?: number; // For manual tracking if needed or passing to API
    orders?: Array<{
        id: string;
        status: string;
        created_at: string;
        invitation?: {
            id: string;
            bride_name: string;
            groom_name: string;
            slug: string;
        };
    }>;
}

const CouponManagement: React.FC = () => {
    const { token } = useAuth();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [affiliates, setAffiliates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    // New Coupon Data
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discount_type: 'percentage',
        discount_value: 10,
        affiliate_id: '',
        max_uses: 100,
        expiry_date: ''
    });

    useEffect(() => {
        fetchCoupons();
        fetchAffiliates();
    }, [token]);

    const fetchCoupons = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await fetch(buildApiUrl('/admin/coupons'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setCoupons(data.data);
            }
        } catch (err) {
            setError('Error fetching coupons');
        } finally {
            setLoading(false);
        }
    };

    const fetchAffiliates = async () => {
        if (!token) return;
        try {
            const response = await fetch(buildApiUrl('/admin/affiliates'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setAffiliates(data.data.filter((a: any) => a.status === 'active'));
            }
        } catch (err) {
            console.error('Failed to fetch affiliates');
        }
    };

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        try {
            const response = await fetch(buildApiUrl('/admin/coupons'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newCoupon),
            });

            const data = await response.json();
            if (data.success) {
                setCoupons([data.data, ...coupons]);
                setShowCreateModal(false);
                setNewCoupon({
                    code: '',
                    discount_type: 'percentage',
                    discount_value: 10,
                    affiliate_id: '',
                    max_uses: 100,
                    expiry_date: ''
                });
            } else {
                alert(data.error || 'Failed to create coupon');
            }
        } catch (err) {
            alert('Error creating coupon');
        }
    };

    const handleUpdateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !editingCoupon) return;

        try {
            const response = await fetch(buildApiUrl(`/admin/coupons/${editingCoupon.id}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editingCoupon),
            });

            const data = await response.json();
            if (data.success) {
                setCoupons(coupons.map(c => c.id === editingCoupon.id ? data.data : c));
                setEditingCoupon(null);
            } else {
                alert(data.error || 'Failed to update coupon');
            }
        } catch (err) {
            alert('Error updating coupon');
        }
    };

    const handleDeleteCoupon = async (id: string) => {
        if (!window.confirm('Adakah anda pasti mahu memadam kupon ini?')) return;
        if (!token) return;

        try {
            const response = await fetch(buildApiUrl(`/admin/coupons/${id}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                setCoupons(coupons.filter(c => c.id !== id));
            } else {
                alert(data.error || 'Failed to delete coupon');
            }
        } catch (err) {
            alert('Error deleting coupon');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />
            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-serif italic tracking-tight">Kupon & Insentif</h1>
                        <p className="text-gray-500 text-sm">Urus kod diskaun dan program insentif vendor.</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 bg-rose-600 text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-100 transition"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Cipta Kupon
                        </button>
                        <button onClick={fetchCoupons} className="p-2 bg-white rounded-full border border-gray-100 shadow-sm hover:bg-gray-50 transition">
                            <ArrowPathIcon className={`w-5 h-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Kod Kupon</th>
                                    <th className="px-8 py-5">Diskaun</th>
                                    <th className="px-8 py-5">Vendor & Komisen (%)</th>
                                    <th className="px-8 py-5">Earned</th>
                                    <th className="px-8 py-5">Penggunaan</th>
                                    <th className="px-8 py-5">Tamat Tempoh</th>
                                    <th className="px-8 py-5">Kad Dijana</th>
                                    <th className="px-8 py-5 text-right">Tindakan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {coupons.map((coupon) => (
                                    <tr key={coupon.id} className="text-sm hover:bg-gray-50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <TagIcon className="w-4 h-4 text-rose-500" />
                                                <div className="flex flex-col">
                                                    <span className="font-mono font-bold text-gray-900 text-base">{coupon.code}</span>
                                                    {!coupon.is_active && (
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Nyahaktif</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-bold text-emerald-600">
                                                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `RM ${coupon.discount_value}`}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {coupon.affiliate ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <BriefcaseIcon className="w-4 h-4 text-indigo-400" />
                                                        <span className="text-xs font-bold text-gray-700">{coupon.affiliate.business_name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rate</span>
                                                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                                                            {coupon.affiliate.commission_rate}%
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 text-xs italic">Umum (Bukan Affiliate)</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            {coupon.affiliate ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-tight">RM {Number(coupon.affiliate.earnings_total).toFixed(2)}</span>
                                                    <span className="text-[9px] text-gray-400 font-medium">Total Paid Out</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 text-[10px]">—</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-gray-400">
                                                    <span>{coupon.current_uses} / {coupon.max_uses || '∞'}</span>
                                                </div>
                                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-rose-500"
                                                        style={{ width: `${coupon.max_uses ? (coupon.current_uses / coupon.max_uses) * 100 : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-1.5 text-gray-500 font-medium text-xs">
                                                <CalendarIcon className="w-3.5 h-3.5" />
                                                {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Tiada'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-1 w-48">
                                                {coupon.orders && coupon.orders.length > 0 ? (
                                                    // Deduplicate invitations
                                                    Array.from(new Set(coupon.orders.filter(o => o.invitation).map(o => JSON.stringify(o.invitation)))).map((invStr, idx) => {
                                                        const invitation = JSON.parse(invStr as string);
                                                        return (
                                                            <a
                                                                key={`${invitation.id}-${idx}`}
                                                                href={`/i/${invitation.slug}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-600 rounded border border-gray-100 text-[9px] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition whitespace-nowrap"
                                                            >
                                                                <TicketIcon className="w-2.5 h-2.5" />
                                                                <span className="truncate max-w-[80px]">{invitation.bride_name} & {invitation.groom_name}</span>
                                                            </a>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="text-gray-300 text-[10px] italic">Tiada Order</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingCoupon(coupon)}
                                                    className="p-1.5 bg-indigo-50 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg transition-all"
                                                    title="Edit Kupon"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCoupon(coupon.id)}
                                                    className="p-1.5 bg-rose-50 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg transition-all"
                                                    title="Padam Kupon"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {coupons.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={8} className="px-8 py-20 text-center opacity-30">
                                            <TicketIcon className="w-12 h-12 mx-auto mb-4" />
                                            <p className="text-xs font-bold uppercase tracking-widest italic">Belum ada kupon dicipta.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-[3rem] w-full max-w-md p-10 animate-scale-in">
                            <h2 className="text-2xl font-serif italic font-bold mb-8">Cipta Kupon Baru</h2>
                            <form className="space-y-6" onSubmit={handleCreateCoupon}>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kod Kupon</label>
                                    <input
                                        required
                                        type="text"
                                        value={newCoupon.code}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                        placeholder="E.g. KAHWIN20"
                                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-bold"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Jenis Diskaun</label>
                                        <select
                                            value={newCoupon.discount_type}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value as any })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-bold appearance-none"
                                        >
                                            <option value="percentage">Peratus (%)</option>
                                            <option value="fixed">Tetap (RM)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nilai</label>
                                        <input
                                            required
                                            type="number"
                                            value={newCoupon.discount_value}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: parseInt(e.target.value) })}
                                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Had Penggunaan</label>
                                        <input
                                            type="number"
                                            value={newCoupon.max_uses}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: parseInt(e.target.value) })}
                                            placeholder="E.g. 100"
                                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tamat Tempoh (Optional)</label>
                                        <input
                                            type="date"
                                            value={newCoupon.expiry_date}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, expiry_date: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-bold appearance-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kaitan Affiliate (Optional)</label>
                                    <select
                                        value={newCoupon.affiliate_id}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, affiliate_id: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-bold appearance-none"
                                    >
                                        <option value="">Tiada (Diskaun Umum)</option>
                                        {affiliates.map(a => (
                                            <option key={a.id} value={a.id}>{a.business_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-4 text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-gray-600"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-rose-700 transition"
                                    >
                                        Cipta Kupon
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {editingCoupon && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-[3rem] w-full max-w-md p-10 animate-scale-in">
                            <div className="flex justify-between items-start mb-8">
                                <h2 className="text-2xl font-serif italic font-bold">Edit Kupon</h2>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${editingCoupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {editingCoupon.is_active ? 'Aktif' : 'Tidak Aktif'}
                                </span>
                            </div>
                            <form className="space-y-6" onSubmit={handleUpdateCoupon}>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kod Kupon</label>
                                    <input
                                        required
                                        type="text"
                                        value={editingCoupon.code}
                                        onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-bold"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Jenis Diskaun</label>
                                        <select
                                            value={editingCoupon.discount_type}
                                            onChange={(e) => setEditingCoupon({ ...editingCoupon, discount_type: e.target.value as any })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-bold appearance-none"
                                        >
                                            <option value="percentage">Peratus (%)</option>
                                            <option value="fixed">Tetap (RM)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nilai</label>
                                        <input
                                            required
                                            type="number"
                                            value={editingCoupon.discount_value}
                                            onChange={(e) => setEditingCoupon({ ...editingCoupon, discount_value: parseInt(e.target.value) })}
                                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Had Penggunaan</label>
                                        <input
                                            type="number"
                                            value={editingCoupon.max_uses || ''}
                                            onChange={(e) => setEditingCoupon({ ...editingCoupon, max_uses: e.target.value ? parseInt(e.target.value) : undefined })}
                                            placeholder="Tiada Had"
                                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tamat Tempoh</label>
                                        <input
                                            type="date"
                                            value={editingCoupon.expiry_date ? new Date(editingCoupon.expiry_date).toISOString().split('T')[0] : ''}
                                            onChange={(e) => setEditingCoupon({ ...editingCoupon, expiry_date: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-bold appearance-none"
                                        />
                                    </div>
                                </div>
                                {editingCoupon.affiliate && (
                                    <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100 space-y-3">
                                        <label className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <CurrencyDollarIcon className="w-3.5 h-3.5" />
                                            Affiliate Komisen Setting
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <p className="text-[10px] text-gray-400 font-medium mb-1">Set Peratus Komisen (%)</p>
                                                <input
                                                    type="number"
                                                    value={editingCoupon.commission_rate ?? editingCoupon.affiliate.commission_rate}
                                                    onChange={(e) => setEditingCoupon({ ...editingCoupon, commission_rate: parseFloat(e.target.value) })}
                                                    className="w-full px-4 py-2.5 bg-white border border-rose-100 rounded-xl text-sm font-bold focus:border-rose-300 outline-none transition"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-gray-400 font-medium mb-1">Total Earned Vendor</p>
                                                <p className="text-base font-black text-rose-900 leading-none mt-1.5">
                                                    RM {Number(editingCoupon.affiliate.earnings_total).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-rose-400 italic">
                                            Komisen dikira berdasarkan jumlah yang pelanggan bayar (selepas diskaun).
                                        </p>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 px-1">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={editingCoupon.is_active}
                                        onChange={(e) => setEditingCoupon({ ...editingCoupon, is_active: e.target.checked })}
                                        className="w-5 h-5 rounded-lg border-gray-200 text-rose-600 focus:ring-rose-500 transition-all cursor-pointer"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-bold text-gray-600 cursor-pointer">Kupon Aktif</label>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingCoupon(null)}
                                        className="flex-1 py-4 text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-gray-600"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition"
                                    >
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default CouponManagement;
