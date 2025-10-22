import { WorkLog } from '../types';
import { BREAK_DURATIONS } from '../constants';

export const calculateHoursAndPay = (
    log: Omit<WorkLog, 'id' | 'hoursWorked' | 'pay'>,
    payRates: { [key: string]: number }
) => {
    const start = new Date(`${log.date}T${log.startTime}`);
    const end = new Date(`${log.date}T${log.endTime}`);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        return { hoursWorked: 0, pay: 0 };
    }

    let hours = (end.getTime() - start.getTime()) / 1000 / 60 / 60;

    if (!log.skippedBreak) {
        const lunch = BREAK_DURATIONS[log.workType] || 0;
        hours -= lunch;
    }
    
    hours = Math.max(0, hours);

    let payRate: number;
    if (log.payType === 'Custom Pay') {
        payRate = log.customPayRate || 0;
    } else {
        payRate = payRates[log.payType] || 0;
    }

    const pay = hours * payRate;

    return { hoursWorked: parseFloat(hours.toFixed(2)), pay: parseFloat(pay.toFixed(2)) };
};
