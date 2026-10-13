/**
 * Device-Synchronized Clock Engine for Linis Dingalan
 * Strict device clock alignment: kung ano ang oras ng device na gamit,
 * ganun din ang oras ng system nang walang offset o pagkakaiba.
 */

let manualTimeOverrideOffsetMs = 0;
let isSynchronized = true;

if (typeof window !== 'undefined') {
  try {
    // Clear any previous stale override so the app strictly aligns with the user's device clock
    localStorage.removeItem('dingalan_manual_time_offset');
  } catch (e) {
    // Ignore in restricted environments
  }
}

export function setDingalanTimeOverride(targetDate: Date) {
  manualTimeOverrideOffsetMs = targetDate.getTime() - Date.now();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('dingalan-time-updated'));
  }
}

export function resetDingalanTimeOverride() {
  manualTimeOverrideOffsetMs = 0;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('dingalan_manual_time_offset');
    } catch (e) {}
    window.dispatchEvent(new Event('dingalan-time-updated'));
  }
}

export function isDingalanTimeOverridden(): boolean {
  return manualTimeOverrideOffsetMs !== 0;
}

/**
 * Synchronize with the device clock
 */
export async function syncDingalanTime(): Promise<number> {
  // Always synchronized with the user's device clock
  isSynchronized = true;
  return 0;
}

/**
 * Returns the exact current Date of the user's device (with optional manual override if set)
 */
export function getDingalanNow(): Date {
  if (manualTimeOverrideOffsetMs !== 0) {
    return new Date(Date.now() + manualTimeOverrideOffsetMs);
  }
  return new Date();
}

/**
 * Format time directly using the device's local clock
 * Example: "09:39:15 AM"
 */
export function formatDingalanTime(date?: Date): string {
  const d = date || getDingalanNow();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const strHours = String(hours).padStart(2, '0');
  return `${strHours}:${minutes}:${seconds} ${ampm}`;
}

/**
 * Format full date and time matching the device's local clock
 * Example: "Monday, October 12, 2026 • 09:39:15 AM"
 */
export function formatDingalanFull(date?: Date): string {
  const d = date || getDingalanNow();
  const info = formatPhilippineDateTime(d);
  return `${info.dayAndDateEnglish} • ${info.exactTimeWithSeconds}`;
}

export interface PhilippineDateTimeInfo {
  dayOfWeekTagalog: string;
  weekdayEn: string;
  monthTagalog: string;
  dayNum: string;
  yearNum: string;
  dayAndDateTagalog: string;
  dayAndDateEnglish: string;
  exactTimeWithSeconds: string;
  fullCombinedTagalog: string;
}

/**
 * Device-Synchronized Formatter
 * Accurately extracts the Day of the Week (Araw), Full Date, and Exact Time with Seconds (Oras)
 * directly from the device clock.
 */
export function formatPhilippineDateTime(timestampOrStr?: string | Date, fallbackString?: string): PhilippineDateTimeInfo {
  let date: Date | null = null;

  if (timestampOrStr instanceof Date && !isNaN(timestampOrStr.getTime())) {
    date = timestampOrStr;
  } else if (typeof timestampOrStr === 'string' && timestampOrStr.trim()) {
    const raw = timestampOrStr.trim();
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      date = d;
    } else {
      const clean = raw.replace(/PST/gi, '').trim();
      const d2 = new Date(clean);
      if (!isNaN(d2.getTime())) {
        date = d2;
      }
    }
  }

  if (!date && typeof fallbackString === 'string' && fallbackString.trim()) {
    const clean = fallbackString.replace(/PST/gi, '').trim();
    const d3 = new Date(clean);
    if (!isNaN(d3.getTime())) {
      date = d3;
    }
  }

  if (!date || isNaN(date.getTime())) {
    date = getDingalanNow();
  }

  const dayNamesTagalog = ['Linggo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes', 'Biyernes', 'Sabado'];
  const dayNamesEnglish = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNamesTagalog = [
    'Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo',
    'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'
  ];
  const monthNamesEnglish = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Directly extract device local date & time values
  const dayIdx = date.getDay();
  const dayOfWeekTagalog = dayNamesTagalog[dayIdx] || 'Lunes';
  const weekdayEn = dayNamesEnglish[dayIdx] || 'Monday';

  const mIdx = date.getMonth();
  const monthTagalog = monthNamesTagalog[mIdx] || 'Enero';
  const monthEn = monthNamesEnglish[mIdx] || 'January';

  const dayNum = String(date.getDate()).padStart(2, '0');
  const yearNum = String(date.getFullYear());

  let h = date.getHours();
  const min = String(date.getMinutes()).padStart(2, '0');
  const sec = String(date.getSeconds()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const strH = String(h).padStart(2, '0');

  const dayAndDateTagalog = `${dayOfWeekTagalog}, ${monthTagalog} ${dayNum}, ${yearNum}`;
  const dayAndDateEnglish = `${weekdayEn}, ${monthEn} ${dayNum}, ${yearNum}`;
  const exactTimeWithSeconds = `${strH}:${min}:${sec} ${ampm}`;

  return {
    dayOfWeekTagalog,
    weekdayEn,
    monthTagalog,
    dayNum,
    yearNum,
    dayAndDateTagalog,
    dayAndDateEnglish,
    exactTimeWithSeconds,
    fullCombinedTagalog: `${dayAndDateTagalog} • ${exactTimeWithSeconds}`,
  };
}

/**
 * Converts a Philippine Standard Time (PST, UTC+8) date string and time string to UTC epoch milliseconds
 */
export function parsePstDateTime(
  dateStr?: string,
  timeStr?: string,
  defaultHour = 6,
  defaultMinute = 0
): number {
  if (!dateStr) return 0;
  let year = 0, month = 0, day = 0;
  const parts = String(dateStr).trim().split(/[\/\-]/).map(Number);
  if (parts.length === 3) {
    if (parts[0] > 1000) {
      year = parts[0];
      month = parts[1];
      day = parts[2];
    } else if (parts[2] > 1000) {
      month = parts[0];
      day = parts[1];
      year = parts[2];
    }
  }
  if (!year || !month || !day) {
    const todayPst = getDingalanNow();
    year = todayPst.getFullYear();
    month = todayPst.getMonth() + 1;
    day = todayPst.getDate();
  }

  let hours = defaultHour;
  let minutes = defaultMinute;

  if (timeStr) {
    let clean = String(timeStr).trim();
    if (clean.includes('-')) {
      clean = clean.split('-')[0].trim();
    }
    clean = clean.replace(/\(.*?\)/g, '').trim();
    const match = clean.match(/(\d+)[:;](\d+)\s*(AM|PM)?/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3] ? match[3].toUpperCase() : '';
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    }
  }

  // Target local epoch milliseconds (kung ano ang oras ng device, ganun din ang oras ng system)
  return new Date(year, month - 1, day, hours, minutes, 0).getTime();
}

/**
 * Check whether an event broadcast or activity schedule is active and NOT EXPIRED,
 * strictly matching the user's device local clock.
 */
export function checkIsBroadcastActive(broadcast: any): boolean {
  if (!broadcast) return false;
  if (broadcast.qrScheduleEnabled === false) return false;
  try {
    const nowDeviceMs = getDingalanNow().getTime();

    // 1. Check Start Schedule Arrival (kung kelan magsisimulang lumabas sa login page batay sa device clock)
    const startRawDate = broadcast.qrDisplayStartDate || broadcast.eventDate || broadcast.date;
    const startRawTime = broadcast.qrDisplayStartTime || broadcast.startTime || broadcast.callTime;
    if (startRawDate && startRawTime) {
      const targetStartDeviceMs = parsePstDateTime(startRawDate, startRawTime, 0, 0);
      if (targetStartDeviceMs > 0 && nowDeviceMs < targetStartDeviceMs) {
        // Scheduled in the future; hindi pa dumarating ang itinakdang oras sa device
        return false;
      }
    }

    // 2. Determine End Date (YYYY-MM-DD or MM/DD/YYYY)
    const rawEndDate = broadcast.qrDisplayEndDate || broadcast.eventDate || broadcast.date;
    let year = 0, month = 0, day = 0;
    if (rawEndDate && typeof rawEndDate === 'string') {
      const parts = rawEndDate.split(/[\/\-]/).map(Number);
      if (parts.length === 3) {
        if (parts[0] > 1000) {
          year = parts[0];
          month = parts[1];
          day = parts[2];
        } else if (parts[2] > 1000) {
          month = parts[0];
          day = parts[1];
          year = parts[2];
        }
      }
    }

    if (!year || !month || !day) {
      const todayDevice = getDingalanNow();
      year = todayDevice.getFullYear();
      month = todayDevice.getMonth() + 1;
      day = todayDevice.getDate();
    }

    // 3. Parse End Time
    let rawTimeStr = broadcast.qrDisplayEndTime || broadcast.estimatedEndTime || broadcast.endTime || broadcast.callTime || '11:59 PM';
    rawTimeStr = String(rawTimeStr).trim();

    // Handle range strings like "6:00 am - 3;55 Pm (4 na Oras)" -> extract the second part
    if (rawTimeStr.includes('-')) {
      const subParts = rawTimeStr.split('-');
      rawTimeStr = subParts[subParts.length - 1].trim();
    }

    rawTimeStr = rawTimeStr.replace(/\(.*?\)/g, '').trim();

    const timeMatch = rawTimeStr.match(/(\d+)[:;](\d+)\s*(AM|PM)?/i);

    let hours = 23;
    let minutes = 59;

    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : '';

      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      if (!ampm && hours >= 1 && hours <= 11) {
        hours += 12;
      }
    }

    // Target end epoch milliseconds in device local time
    const targetEndDate = new Date(year, month - 1, day, hours, minutes, 59);
    const targetEndDeviceMs = targetEndDate.getTime();

    // Active ONLY IF current device time is strictly BEFORE the target end time
    return nowDeviceMs < targetEndDeviceMs;
  } catch {
    return true;
  }
}

/**
 * Calculates realtime remaining countdown against device local time
 */
export function calculateDingalanRemainingTime(
  eventDateStr?: string,
  endTimeStr?: string
): {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isPast24Hours: boolean;
} {
  if (!eventDateStr) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true, isPast24Hours: false };
  }

  const nowDevice = getDingalanNow();
  let [year, month, day] = (eventDateStr || '').split('-').map(Number);
  if (!year || !month || !day) {
    const todayDevice = getDingalanNow();
    year = todayDevice.getFullYear();
    month = todayDevice.getMonth() + 1;
    day = todayDevice.getDate();
  }

  let hours = 17;
  let minutes = 0;

  if (endTimeStr) {
    const cleanTime = endTimeStr.trim().toUpperCase();
    const timeMatch = cleanTime.match(/(\d+):(\d+)\s*(AM|PM)?/);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3];

      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;

      hours = h;
      minutes = m;
    }
  }

  // Create local epoch for target date/time matching device clock
  const targetEpochMs = new Date(year, month - 1, day, hours, minutes, 0).getTime();
  const diffMs = targetEpochMs - nowDevice.getTime();

  if (diffMs <= 0) {
    const isPast24Hours = Math.abs(diffMs) > 24 * 60 * 60 * 1000;
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      isPast24Hours,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return {
    hours: h,
    minutes: m,
    seconds: s,
    isExpired: false,
    isPast24Hours: false,
  };
}

import { useState, useEffect } from 'react';

/**
 * React hook to get real-time updating Dingalan, Aurora authoritative time (PST - UTC+8)
 * with full breakdown: segundo (seconds), minuto (minutes), oras (hours), date, month, and year.
 */
export function useDingalanClock() {
  const getClockState = () => {
    const now = getDingalanNow();
    const info = formatPhilippineDateTime(now);
    return {
      time: formatDingalanTime(now),
      full: info.fullCombinedTagalog,
      fullEn: `${info.dayAndDateEnglish} • ${info.exactTimeWithSeconds}`,
      dayOfWeek: info.dayOfWeekTagalog,
      weekdayEn: info.weekdayEn,
      month: info.monthTagalog,
      dayNum: info.dayNum,
      year: info.yearNum,
      dateFormatted: `${info.monthTagalog} ${info.dayNum}, ${info.yearNum}`,
      timeWithSeconds: info.exactTimeWithSeconds,
      info,
      now,
    };
  };

  const [clockState, setClockState] = useState(getClockState);

  useEffect(() => {
    syncDingalanTime().then(() => {
      setClockState(getClockState());
    });

    const timer = setInterval(() => {
      setClockState(getClockState());
    }, 1000);

    const handleManualUpdate = () => {
      setClockState(getClockState());
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('dingalan-time-updated', handleManualUpdate);
    }

    return () => {
      clearInterval(timer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('dingalan-time-updated', handleManualUpdate);
      }
    };
  }, []);

  return {
    ...clockState,
    isSynchronized,
  };
}


