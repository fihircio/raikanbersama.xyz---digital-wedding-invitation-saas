import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BackgroundCard from '../../components/Catalog/BackgroundCard';
import { useNavigate } from 'react-router-dom';
import { BackgroundImage } from '../../types';
import { buildApiUrl } from '../config';

const FavoritesPage: React.FC = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState<BackgroundImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [csrfToken, setCsrfToken] = useState<string | null>(null);

    useEffect(() => {
        if (user && token) {
            fetchFavorites();
        } else {
            setIsLoading(false);
        }
    }, [user, token]);

    const fetchFavorites = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(buildApiUrl('/favorites'), {
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
                // The API returns favorites with BackgroundImage association included
                const backgroundImages = data.data.map((fav: any) => fav.backgroundImage);
                setFavorites(backgroundImages || []);
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveFavorite = async (backgroundId: string) => {
        if (!token) return;

        try {
            const headers: Record<string, string> = {
                'Authorization': `Bearer ${token}`
            };
            if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

            const response = await fetch(buildApiUrl(`/favorites/${backgroundId}`), {
                method: 'DELETE',
                headers,
                credentials: 'include'
            });

            if (response.ok) {
                setFavorites(prev => prev.filter(bg => bg.id !== backgroundId));
            }

            // Refresh token if provided
            const newToken = response.headers.get('X-CSRF-Token');
            if (newToken) setCsrfToken(newToken);
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    const handleSelect = (background: BackgroundImage) => {
        sessionStorage.setItem('selectedBackground', JSON.stringify(background));
        navigate('/create');
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
                    <h1 className="text-3xl font-bold text-gray-900 font-serif italic">My Favorites</h1>
                    <p className="text-gray-500 mt-2">Your saved background images from the catalog</p>
                </div>

                {favorites.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                        {favorites.map((background) => (
                            <BackgroundCard
                                key={background.id}
                                background={background}
                                onSelect={() => handleSelect(background)}
                                onToggleFavorite={() => handleRemoveFavorite(background.id)}
                                isFavorited={true}
                                isAuthenticated={true}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-3 font-serif italic">No Favorites Yet</h2>
                            <p className="text-gray-500 mb-8">
                                You haven't saved any background images yet. Browse the catalog and click the heart icon to save your favorites!
                            </p>
                            <button
                                onClick={() => navigate('/catalog')}
                                className="inline-block bg-rose-600 text-white px-8 py-3 rounded-full font-bold hover:bg-rose-700 transition shadow-lg shadow-rose-100"
                            >
                                Browse Catalog
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;
