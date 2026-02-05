import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

// Use UTC for API-oriented formatting to avoid local timezone shifts when
// converting Date objects that originated from date-only strings (YYYY-MM-DD).
dayjs.extend(utc);

/**
 * Formats a date for API submission.
 * Uses UTC to preserve the original date when input originated as a date-only string.
 * @param date - The date to format (Date object, string, or dayjs instance)
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateForApi = (date: Date | string | dayjs.Dayjs | null): string => {
  return dayjs(date).utc().format('YYYY-MM-DD');
};

/**
 * Formats a date for display in the UI.
 * @param date - The date to format (Date object, string, or dayjs instance)
 * @returns Date string in MMM D, YYYY format (e.g., "Jan 15, 2024")
 */
export const formatDisplayDate = (date: Date | string | dayjs.Dayjs): string => {
  return dayjs(date).format('MMM D, YYYY');
};

/**
 * Gets the current date in YYYY-MM-DD format for API use.
 * @returns Current date string in YYYY-MM-DD format
 */
export const getCurrentDateForApi = (): string => {
  return dayjs().utc().format('YYYY-MM-DD');
};

/**
 * Checks if a date is valid.
 * @param date - The date to validate
 * @returns True if the date is valid, false otherwise
 */
export const isValidDate = (date: Date | string | dayjs.Dayjs): boolean => {
  return dayjs(date).isValid();
};
