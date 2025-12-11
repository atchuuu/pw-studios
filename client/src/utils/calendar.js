import { format, parseISO } from 'date-fns';

/**
 * formats date to YYYYMMDDTHHmmssZ string for calendar
 * @param {string} dateStr 
 * @returns {string}
 */
const formatDateForCalendar = (dateStr) => {
    if (!dateStr) return '';
    // basic iso string to YYYYMMDDTHHmmss
    return format(parseISO(dateStr), "yyyyMMdd'T'HHmmss");
};

/**
 * Generates a Google Calendar Web URL
 * @param {object} booking 
 * @returns {string}
 */
export const getGoogleCalendarUrl = (booking) => {
    const startTime = formatDateForCalendar(booking.startTime);
    const endTime = formatDateForCalendar(booking.endTime);
    const title = encodeURIComponent(`Studio Booking: ${booking.studio?.name}`);
    const details = encodeURIComponent(`Booking at ${booking.studio?.name}.\nUnit: ${booking.studioUnit || 'General'}.\nStatus: ${booking.status}\nRef: ${booking._id}`);
    const location = encodeURIComponent(booking.studio?.location || booking.studio?.city || 'PW Studio');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
};

/**
 * Generates and triggers download of an .ics file
 * @param {object} booking 
 */
export const downloadICS = (booking) => {
    const startTime = formatDateForCalendar(booking.startTime);
    const endTime = formatDateForCalendar(booking.endTime);
    const summary = `Studio Booking: ${booking.studio?.name} - ${booking.studioUnit || 'General'}`;
    const description = `Booking at ${booking.studio?.name}. Unit: ${booking.studioUnit || 'General'}. Status: ${booking.status}`;
    const location = booking.studio?.location || booking.studio?.city || 'PW Studio';

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `DTSTART:${startTime}`,
        `DTEND:${endTime}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `booking-${booking._id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Main handler
 * Default: Opens Google Calendar in new tab.
 * Fallback (optional behavior could be added): triggers ICS.
 */
export const handleCalendarExport = (booking) => {
    // For now, we prefer Google Calendar as requested
    const googleUrl = getGoogleCalendarUrl(booking);
    window.open(googleUrl, '_blank');
};
