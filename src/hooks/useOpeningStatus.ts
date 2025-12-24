import { useState, useEffect } from 'react';
import { useOpeningHours } from '../config/ConfigProvider';
import type { OpeningHours } from '../types/menu';

interface OpeningStatus {
  isOpen: boolean;
  currentDay: string;
  currentHours: string;
  nextChange: string;
  countdown: string; // "Noch 2h 30min" oder "Öffnet in 45min"
}

const DAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

function parseTimeRange(hoursString: string): { start: number; end: number }[] {
  if (hoursString.toLowerCase() === 'geschlossen') {
    return [];
  }

  const ranges: { start: number; end: number }[] = [];
  const parts = hoursString.split(',').map(s => s.trim());

  for (const part of parts) {
    const match = part.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (match) {
      const startHour = parseInt(match[1], 10);
      const startMin = parseInt(match[2], 10);
      const endHour = parseInt(match[3], 10);
      const endMin = parseInt(match[4], 10);
      
      ranges.push({
        start: startHour * 60 + startMin,
        end: endHour * 60 + endMin,
      });
    }
  }

  return ranges;
}

function isWithinTimeRanges(currentMinutes: number, ranges: { start: number; end: number }[]): boolean {
  return ranges.some(range => currentMinutes >= range.start && currentMinutes < range.end);
}

function formatDuration(minutes: number): string {
  if (minutes <= 0) return '';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}min`;
  }
}

function getCountdown(
  isOpen: boolean, 
  timeRanges: { start: number; end: number }[], 
  currentMinutes: number,
  openingHours: OpeningHours[],
  currentDayIndex: number
): string {
  if (isOpen) {
    // Find how long until closing
    for (const range of timeRanges) {
      if (currentMinutes >= range.start && currentMinutes < range.end) {
        const remaining = range.end - currentMinutes;
        return `Noch ${formatDuration(remaining)}`;
      }
    }
    return '';
  } else {
    // Find how long until opening
    // First check if there's another time slot today
    for (const range of timeRanges) {
      if (currentMinutes < range.start) {
        const untilOpen = range.start - currentMinutes;
        return `Öffnet in ${formatDuration(untilOpen)}`;
      }
    }
    
    // Check next days
    for (let i = 1; i < 7; i++) {
      const checkDayIndex = (currentDayIndex + i) % 7;
      const dayName = DAYS[checkDayIndex];
      const dayHours = openingHours.find(h => h.day === dayName);
      
      if (dayHours && !dayHours.isClosed) {
        const ranges = parseTimeRange(dayHours.hours);
        if (ranges.length > 0) {
          // Calculate minutes until opening
          const minutesUntilMidnight = 24 * 60 - currentMinutes;
          const minutesInBetweenDays = (i - 1) * 24 * 60;
          const minutesFromMidnightToOpen = ranges[0].start;
          const totalMinutes = minutesUntilMidnight + minutesInBetweenDays + minutesFromMidnightToOpen;
          
          if (totalMinutes < 24 * 60) {
            return `Öffnet in ${formatDuration(totalMinutes)}`;
          }
        }
        break;
      }
    }
    
    return '';
  }
}

export function useOpeningStatus(): OpeningStatus {
  const openingHours = useOpeningHours();
  const [status, setStatus] = useState<OpeningStatus>({
    isOpen: false,
    currentDay: '',
    currentHours: '',
    nextChange: '',
    countdown: '',
  });

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const dayIndex = now.getDay();
      const currentDay = DAYS[dayIndex];
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const todayHours = openingHours.find(h => h.day === currentDay);
      
      if (!todayHours || todayHours.isClosed) {
        const countdown = getCountdown(false, [], currentMinutes, openingHours, dayIndex);
        setStatus({
          isOpen: false,
          currentDay,
          currentHours: 'Geschlossen',
          nextChange: findNextOpenTime(openingHours, dayIndex),
          countdown,
        });
        return;
      }

      const timeRanges = parseTimeRange(todayHours.hours);
      const isOpen = isWithinTimeRanges(currentMinutes, timeRanges);
      const countdown = getCountdown(isOpen, timeRanges, currentMinutes, openingHours, dayIndex);

      setStatus({
        isOpen,
        currentDay,
        currentHours: todayHours.hours,
        nextChange: isOpen 
          ? findClosingTime(timeRanges, currentMinutes) 
          : findNextOpenTime(openingHours, dayIndex, currentMinutes),
        countdown,
      });
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [openingHours]);

  return status;
}

function findClosingTime(ranges: { start: number; end: number }[], currentMinutes: number): string {
  for (const range of ranges) {
    if (currentMinutes >= range.start && currentMinutes < range.end) {
      const hours = Math.floor(range.end / 60);
      const mins = range.end % 60;
      return `Schließt um ${hours}:${mins.toString().padStart(2, '0')}`;
    }
  }
  return '';
}

function findNextOpenTime(hours: OpeningHours[], currentDayIndex: number, currentMinutes?: number): string {
  for (let i = 0; i < 7; i++) {
    const checkDayIndex = (currentDayIndex + i) % 7;
    const dayName = DAYS[checkDayIndex];
    const dayHours = hours.find(h => h.day === dayName);
    
    if (dayHours && !dayHours.isClosed) {
      const ranges = parseTimeRange(dayHours.hours);
      
      if (i === 0 && currentMinutes !== undefined) {
        // Same day - find next time slot
        for (const range of ranges) {
          if (currentMinutes < range.start) {
            const hours = Math.floor(range.start / 60);
            const mins = range.start % 60;
            return `Öffnet um ${hours}:${mins.toString().padStart(2, '0')}`;
          }
        }
      } else if (i > 0 && ranges.length > 0) {
        const hours = Math.floor(ranges[0].start / 60);
        const mins = ranges[0].start % 60;
        return `Öffnet ${dayName} um ${hours}:${mins.toString().padStart(2, '0')}`;
      }
    }
  }
  return '';
}
