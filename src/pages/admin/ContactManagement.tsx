import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import {
    ChatBubbleLeftRightIcon,
    EnvelopeIcon,
    ArchiveBoxIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ArrowPathIcon,
    EnvelopeOpenIcon
} from '@heroicons/react/24/outline';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'archived';
    created_at: string;
}

const ContactManagement: React.FC = () => {
    const { token } = useAuth();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    useEffect(() => {
        fetchMessages();
    }, [token]);

    const fetchMessages = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await fetch(buildApiUrl('/admin/contacts'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setMessages(data.data);
            } else {
                setError(data.error || 'Failed to fetch messages');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        if (!token) return;
        try {
            const response = await fetch(buildApiUrl(`/admin/contacts/${id}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status }),
            });

            const data = await response.json();
            if (data.success) {
                setMessages(messages.map(m => m.id === id ? { ...m, status: status as any } : m));
                if (selectedMessage?.id === id) {
                    setSelectedMessage({ ...selectedMessage, status: status as any });
                }
            }
        } catch (err) {
            console.error('Failed to update message status');
        }
    };

    const openMessage = (message: ContactMessage) => {
        setSelectedMessage(message);
        if (message.status === 'new') {
            handleUpdateStatus(message.id, 'read');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-serif italic tracking-tight">Peti Masuk</h1>
                        <p className="text-gray-500 text-sm">Urus mesej dan pertanyaan daripada pelanggan.</p>
                    </div>
                    <button onClick={fetchMessages} className="p-2 bg-white rounded-full border border-gray-100 shadow-sm hover:bg-gray-50 transition">
                        <ArrowPathIcon className={`w-5 h-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {error && (
                    <div className="mb-8 bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-2 text-sm font-bold">
                        <ExclamationCircleIcon className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Message List */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
                            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Senarai Mesej</span>
                                <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-[8px] font-bold">{messages.filter(m => m.status === 'new').length} Baru</span>
                            </div>
                            <div className="flex-grow overflow-y-auto divide-y divide-gray-50">
                                {messages.map((message) => (
                                    <button
                                        key={message.id}
                                        onClick={() => openMessage(message)}
                                        className={`w-full text-left p-6 transition-all hover:bg-gray-50 flex flex-col gap-1 relative ${selectedMessage?.id === message.id ? 'bg-rose-50/50' : ''
                                            }`}
                                    >
                                        {message.status === 'new' && (
                                            <div className="absolute top-6 right-6 w-2 h-2 bg-rose-600 rounded-full animate-pulse" />
                                        )}
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-xs font-bold truncate max-w-[150px] ${message.status === 'new' ? 'text-gray-900' : 'text-gray-500'}`}>{message.name}</span>
                                            <span className="text-[9px] text-gray-400 font-medium">{message.created_at || (message as any).createdAt ? new Date(message.created_at || (message as any).createdAt).toLocaleDateString() : 'Invalid Date'}</span>
                                        </div>
                                        <span className={`text-xs font-serif italic truncate ${message.status === 'new' ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>{message.subject}</span>
                                        <p className="text-[10px] text-gray-400 truncate mt-1">{message.message}</p>
                                    </button>
                                ))}
                                {messages.length === 0 && !loading && (
                                    <div className="p-10 text-center opacity-30">
                                        <EnvelopeIcon className="w-10 h-10 mx-auto mb-2" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Peti kosong</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Message Content */}
                    <div className="lg:col-span-2">
                        {selectedMessage ? (
                            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col animate-fade-in">
                                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center font-bold text-xl uppercase">
                                            {selectedMessage.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{selectedMessage.name}</h3>
                                            <p className="text-xs text-gray-400 font-medium">{selectedMessage.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {selectedMessage.status !== 'archived' && (
                                            <button
                                                onClick={() => handleUpdateStatus(selectedMessage.id, 'archived')}
                                                className="p-3 bg-gray-50 text-gray-500 rounded-2xl hover:bg-gray-100 transition shadow-sm border border-gray-100"
                                                title="Arkibkan Mesej"
                                            >
                                                <ArchiveBoxIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setSelectedMessage(null)}
                                            className="p-3 bg-white text-gray-400 rounded-2xl hover:bg-gray-50 transition"
                                        >
                                            <XCircleIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-10 flex-grow overflow-y-auto">
                                    <div className="mb-8">
                                        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.3em] mb-2 block">Subjek</span>
                                        <h2 className="text-3xl font-serif font-bold italic text-gray-900 leading-tight">
                                            {selectedMessage.subject}
                                        </h2>
                                    </div>
                                    <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                        {selectedMessage.message}
                                    </div>
                                </div>
                                <div className="p-8 border-t border-gray-50 bg-gray-50/10">
                                    <a
                                        href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                                        className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-rose-100 hover:bg-rose-700 transition flex items-center justify-center gap-2 uppercase tracking-widest"
                                    >
                                        <EnvelopeOpenIcon className="w-5 h-5" />
                                        Balas Melalui Email
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[3.5rem] border border-dashed border-gray-200 h-full flex items-center justify-center text-center p-10 py-32 opacity-50">
                                <div>
                                    <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                                    <h3 className="text-xl font-serif italic font-bold text-gray-400">Pilih Mesej Untuk Dibaca</h3>
                                    <p className="text-sm text-gray-400 max-w-xs mx-auto mt-2">Pilih sebarang mesej daripada senarai di sebelah untuk melihat perincian penuh.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

const XCircleIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
);

export default ContactManagement;
