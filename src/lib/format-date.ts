/** Formats an ISO date as `MM.YYYY` (Figma portfolio card meta). */
export function formatMonthYear(isoDate: string | undefined): string | undefined {
  if (!isoDate) {
    return undefined;
  }
  const match = /^(\d{4})-(\d{2})/.exec(isoDate);
  if (!match) {
    return undefined;
  }
  return `${match[2]}.${match[1]}`;
}
