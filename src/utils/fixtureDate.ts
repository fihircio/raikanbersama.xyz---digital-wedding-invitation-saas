/**
 * Fixture dates used by demo/catalog previews.
 *
 * These are deliberately derived from the current date instead of hardcoded. A
 * fixed literal (e.g. 2025-12-25) keeps rendering a past date on the catalog
 * page and in sample cards forever, which looks broken to users and makes
 * environment/version checks unreliable.
 *
 * Keep every user-visible fixture date flowing through this module.
 */

/**
 * ISO date (YYYY-MM-DD) a number of days from today, for demo event dates.
 */
export const demoEventDate = (daysFromNow = 45): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

/**
 * Malay long date ("25 Disember 2026") using the same locale options as the
 * invitation renderer, so previews and live cards format identically.
 */
export const formatMalayDate = (value: string | Date): string => {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (!date || isNaN(date.getTime())) return 'Tarikh Belum Ditetapkan';
  return date.toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });
};
