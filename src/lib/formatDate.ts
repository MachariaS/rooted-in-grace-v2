// The site builds statically on Netlify's servers, which run in UTC —
// without a fixed time zone here, dates/times would silently shift by
// hours depending on where the build happens to run.
const TIME_ZONE = 'Africa/Nairobi';

export function formatDate(date: Date, options: Intl.DateTimeFormatOptions): string {
  return date.toLocaleDateString('en-US', { ...options, timeZone: TIME_ZONE });
}
