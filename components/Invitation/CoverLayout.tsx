import React from 'react';
import { Invitation } from '../../types';

interface CoverLayoutProps {
    invitation: Partial<Invitation>;
    formattedDate: string;
    isCatalog?: boolean;
}

const CoverLayout: React.FC<CoverLayoutProps> = ({ invitation, formattedDate, isCatalog }) => {
    const layout = invitation.settings?.layout_settings?.cover_layout || 'standard';

    // Use specific settings if available, otherwise fallback to primary/secondary colors
    const primaryColor = invitation.settings?.primary_color || '#8B4513';
    const secondaryColor = invitation.settings?.secondary_theme_color || '#9ca3af';

    // Date: Use cover_date if set, otherwise formattedDate (derived from event_date)
    const displayDate = React.useMemo(() => {
        if (!invitation.settings?.cover_date) return formattedDate;
        // Simple check if it's a YYYY-MM-DD string
        if (/^\d{4}-\d{2}-\d{2}$/.test(invitation.settings.cover_date)) {
            try {
                const d = new Date(invitation.settings.cover_date);
                return d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });
            } catch (e) {
                return invitation.settings.cover_date;
            }
        }
        return invitation.settings.cover_date;
    }, [invitation.settings?.cover_date, formattedDate]);

    // Location: Use cover_location if set, otherwise location_name
    const displayLocation = invitation.settings?.cover_location || invitation.location_name;

    // Cover Title Logic
    // If cover_title is set, use it. Otherwise use Groom & Bride names.
    const rawTitle = invitation.settings?.cover_title || `${invitation.groom_name} & ${invitation.bride_name}`;
    const titleParts = rawTitle.includes('&') ? rawTitle.split('&').map(s => s.trim()) : [rawTitle];

    // Styles for the Cover Title
    const titleStyle = {
        color: invitation.settings?.cover_title_color || primaryColor,
        fontFamily: invitation.settings?.cover_title_font || 'inherit',
        fontSize: invitation.settings?.cover_title_size ? `${invitation.settings.cover_title_size}px` : undefined,
    };

    const heroStyle = {
        color: invitation.settings?.cover_hero_color || invitation.settings?.hero_color || '#1F2937',
        fontFamily: invitation.settings?.cover_hero_font || invitation.settings?.hero_font || 'inherit',
        fontSize: invitation.settings?.cover_hero_size ? `${invitation.settings.cover_hero_size}px` : (invitation.settings?.hero_size ? `${invitation.settings.hero_size}px` : undefined),
    };

    const dateStyle = {
        color: invitation.settings?.cover_date_color || invitation.settings?.date_color || '#4B5563',
        fontFamily: invitation.settings?.cover_date_font || invitation.settings?.date_font || 'inherit',
        fontSize: invitation.settings?.cover_date_size ? `${invitation.settings.cover_date_size}px` : (invitation.settings?.date_size ? `${invitation.settings.date_size}px` : undefined),
    };

    const locationStyle = {
        color: invitation.settings?.cover_location_color || invitation.settings?.location_color || '#9CA3AF',
        fontFamily: invitation.settings?.cover_location_font || invitation.settings?.location_font || 'inherit',
        fontSize: invitation.settings?.cover_location_size ? `${invitation.settings.cover_location_size}px` : (invitation.settings?.location_size ? `${invitation.settings.location_size}px` : undefined),
    };

    const symbolStyle = {
        color: invitation.settings?.cover_symbol_color || secondaryColor,
        fontFamily: invitation.settings?.cover_symbol_font || 'inherit',
        fontSize: invitation.settings?.cover_symbol_size ? `${invitation.settings.cover_symbol_size}px` : undefined,
    };

    const displaySymbol = invitation.settings?.cover_symbol || '&';
    const displayHero = invitation.settings?.cover_hero_title || invitation.settings?.hero_title || 'Walimatulurus';

    // Helper to render the title parts
    const renderTitle = (classNameProp: string, ampersandClassNameProp: string) => {
        if (titleParts.length > 1) {
            return (
                <>
                    <h1 className={classNameProp} style={titleStyle}>{titleParts[0]}</h1>
                    <p className={ampersandClassNameProp} style={symbolStyle}>{displaySymbol}</p>
                    <h1 className={classNameProp} style={titleStyle}>{titleParts[1]}</h1>
                    {/* Handle edge case of more than 1 split? Usually just 2 names. If 3, they just append */}
                    {titleParts.slice(2).map((part, idx) => (
                        <h1 key={idx} className={classNameProp} style={titleStyle}>{part}</h1>
                    ))}
                </>
            );
        }
        return <h1 className={classNameProp} style={titleStyle}>{rawTitle}</h1>;
    };

    switch (layout) {
        case 'centered-circle':
            return (
                <div className="relative z-10 flex flex-col items-center justify-center animate-fade-in p-8 w-full h-full">
                    <div className={`relative flex flex-col items-center justify-center w-[320px] h-[320px] rounded-full border-2 border-white/60 shadow-2xl backdrop-blur-md bg-white/20 p-10 text-center`}>
                        <p className="uppercase tracking-[0.4em] text-[10px] font-bold mb-6 pl-[0.4em]" style={heroStyle}>
                            {displayHero}
                        </p>
                        <div className="space-y-2">
                            {renderTitle("text-4xl font-cursive font-bold", "text-xl font-serif italic")}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-400/30 w-16 mx-auto">
                            <p className="text-[11px] font-serif font-bold tracking-wide uppercase" style={dateStyle}>{displayDate}</p>
                        </div>
                        <div className="mt-2 text-center">
                            <p className="text-[9px] font-bold uppercase tracking-widest pl-[0.1em]" style={locationStyle}>{displayLocation}</p>
                        </div>
                    </div>
                </div>
            );

        case 'top-bordered':
            return (
                <div className={`relative z-10 flex flex-col items-center animate-fade-in px-8 w-full h-full ${isCatalog ? 'justify-center' : 'justify-start pt-24'}`}>
                    <div className="bg-white/80 backdrop-blur-md border-[1.5px] border-gray-200 p-10 rounded-[2.5rem] shadow-xl text-center max-w-sm">
                        <p className="uppercase tracking-[0.5em] text-[9px] font-bold mb-8 border-b border-rose-100 pb-2 inline-block pl-[0.5em]" style={heroStyle}>
                            {displayHero}
                        </p>
                        <div className="space-y-4">
                            {renderTitle("text-5xl font-cursive font-bold", "text-2xl font-serif italic")}
                        </div>
                        <div className="mt-10 space-y-1">
                            <p className="text-sm font-serif font-bold tracking-[0.1em] pl-[0.1em]" style={dateStyle}>{displayDate}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest pl-[0.1em]" style={locationStyle}>{displayLocation}</p>
                        </div>
                    </div>
                </div>
            );

        case 'bottom-accent':
            return (
                <div className={`relative z-10 flex flex-col items-center animate-fade-in px-8 w-full h-full ${isCatalog ? 'justify-center' : 'justify-end pb-32'}`}>
                    <div className="text-center space-y-6">
                        <div className="space-y-2">
                            {renderTitle("text-6xl font-cursive font-bold drop-shadow-lg", "text-3xl font-serif italic drop-shadow-md")}
                        </div>
                        <div className="flex flex-col gap-2 items-center">
                            <div className="bg-black/10 backdrop-blur-sm px-8 py-4 rounded-2xl border border-white/20 inline-block">
                                <p className="text-xs font-bold uppercase tracking-[0.3em] pl-[0.3em]" style={dateStyle}>{displayDate}</p>
                            </div>
                            <p className="text-[10px] font-bold text-white uppercase tracking-widest drop-shadow-md pl-[0.1em]" style={locationStyle}>{displayLocation}</p>
                        </div>
                    </div>
                </div>
            );

        case 'glass-card':
            return (
                <div className="relative z-10 flex flex-col items-center justify-center animate-fade-in px-6 w-full h-full">
                    <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-[3rem] p-12 shadow-2xl text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                        <p className="uppercase tracking-[0.4em] text-[10px] font-bold text-white/70 mb-10 pl-[0.4em]" style={heroStyle}>
                            {displayHero}
                        </p>
                        <div className="space-y-6">
                            {/* Custom handling for glass card divider */}
                            {titleParts.length > 1 ? (
                                <>
                                    <h1 className="text-5xl font-cursive font-bold" style={titleStyle}>{titleParts[0]}</h1>
                                    <div className="w-8 h-px mx-auto" style={{ backgroundColor: invitation.settings?.cover_symbol_color || secondaryColor || 'rgba(255,255,255,0.3)', ...symbolStyle }}></div>
                                    <h1 className="text-5xl font-cursive font-bold" style={titleStyle}>{titleParts[1]}</h1>
                                    {titleParts.slice(2).map((part, idx) => (
                                        <h1 key={idx} className="text-5xl font-cursive font-bold" style={titleStyle}>{part}</h1>
                                    ))}
                                </>
                            ) : (
                                <h1 className="text-5xl font-cursive font-bold" style={titleStyle}>{rawTitle}</h1>
                            )}
                        </div>
                        <div className="mt-12 text-white/80 space-y-2">
                            <p className="text-sm font-serif font-bold tracking-widest uppercase pl-[0.1em]" style={dateStyle}>{displayDate}</p>
                            <p className="text-[10px] uppercase tracking-widest opacity-80 pl-[0.1em]" style={locationStyle}>{displayLocation}</p>
                        </div>
                    </div>
                </div>
            );

        case 'standard':
        default:
            return (
                <div className="animate-fade-in space-y-10 w-full h-full flex flex-col items-center justify-center px-8 text-center">
                    <p className="uppercase tracking-[0.4em] text-[10px] font-bold text-gray-600 mb-2 pl-[0.4em]" style={heroStyle}>
                        {displayHero}
                    </p>

                    <div className="space-y-4">
                        {renderTitle("text-5xl md:text-6xl font-cursive font-bold", "text-3xl font-serif italic")}
                    </div>

                    <div className="space-y-2 pt-4">
                        <p className="text-sm font-serif font-bold tracking-wide uppercase pl-[0.1em]" style={dateStyle}>{displayDate}</p>
                        <div className="w-12 h-px bg-gray-300 mx-auto" style={{ backgroundColor: invitation.settings?.cover_symbol_color || secondaryColor }} />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] pl-[0.2em]" style={locationStyle}>{displayLocation}</p>
                    </div>
                </div>
            );


    }
};

export default CoverLayout;
