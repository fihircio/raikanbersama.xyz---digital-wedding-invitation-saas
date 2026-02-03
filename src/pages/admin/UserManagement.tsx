import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import {
    UsersIcon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ShieldCheckIcon,
    UserCircleIcon,
    StarIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    membership_tier: 'free' | 'elite' | 'pro';
    created_at: string;
}

const UserManagement: React.FC = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, [page, token]);

    const fetchUsers = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await fetch(buildApiUrl(`/admin/users?page=${page}&search=${search}`), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.data.users);
                setTotalPages(data.data.pagination.totalPages);
            }
        } catch (err) {
            console.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (userId: string, updates: any) => {
        if (!token) return;
        setIsUpdating(userId);
        try {
            const response = await fetch(buildApiUrl(`/admin/users/${userId}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates),
            });
            const data = await response.json();
            if (data.success) {
                setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
            }
        } catch (err) {
            console.error('Failed to update user');
        } finally {
            setIsUpdating(null);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-serif italic tracking-tight">Urus Pengguna</h1>
                        <p className="text-gray-500 text-sm">Lihat dan tadbir peranan serta keahlian pengguna.</p>
                    </div>

                    <form onSubmit={handleSearch} className="flex-grow max-w-md relative group">
                        <input
                            type="text"
                            placeholder="Cari nama atau email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-full shadow-sm focus:border-rose-300 transition-all outline-none text-sm group-hover:shadow-md"
                        />
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-hover:text-rose-500 transition-colors" />
                    </form>
                </div>

                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Pengguna</th>
                                    <th className="px-8 py-5">Peranan</th>
                                    <th className="px-8 py-5">Pakej</th>
                                    <th className="px-8 py-5">Tarikh Daftar</th>
                                    <th className="px-8 py-5 text-right">Tindakan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic">
                                            <ArrowPathIcon className="w-8 h-8 mx-auto mb-4 animate-spin text-rose-200" />
                                            Memuatkan senarai pengguna...
                                        </td>
                                    </tr>
                                ) : users.map((u) => (
                                    <tr key={u.id} className="text-sm group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 font-bold uppercase">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{u.name}</div>
                                                    <div className="text-xs text-gray-400">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <select
                                                disabled={isUpdating === u.id}
                                                value={u.role}
                                                onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })}
                                                className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-gray-700 outline-none cursor-pointer hover:text-rose-600 transition"
                                            >
                                                <option value="user">USER</option>
                                                <option value="admin">ADMIN</option>
                                            </select>
                                        </td>
                                        <td className="px-8 py-6">
                                            <select
                                                disabled={isUpdating === u.id}
                                                value={u.membership_tier}
                                                onChange={(e) => handleUpdateUser(u.id, { membership_tier: e.target.value })}
                                                className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border-none outline-none cursor-pointer transition ${u.membership_tier === 'free' ? 'bg-gray-100 text-gray-500' :
                                                    u.membership_tier === 'elite' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                                    }`}
                                            >
                                                <option value="free">FREE</option>
                                                <option value="elite">ELITE</option>
                                                <option value="pro">PRO</option>
                                            </select>
                                        </td>
                                        <td className="px-8 py-6 text-gray-400 text-xs">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {isUpdating === u.id ? (
                                                <ArrowPathIcon className="w-4 h-4 text-gray-300 animate-spin ml-auto" />
                                            ) : (
                                                <UserCircleIcon className="w-5 h-5 text-gray-200 ml-auto group-hover:text-rose-300 transition" />
                                            )}
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

export default UserManagement;
