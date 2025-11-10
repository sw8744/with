function toAPIDatetimeString(date: Date | null): string | null {
  if (date === null) return null;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
}

function toAPIDateString(date: Date | null): string | null {
  if (date === null) return null;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateString(year: number, month: number, date: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
}

function getLocalizedDayString(date: Date): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
}

function isoToDisplayDateString(dateISO: string): string {
  const date = new Date(dateISO);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${getLocalizedDayString(date)}요일`;
}

function getDayDelta(from: Date, to: Date): string {
  const delta = Math.floor((to.getTime() - from.getTime()) / 86400000) + 1;
  if (delta > 0) return `D-${delta}`;
  else if (delta === 0) return "D-DAY";
  else return `D+${-delta}`;
}

export {
  toAPIDatetimeString, toAPIDateString, dateString, getLocalizedDayString, isoToDisplayDateString, getDayDelta
}
