import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import {
    CreditCardIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    ArrowPathIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

interface Order {
    id: string;
    order_number: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    plan_tier: string;
    payment_method: string;
    user: {
        name: string;
        email: string;
    };
    created_at: string;
}

const OrderManagement: React.FC = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchOrders();
    }, [page, token]);

    const fetchOrders = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await fetch(buildApiUrl(`/admin/orders?page=${page}`), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setOrders(data.data.orders);
                setTotalPages(data.data.pagination.totalPages);
            }
        } catch (err) {
            console.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-serif italic tracking-tight">Transaksi Platform</h1>
                        <p className="text-gray-500 text-sm">Pantau semua jualan dan status pembayaran.</p>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-2 bg-emerald-50 rounded-xl">
                            <CurrencyDollarIcon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Sales</p>
                            <p className="text-sm font-bold text-gray-900">RM {orders.reduce((acc, curr) => acc + (curr.status === 'completed' ? Number(curr.amount) : 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Order #</th>
                                    <th className="px-8 py-5">Pelanggan</th>
                                    <th className="px-8 py-5">Pakej</th>
                                    <th className="px-8 py-5">Jumlah</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Tarikh</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center text-gray-400 italic">
                                            <ArrowPathIcon className="w-8 h-8 mx-auto mb-4 animate-spin text-rose-200" />
                                            Memuatkan senarai transaksi...
                                        </td>
                                    </tr>
                                ) : orders.map((o) => (
                                    <tr key={o.id} className="text-sm group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="font-mono text-xs font-bold text-gray-400">{o.order_number || o.id.substring(0, 8)}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-gray-900">{o.user?.name}</div>
                                            <div className="text-xs text-gray-400">{o.user?.email}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                                {o.plan_tier}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-bold text-gray-900">
                                            {o.currency} {o.amount.toLocaleString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <StatusBadge status={o.status} />
                                        </td>
                                        <td className="px-8 py-6 text-right text-gray-400 text-xs">
                                            {o.created_at || (o as any).createdAt ? new Date(o.created_at || (o as any).createdAt).toLocaleDateString() : 'Invalid Date'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center text-gray-500">
                    <span className="text-xs font-medium">Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition disabled:opacity-30"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                            className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition disabled:opacity-30"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'completed':
            return (
                <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border border-green-100">
                    <CheckCircleIcon className="w-3.5 h-3.5" /> Berjaya
                </div>
            );
        case 'failed':
            return (
                <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border border-red-100">
                    <XCircleIcon className="w-3.5 h-3.5" /> Gagal
                </div>
            );
        default:
            return (
                <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border border-amber-100">
                    <ClockIcon className="w-3.5 h-3.5" /> Menunggu
                </div>
            );
    }
};

export default OrderManagement;
