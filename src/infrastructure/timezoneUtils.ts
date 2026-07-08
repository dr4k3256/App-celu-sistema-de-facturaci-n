/**
 * Timezone utility — reads the user's selected timezone from localStorage
 * and provides correctly-formatted date/time strings for that zone.
 * All sale/expense dates in the app should use these functions so that
 * the dashboard filters (today, this month) remain consistent.
 */

export const getTimezone = (): string =>
    localStorage.getItem('app_timezone') || 'America/Bogota';

/**
 * Returns current local datetime as "YYYY-MM-DDTHH:mm:ss" in the selected timezone.
 * Compatible with ISO startsWith() comparisons used in finance/dashboard filters.
 */
export const getLocalDateTime = (): string => {
    const tz = getTimezone();
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).formatToParts(now);

    const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00';
    const hour = get('hour') === '24' ? '00' : get('hour'); // midnight edge case
    return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}:${get('second')}`;
};

/** Returns "YYYY-MM-DD" in the selected timezone */
export const getLocalDate = (): string => getLocalDateTime().slice(0, 10);

/** Returns "YYYY-MM" in the selected timezone */
export const getLocalMonth = (): string => getLocalDateTime().slice(0, 7);
