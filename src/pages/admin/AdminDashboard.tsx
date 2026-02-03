import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import {
    UsersIcon,
    EnvelopeIcon,
    CreditCardIcon,
    ArrowTrendingUpIcon,
    ArrowPathIcon,
    ExclamationCircleIcon,
    ArrowUpRightIcon,
    ArrowTrendingDownIcon,
    BriefcaseIcon,
    ChatBubbleLeftRightIcon,
    TicketIcon
} from '@heroicons/react/24/outline';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

const AdminDashboard = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
    }, [token]);

    const fetchStats = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const response = await fetch(buildApiUrl('/admin/stats'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.data);
                setError(null);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to load dashboard statistics.');
                if (response.status === 403) {
                    navigate('/dashboard');
                }
            }
        } catch (err: any) {
            console.error('Error fetching admin stats:', err);
            setError('An error occurred while connecting to the server.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="pt-24 pb-12 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading admin data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {/* Quick Actions / Management Hub */}
                <div className="flex flex-wrap gap-4 mb-10">
                    <QuickLink to="/admin/affiliates" icon={<BriefcaseIcon className="w-5 h-5 text-indigo-600" />} label="Urus Affiliate" />
                    <QuickLink to="/admin/contacts" icon={<ChatBubbleLeftRightIcon className="w-5 h-5 text-rose-600" />} label="Peti Masuk" />
                    <QuickLink to="/admin/coupons" icon={<TicketIcon className="w-5 h-5 text-amber-600" />} label="Kupon & Insentif" />
                    <QuickLink to="/admin/users" icon={<UsersIcon className="w-5 h-5 text-blue-600" />} label="Urus Pengguna" />
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-serif italic tracking-tight">Admin Dashboard</h1>
                        <p className="text-gray-500 text-sm">Platform overview and management hub.</p>
                    </div>
                    <button
                        onClick={fetchStats}
                        className="flex items-center justify-center gap-2 bg-white px-6 py-2.5 border border-gray-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-700 hover:bg-gray-50 shadow-sm transition"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="mb-8 bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-3xl flex items-center gap-3">
                        <ExclamationCircleIcon className="w-5 h-5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                    <StatCard
                        title="Total Users"
                        value={stats?.metrics?.totalUsers || 0}
                        icon={<UsersIcon className="text-blue-600 w-6 h-6" />}
                        trend="+12%"
                        trendUp={true}
                    />
                    <StatCard
                        title="Invitations"
                        value={stats?.metrics?.totalInvitations || 0}
                        icon={<EnvelopeIcon className="text-purple-600 w-6 h-6" />}
                        trend="+5%"
                        trendUp={true}
                    />
                    <StatCard
                        title="Total Revenue"
                        value={`RM ${stats?.metrics?.totalRevenue?.toLocaleString() || '0'}`}
                        icon={<CreditCardIcon className="text-emerald-600 w-6 h-6" />}
                        trend="+18%"
                        trendUp={true}
                    />
                    <StatCard
                        title="Affiliates"
                        value={stats?.metrics?.totalAffiliates || 0}
                        icon={<BriefcaseIcon className="text-indigo-600 w-6 h-6" />}
                        trend="+2"
                        trendUp={true}
                    />
                    <StatCard
                        title="Messages"
                        value={stats?.metrics?.totalMessages || 0}
                        icon={<ChatBubbleLeftRightIcon className="text-rose-600 w-6 h-6" />}
                        trend="New"
                        trendUp={true}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Recent Users */}
                    <div className="lg:col-span-1 bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="font-bold text-gray-800 font-serif italic">Recent Users</h2>
                            <Link to="/admin/users" className="text-[9px] font-bold uppercase tracking-widest text-rose-600 hover:text-rose-700">View All</Link>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {stats?.recentUsers?.map((user: any) => (
                                <div key={user.id} className="px-8 py-5 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500 font-bold text-lg uppercase">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">{user.name}</h3>
                                        <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <span className={`text-[8px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm ${user.membership_tier === 'free' ? 'bg-gray-100 text-gray-500' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                            {user.membership_tier}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="font-bold text-gray-800 font-serif italic">Recent Transactions</h2>
                            <Link to="/admin/orders" className="text-[9px] font-bold uppercase tracking-widest text-rose-600 hover:text-rose-700">View All</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-8 py-4">Customer</th>
                                        <th className="px-8 py-4">Plan</th>
                                        <th className="px-8 py-4">Amount</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {stats?.recentOrders?.map((order: any) => (
                                        <tr key={order.id} className="text-xs">
                                            <td className="px-8 py-5">
                                                <div className="font-bold text-gray-900">{order.user?.name}</div>
                                                <div className="text-[10px] text-gray-400">{order.user?.email}</div>
                                            </td>
                                            <td className="px-8 py-5 font-bold text-gray-500 uppercase tracking-wide">{order.plan_tier}</td>
                                            <td className="px-8 py-5 font-bold text-gray-900">RM {order.amount.toLocaleString()}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right text-gray-400 font-medium whitespace-nowrap">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-10 text-center text-gray-400 italic">No transactions found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

const StatCard = ({ title, value, icon, trend, trendUp }: any) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col group hover:shadow-xl transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-gray-50 rounded-2xl group-hover:scale-110 transition duration-500">{icon}</div>
            <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {trendUp ? <ArrowUpRightIcon className="w-3.5 h-3.5" /> : <ArrowTrendingDownIcon className="w-3.5 h-3.5" />}
                {trend}
            </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 font-serif mb-1 italic">{value}</div>
        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{title}</div>
    </div>
);

const QuickLink = ({ to, icon, label }: { to: string, icon: any, label: string }) => (
    <Link
        to={to}
        className="flex items-center gap-3 bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-rose-100 transition-all duration-300 group"
    >
        <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-rose-50 transition-colors">
            {icon}
        </div>
        <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">{label}</span>
    </Link>
);

export default AdminDashboard;
