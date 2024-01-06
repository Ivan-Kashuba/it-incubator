export function addDaysToDate(date = new Date(), dayNumber: number) {
  date.setDate(date.getDate() + dayNumber);

  return date;
}
