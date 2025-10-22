

// Helper to format a Date object to YYYY-MM-DD string
export const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper to add days to a Date object, returning a new Date object
export const addDays = (date: Date, days: number): Date => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
};

// Helper to get the Monday of the week for a given date
export const getWeekStartDate = (date: Date): Date => {
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday (make it -6 to get previous Monday)
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0); // Normalize to start of the day
    return monday;
};

// Helper to get all dates for a given week, starting from Monday
export const getWeekDates = (weekStart: Date): Date[] => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
        dates.push(addDays(weekStart, i));
    }
    return dates;
};