
import { startOfDay, startOfWeek, startOfMonth, startOfYear, isAfter, isBefore, subDays, format, isValid } from 'date-fns';

/**
 * @fileOverview High-fidelity local date boundary helpers for study analytics.
 * Uses system local time to align with user expectations of day/week/month boundaries.
 * FIXED: Added isValid guard to format helper.
 */

export const getLocalStartOfDay = (date: Date = new Date()) => startOfDay(date);
export const getLocalStartOfWeek = (date: Date = new Date()) => startOfWeek(date, { weekStartsOn: 1 }); // Monday
export const getLocalStartOfMonth = (date: Date = new Date()) => startOfMonth(date);
export const getLocalStartOfYear = (date: Date = new Date()) => startOfYear(date);

export const isSameLocalDate = (dateA: Date, dateB: Date) => {
  return format(dateA, 'yyyy-MM-dd') === format(dateB, 'yyyy-MM-dd');
};

export const getLocalDateString = (date: Date = new Date()) => {
  if (!isValid(date)) return format(new Date(), 'yyyy-MM-dd');
  return format(date, 'yyyy-MM-dd');
};

export const getTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
