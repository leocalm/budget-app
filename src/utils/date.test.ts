import dayjs from 'dayjs';
import { formatDateForApi, formatDisplayDate, getCurrentDateForApi, isValidDate } from './date';

describe('Date Utilities', () => {
  describe('formatDateForApi', () => {
    it('should format Date object to YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDateForApi(date)).toBe('2024-01-15');
    });

    it('should format date string to YYYY-MM-DD', () => {
      const dateString = '2024-01-15T10:30:00Z';
      expect(formatDateForApi(dateString)).toBe('2024-01-15');
    });

    it('should format dayjs instance to YYYY-MM-DD', () => {
      const dayjsDate = dayjs('2024-01-15T10:30:00Z');
      expect(formatDateForApi(dayjsDate)).toBe('2024-01-15');
    });

    it('should handle null input', () => {
      expect(formatDateForApi(null)).toBe('Invalid Date');
    });
  });

  describe('formatDisplayDate', () => {
    it('should format Date object to MMM D, YYYY', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDisplayDate(date)).toBe('Jan 15, 2024');
    });

    it('should format date string to MMM D, YYYY', () => {
      const dateString = '2024-01-15T10:30:00Z';
      expect(formatDisplayDate(dateString)).toBe('Jan 15, 2024');
    });

    it('should format dayjs instance to MMM D, YYYY', () => {
      const dayjsDate = dayjs('2024-01-15T10:30:00Z');
      expect(formatDisplayDate(dayjsDate)).toBe('Jan 15, 2024');
    });
  });

  describe('getCurrentDateForApi', () => {
    it('should return current date in YYYY-MM-DD format', () => {
      const result = getCurrentDateForApi();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Verify it's actually today's date
      const today = dayjs().format('YYYY-MM-DD');
      expect(result).toBe(today);
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid Date object', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(isValidDate(date)).toBe(true);
    });

    it('should return true for valid date string', () => {
      const dateString = '2024-01-15';
      expect(isValidDate(dateString)).toBe(true);
    });

    it('should return true for valid dayjs instance', () => {
      const dayjsDate = dayjs('2024-01-15');
      expect(isValidDate(dayjsDate)).toBe(true);
    });

    it('should return false for invalid Date object', () => {
      const invalidDate = new Date('invalid');
      expect(isValidDate(invalidDate)).toBe(false);
    });

    it('should return false for invalid date string', () => {
      const invalidDateString = 'not-a-date';
      expect(isValidDate(invalidDateString)).toBe(false);
    });

    it('should return false for invalid dayjs instance', () => {
      const invalidDayjsDate = dayjs('not-a-date');
      expect(isValidDate(invalidDayjsDate)).toBe(false);
    });
  });
});
