
// Assuming Monday is the first day of the week
export const getWeekStartDate = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(date.setDate(diff));
};

export const getWeekEndDate = (d: Date): Date => {
  const startDate = getWeekStartDate(d);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  return endDate;
};

export const formatDate = (d: Date): string => {
  return d.toISOString().split('T')[0];
};

export const getWeekDates = (weekStart: Date): Date[] => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        dates.push(d);
    }
    return dates;
}

export const addDays = (d: Date, days: number): Date => {
    const date = new Date(d);
    date.setDate(date.getDate() + days);
    return date;
}
