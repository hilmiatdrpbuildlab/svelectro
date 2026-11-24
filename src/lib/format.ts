const dt = new Intl.DateTimeFormat('nl-BE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Brussels' });
const d = new Intl.DateTimeFormat('nl-BE', { dateStyle: 'long', timeZone: 'Europe/Brussels' });

export const formatDateTime = (v: Date | string) => dt.format(new Date(v));
export const formatDate = (v: Date | string) => d.format(new Date(v));
