import { format, addDays, parse } from 'date-fns';
import { it } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'Europe/Rome';

export function getNow() {
  return toZonedTime(new Date(), TIMEZONE);
}

export function parseItalianDate(text: string, baseDate: Date = getNow()): string | null {
  const lower = text.toLowerCase();
  
  if (/\boggi\b/.test(lower)) {
    return format(baseDate, 'yyyy-MM-dd');
  }
  if (/\bdomani\b/.test(lower)) {
    return format(addDays(baseDate, 1), 'yyyy-MM-dd');
  }
  if (/\bdopodomani\b/.test(lower)) {
    return format(addDays(baseDate, 2), 'yyyy-MM-dd');
  }
  if (/\bieri\b/.test(lower)) {
    return format(addDays(baseDate, -1), 'yyyy-MM-dd');
  }
  
  const fraMatch = lower.match(/fra (\d+) giorni/);
  if (fraMatch) {
    return format(addDays(baseDate, parseInt(fraMatch[1])), 'yyyy-MM-dd');
  }
  
  const traMatch = lower.match(/tra (\d+) giorni/);
  if (traMatch) {
    return format(addDays(baseDate, parseInt(traMatch[1])), 'yyyy-MM-dd');
  }
  
  const weekdays: Record<string, number> = {
    'lunedì': 1, 'lunedi': 1,
    'martedì': 2, 'martedi': 2,
    'mercoledì': 3, 'mercoledi': 3,
    'giovedì': 4, 'giovedi': 4,
    'venerdì': 5, 'venerdi': 5,
    'sabato': 6,
    'domenica': 0
  };
  
  for (const [dayName, targetDay] of Object.entries(weekdays)) {
    if (lower.includes(dayName)) {
      let daysAhead = targetDay - baseDate.getDay();
      if (lower.includes('prossim')) {
        if (daysAhead <= 0) daysAhead += 7;
      } else {
        if (daysAhead < 0) daysAhead += 7;
      }
      return format(addDays(baseDate, daysAhead), 'yyyy-MM-dd');
    }
  }
  
  return null;
}

export function parseItalianTime(text: string): string | null {
  const timeMatch = text.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    const h = parseInt(timeMatch[1]);
    const m = parseInt(timeMatch[2]);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
  }
  
  const alleMatch = text.toLowerCase().match(/alle (\d{1,2})/);
  if (alleMatch) {
    const h = parseInt(alleMatch[1]);
    if (h >= 0 && h <= 23) {
      return `${h.toString().padStart(2, '0')}:00`;
    }
  }
  
  const oreMatch = text.toLowerCase().match(/ore (\d{1,2})/);
  if (oreMatch) {
    const h = parseInt(oreMatch[1]);
    if (h >= 0 && h <= 23) {
      return `${h.toString().padStart(2, '0')}:00`;
    }
  }
  
  return null;
}
