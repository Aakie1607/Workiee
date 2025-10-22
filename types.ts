import { PAY_RATES } from "./constants";

export interface WorkLog {
  id: string;
  date: string; // YYYY-MM-DD
  workType: string;
  customWorkType?: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  payType: string;
  customPayRate?: number;
  skippedBreak: boolean;
  hoursWorked: number;
  pay: number;
  notes?: string;
}

export interface UserSettings {
    payRates: { [key: string]: number };
    currency: '£' | '$' | '€';
}
