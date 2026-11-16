/**
 * Fixture dates for backend mock data and seeders.
 *
 * Hardcoded literals (2025-12-25, 2025-12-31) kept seeding sample invitations
 * with a past event date and expiring seeded memberships, which makes tests and
 * screenshots disagree with reality. Derive them from today instead.
 */

/** ISO date (YYYY-MM-DD) a number of days from today. */
export const demoEventDate = (daysFromNow = 45): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

/** A Date a number of days from today, for seeded membership expiry. */
export const futureDate = (daysFromNow = 365): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};
