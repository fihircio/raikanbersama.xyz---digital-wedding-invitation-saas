import React from 'react';
import { Invitation } from '../../types';

interface CoverLayoutProps {
    invitation: Partial<Invitation>;
    formattedDate: string;
}

const CoverLayout: React.FC<CoverLayoutProps> = ({ invitation, formattedDate }) => {
    const layout = invitation.settings?.layout_settings?.cover_layout || 'standard';

    const groomStyle = {
        color: invitation.settings?.groom_color || '#8B4513',
        fontFamily: invitation.settings?.groom_font || 'inherit',
        fontSize: invitation.settings?.groom_size ? `${invitation.settings.groom_size}px` : undefined,
    };
    const brideStyle = {
        color: invitation.settings?.bride_color || '#8B4513',
        fontFamily: invitation.settings?.bride_font || 'inherit',
        fontSize: invitation.settings?.bride_size ? `${invitation.settings.bride_size}px` : undefined,
    };
    const heroStyle = {
        color: invitation.settings?.hero_color || '#1F2937',
        fontFamily: invitation.settings?.hero_font || 'inherit',
        fontSize: invitation.settings?.hero_size ? `${invitation.settings.hero_size}px` : undefined,
    };
    const dateStyle = {
        color: invitation.settings?.date_color || '#4B5563',
        fontFamily: invitation.settings?.date_font || 'inherit',
        fontSize: invitation.settings?.date_size ? `${invitation.settings.date_size}px` : undefined,
    };
    const locationStyle = {
        color: invitation.settings?.location_color || '#9CA3AF',
        fontFamily: invitation.settings?.location_font || 'inherit',
        fontSize: invitation.settings?.location_size ? `${invitation.settings.location_size}px` : undefined,
    };

    switch (layout) {
        case 'centered-circle':
            return (
                <div className="relative z-10 flex flex-col items-center justify-center animate-fade-in p-8 w-full h-full">
                    <div className={`relative flex flex-col items-center justify-center w-[320px] h-[320px] rounded-full border-2 border-white/60 shadow-2xl backdrop-blur-md bg-white/20 p-10 text-center`}>
                        <p className="uppercase tracking-[0.4em] text-[10px] font-bold mb-6" style={heroStyle}>
                            {invitation?.settings?.hero_title || 'Walimatulurus'}
                        </p>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-cursive font-bold" style={groomStyle}>{invitation.groom_name}</h1>
                            <p className="text-xl font-serif italic text-gray-500">&</p>
                            <h1 className="text-4xl font-cursive font-bold" style={brideStyle}>{invitation.bride_name}</h1>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-400/30 w-16 mx-auto">
                            <p className="text-[11px] font-serif font-bold tracking-wide uppercase" style={dateStyle}>{formattedDate}</p>
                        </div>
                        <div className="mt-2 text-center">
                            <p className="text-[9px] font-bold uppercase tracking-widest" style={locationStyle}>{invitation.location_name}</p>
                        </div>
                    </div>
                </div>
            );

        case 'top-bordered':
            return (
                <div className="relative z-10 flex flex-col items-center justify-start pt-24 animate-fade-in px-8 w-full h-full">
                    <div className="bg-white/80 backdrop-blur-md border-[1.5px] border-gray-200 p-10 rounded-[2.5rem] shadow-xl text-center max-w-sm">
                        <p className="uppercase tracking-[0.5em] text-[9px] font-bold mb-8 border-b border-rose-100 pb-2 inline-block" style={heroStyle}>
                            {invitation?.settings?.hero_title || 'Walimatulurus'}
                        </p>
                        <div className="space-y-4">
                            <h1 className="text-5xl font-cursive font-bold" style={groomStyle}>{invitation.groom_name}</h1>
                            <p className="text-2xl font-serif italic text-gray-400">&</p>
                            <h1 className="text-5xl font-cursive font-bold" style={brideStyle}>{invitation.bride_name}</h1>
                        </div>
                        <div className="mt-10 space-y-1">
                            <p className="text-sm font-serif font-bold" style={dateStyle}>{formattedDate}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest" style={locationStyle}>{invitation.location_name}</p>
                        </div>
                    </div>
                </div>
            );

        case 'bottom-accent':
            return (
                <div className="relative z-10 flex flex-col items-center justify-end h-full pb-32 animate-fade-in px-8 w-full">
                    <div className="text-center space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-6xl font-cursive font-bold drop-shadow-lg" style={groomStyle}>{invitation.groom_name}</h1>
                            <p className="text-3xl font-serif italic text-white/80">&</p>
                            <h1 className="text-6xl font-cursive font-bold drop-shadow-lg" style={brideStyle}>{invitation.bride_name}</h1>
                        </div>
                        <div className="flex flex-col gap-2 items-center">
                            <div className="bg-black/10 backdrop-blur-sm px-8 py-4 rounded-2xl border border-white/20 inline-block">
                                <p className="text-xs font-bold uppercase tracking-[0.3em]" style={dateStyle}>{formattedDate}</p>
                            </div>
                            <p className="text-[10px] font-bold text-white uppercase tracking-widest drop-shadow-md" style={locationStyle}>{invitation.location_name}</p>
                        </div>
                    </div>
                </div>
            );

        case 'glass-card':
            return (
                <div className="relative z-10 flex flex-col items-center justify-center animate-fade-in px-6 w-full h-full">
                    <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-[3rem] p-12 shadow-2xl text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                        <p className="uppercase tracking-[0.4em] text-[10px] font-bold text-white/70 mb-10" style={heroStyle}>
                            {invitation?.settings?.hero_title || 'Walimatulurus'}
                        </p>
                        <div className="space-y-6">
                            <h1 className="text-5xl font-cursive font-bold" style={groomStyle}>{invitation.groom_name}</h1>
                            <div className="w-8 h-px bg-white/30 mx-auto"></div>
                            <h1 className="text-5xl font-cursive font-bold" style={brideStyle}>{invitation.bride_name}</h1>
                        </div>
                        <div className="mt-12 text-white/80 space-y-2">
                            <p className="text-sm font-serif font-bold tracking-widest uppercase" style={dateStyle}>{formattedDate}</p>
                            <p className="text-[10px] uppercase tracking-widest opacity-80" style={locationStyle}>{invitation.location_name}</p>
                        </div>
                    </div>
                </div>
            );

        case 'standard':
        default:
            return (
                <div className="animate-fade-in space-y-10 w-full h-full flex flex-col items-center justify-center px-8 text-center">
                    <p className="uppercase tracking-[0.4em] text-[10px] font-bold text-gray-600 mb-2" style={heroStyle}>
                        {invitation?.settings?.hero_title || 'Walimatulurus'}
                    </p>

                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-cursive font-bold" style={groomStyle}>
                            {invitation.groom_name}
                        </h1>
                        <p className="text-3xl font-serif italic text-gray-400">&</p>
                        <h1 className="text-5xl md:text-6xl font-cursive font-bold" style={brideStyle}>
                            {invitation.bride_name}
                        </h1>
                    </div>

                    <div className="space-y-2 pt-4">
                        <p className="text-sm font-serif font-bold tracking-wide uppercase" style={dateStyle}>{formattedDate}</p>
                        <div className="w-12 h-px bg-gray-300 mx-auto" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={locationStyle}>{invitation.location_name}</p>
                    </div>
                </div>
            );


    }
};

export default CoverLayout;
