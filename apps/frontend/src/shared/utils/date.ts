export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}
