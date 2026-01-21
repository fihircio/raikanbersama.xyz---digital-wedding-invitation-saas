import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
    const { user, token } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [csrfToken, setCsrfToken] = useState<string | null>(null);

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
        }
    }, [user, token]);

    const fetchProfile = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/profile', {
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

            const response = await fetch('http://localhost:3001/api/profile', {
                method: 'PUT',
                headers,
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            // Refresh token
            const newToken = response.headers.get('X-CSRF-Token');
            if (newToken) setCsrfToken(newToken);

            if (response.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully' });
                setIsEditing(false);
                // Optionally update user in context if needed, 
                // but getProfile will refresh it on next load if context uses it.
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

            const response = await fetch('http://localhost:3001/api/profile/password', {
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
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="bg-white text-rose-600 px-6 py-2 rounded-full font-bold hover:bg-rose-50 transition"
                            >
                                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                            </button>
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
            </div>
        </div>
    );
};

export default ProfilePage;
