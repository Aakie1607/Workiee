export const WORK_TYPES = ['SA', 'UKSR', 'EC', 'Custom'];
export const PAY_TYPES = ['SP2', 'SP7', 'Custom Pay'];

export const PAY_RATES: { [key: string]: number } = {
  SP2: 14.54,
  SP7: 15.52,
};

export const BREAK_DURATIONS: { [key: string]: number } = {
  SA: 1, // 1 hour
  UKSR: 1, // 1 hour
  EC: 0.5, // 30 minutes
};

export const WEEKLY_HOUR_LIMIT = 20;