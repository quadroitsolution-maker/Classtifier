/**
 * Opens a new tab with a prefilled Google Calendar event creation URL.
 * This works in browsers without needing OAuth; user confirms addition.
 */
export interface CalendarEvent {
  title: string;
  location?: string;
  description?: string;
  start: Date;
  end: Date;
}

export function addEventToCalendar(event: CalendarEvent): void {
  const formatDate = (date: Date) =>
    date
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, 'Z'); // YYYYMMDDTHHMMSSZ
  const start = formatDate(event.start);
  const end = formatDate(event.end);
  const params = new URLSearchParams({
    text: event.title,
    dates: `${start}/${end}`,
    location: event.location || '',
    details: event.description || '',
    sprop: 'website:https://yourapp.example.com',
  });
  const url = `https://www.google.com/calendar/render?action=TEMPLATE&${params.toString()}`;
  window.open(url, '_blank');
}
