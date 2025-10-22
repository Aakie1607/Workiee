
import { WorkLog } from '../types';
// BREAK_DURATIONS is no longer directly used in the calculation logic here,
// as breakDuration is now explicitly passed in the log object.
// import { BREAK_DURATIONS } from '../constants'; 

export const calculateHoursAndPay = (
    log: Omit<WorkLog, 'id' | 'hoursWorked' | 'pay'>, // The Omit type from WorkieContext is implicitly passed here.
    payRates: { [key: string]: number }
) => {
    const start = new Date(`${log.date}T${log.startTime}`);
    const end = new Date(`${log.date}T${log.endTime}`);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        return { hoursWorked: 0, pay: 0 };
    }

    let hours = (end.getTime() - start.getTime()) / 1000 / 60 / 60;

    // Directly use the breakDuration from the log object
    hours -= log.breakDuration; 
    
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