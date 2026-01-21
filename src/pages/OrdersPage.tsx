import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Order, OrderStatus } from '../../types';
import { useNavigate } from 'react-router-dom';

const OrdersPage: React.FC = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && token) {
            fetchOrders();
        } else {
            setIsLoading(false);
        }
    }, [user, token]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setOrders(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.COMPLETED: return 'bg-green-100 text-green-800';
            case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
            case OrderStatus.FAILED: return 'bg-red-100 text-red-800';
            case OrderStatus.REFUNDED: return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
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
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 font-serif italic">Order History</h1>
                    <p className="text-gray-500 mt-2">View your past purchases and transactions</p>
                </div>

                {orders.length > 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Order ID</th>
                                        <th className="px-8 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Date</th>
                                        <th className="px-8 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Item</th>
                                        <th className="px-8 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                                        <th className="px-8 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition">
                                            <td className="px-8 py-6 text-sm font-medium text-gray-900">
                                                #{order.id.substring(0, 8).toUpperCase()}
                                            </td>
                                            <td className="px-8 py-6 text-sm text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString('ms-MY', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-sm font-bold text-gray-900 uppercase">
                                                    {order.plan_tier} Plan
                                                </div>
                                                {order.invitation && (
                                                    <div className="text-xs text-gray-500 mt-1 italic">
                                                        For: {order.invitation.bride_name} & {order.invitation.groom_name}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-gray-900">
                                                RM {parseFloat(order.amount).toFixed(2)}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-3 font-serif italic">No Orders Yet</h2>
                            <p className="text-gray-500 mb-8">
                                You haven't made any purchases yet. When you upgrade your membership or purchase premium features, they'll appear here.
                            </p>
                            <button
                                onClick={() => navigate('/pricing')}
                                className="inline-block bg-rose-600 text-white px-8 py-3 rounded-full font-bold hover:bg-rose-700 transition shadow-lg shadow-rose-100"
                            >
                                View Plans
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
