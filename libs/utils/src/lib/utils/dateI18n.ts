import { format, Locale } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';


const localeMap: Record<string, Locale> = {
  vi: vi,
  en: enUS,
  'en-US': enUS,
  'vi-VN': vi,
};

export const getDateLocale = (languageCode: string): Locale => {
  return localeMap[languageCode] || localeMap[languageCode.split('-')[0]] || enUS;
};


export const formatGalleryDate = (date: Date, languageCode: string): string => {
  const locale = getDateLocale(languageCode);
  return format(date, 'MMMM d', { locale });
};

export const formatDateI18n = (
  date: Date,
  languageCode: string,
  formatString: string = 'MMM dd, yyyy'
): string => {
  const locale = getDateLocale(languageCode);
  return format(date, formatString, { locale });
};

export const formatRelativeTime = (date: Date, languageCode: string): string => {
  const locale = getDateLocale(languageCode);

  const now = new Date();
  const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return format(date, 'HH:mm', { locale });
  } else if (diffInHours < 24 * 7) {
    return format(date, 'EEEE', { locale });
  } else {
    return format(date, 'MMM d', { locale });
  }
};


export const formatDateRange = (
  startDate: Date,
  endDate: Date,
  languageCode: string
): string => {
  const locale = getDateLocale(languageCode);

  const startFormatted = format(startDate, 'MMM d', { locale });
  const endFormatted = format(endDate, 'MMM d', { locale });

  if (startDate.getFullYear() === endDate.getFullYear()) {
    return `${startFormatted} - ${endFormatted}`;
  } else {
    const startWithYear = format(startDate, 'MMM d, yyyy', { locale });
    const endWithYear = format(endDate, 'MMM d, yyyy', { locale });
    return `${startWithYear} - ${endWithYear}`;
  }
};


