import React, { createContext, useReducer, useContext, useEffect, ReactNode } from 'react';
import { WorkLog, UserSettings } from '../types';
import { calculateHoursAndPay } from '../utils/calculationUtils';
import { PAY_RATES } from '../constants';

// State and Action Types
interface AppState {
    users: string[];
    currentUser: string | null;
    logs: WorkLog[];
    avatarUrl: string | null;
    settings: UserSettings;
}

// Update the Omit type for ADD_LOG action
type AddLogPayload = Omit<WorkLog, 'id' | 'hoursWorked' | 'pay'>;

type Action =
    | { type: 'LOGIN'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'SET_USERS'; payload: string[] }
    | { type: 'SET_LOGS'; payload: WorkLog[] }
    | { type: 'ADD_LOG'; payload: AddLogPayload } // Updated payload type
    | { type: 'UPDATE_LOG'; payload: WorkLog }
    | { type: 'DELETE_LOG'; payload: string }
    | { type: 'RENAME_USER'; payload: { oldName: string; newName: string } }
    | { type: 'UPDATE_AVATAR'; payload: string }
    | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
    | { type: 'RESET_ACCOUNT' }
    | { type: 'DELETE_ACCOUNT' };
    
const defaultSettings: UserSettings = {
    payRates: PAY_RATES,
    currency: '£',
};

const initialState: AppState = {
    users: [],
    currentUser: null,
    logs: [],
    avatarUrl: null,
    settings: defaultSettings,
};

// LocalStorage Utils
const getStoredUsers = (): string[] => {
    const users = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('workie_user_')) {
            users.push(key.replace('workie_user_', ''));
        }
    }
    return users;
};

const getLogsForUser = (username: string): WorkLog[] => {
    const data = localStorage.getItem(`workie_user_${username}`);
    if (!data) return [];
    const logs: any[] = JSON.parse(data);
    return logs.map((log) => {
        // Migration logic for old logs
        if (log.hasOwnProperty('skippedLunch')) { // Handle very old "skippedLunch"
            log.skippedBreak = log.skippedLunch;
            delete log.skippedLunch;
        }
        if (log.hasOwnProperty('skippedBreak')) { // Convert "skippedBreak" to "breakDuration"
            // If skippedBreak exists, convert it to breakDuration
            // Assuming default break is 1 hour if not skipped, 0 if skipped.
            // This might need refinement based on exact old logic.
            log.breakDuration = log.skippedBreak ? 0 : (log.workType === 'EC' ? 0.5 : 1);
            delete log.skippedBreak;
        } else if (!log.hasOwnProperty('breakDuration')) { // Ensure new logs also have a default breakDuration if missing (e.g., from old storage)
            log.breakDuration = (log.workType === 'EC' ? 0.5 : 1);
        }
        return log;
    });
};

const saveLogsForUser = (username: string, logs: WorkLog[]) => {
    localStorage.setItem(`workie_user_${username}`, JSON.stringify(logs));
};

const getSettingsForUser = (username: string): UserSettings => {
    const data = localStorage.getItem(`workie_settings_${username}`);
    return data ? JSON.parse(data) : defaultSettings;
};

const saveSettingsForUser = (username: string, settings: UserSettings) => {
    localStorage.setItem(`workie_settings_${username}`, JSON.stringify(settings));
};


// Reducer
const reducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'LOGIN': {
            const username = action.payload;
            sessionStorage.setItem('workie_currentUser', username);
            const logs = getLogsForUser(username);
            const avatarUrl = localStorage.getItem(`workie_avatar_${username}`);
            const settings = getSettingsForUser(username);
            return {
                ...state,
                currentUser: username,
                logs: logs,
                avatarUrl: avatarUrl,
                settings: settings,
            };
        }
        case 'LOGOUT':
            sessionStorage.removeItem('workie_currentUser');
            return { ...initialState, users: getStoredUsers() };
        case 'SET_USERS':
            return { ...state, users: action.payload };
        case 'SET_LOGS':
            return { ...state, logs: action.payload };
        case 'ADD_LOG': {
            if (!state.currentUser) return state;
            // The payload now includes breakDuration
            const { hoursWorked, pay } = calculateHoursAndPay(action.payload, state.settings.payRates);
            const newLog: WorkLog = {
                id: new Date().toISOString(),
                ...action.payload,
                hoursWorked,
                pay,
            };
            const updatedLogs = [...state.logs, newLog].sort((a,b) => new Date(b.date + 'T00:00:00').getTime() - new Date(a.date + 'T00:00:00').getTime());
            saveLogsForUser(state.currentUser, updatedLogs);
            return { ...state, logs: updatedLogs };
        }
        case 'UPDATE_LOG': {
            if (!state.currentUser) return state;
             // The payload now includes breakDuration
             const { hoursWorked, pay } = calculateHoursAndPay(action.payload, state.settings.payRates);
             const updatedLog = {...action.payload, hoursWorked, pay};
            const updatedLogs = state.logs.map(log => log.id === updatedLog.id ? updatedLog : log)
                .sort((a,b) => new Date(b.date + 'T00:00:00').getTime() - new Date(a.date + 'T00:00:00').getTime());
            saveLogsForUser(state.currentUser, updatedLogs);
            return { ...state, logs: updatedLogs };
        }
        case 'DELETE_LOG': {
            if (!state.currentUser) return state;
            const updatedLogs = state.logs.filter(log => log.id !== action.payload);
            saveLogsForUser(state.currentUser, updatedLogs);
            return { ...state, logs: updatedLogs };
        }
        case 'RENAME_USER': {
            const { oldName, newName } = action.payload;
            if (newName.length < 3 || !oldName || newName === oldName || state.users.includes(newName)) {
                return state;
            }
            
            const logs = getLogsForUser(oldName);
            saveLogsForUser(newName, logs);
            localStorage.removeItem(`workie_user_${oldName}`);

            const avatar = localStorage.getItem(`workie_avatar_${oldName}`);
            if (avatar) {
                localStorage.setItem(`workie_avatar_${newName}`, avatar);
                localStorage.removeItem(`workie_avatar_${oldName}`);
            }

            const settings = getSettingsForUser(oldName);
            saveSettingsForUser(newName, settings);
            localStorage.removeItem(`workie_settings_${oldName}`);

            // Migrate tour completion status
            const tourCompleted = localStorage.getItem(`workie_tour_completed_${oldName}`);
            if (tourCompleted) {
                localStorage.setItem(`workie_tour_completed_${newName}`, tourCompleted);
                localStorage.removeItem(`workie_tour_completed_${oldName}`);
            }

            sessionStorage.setItem('workie_currentUser', newName);
            const updatedUsers = state.users.map(u => u === oldName ? newName : u);

            return {
                ...state,
                currentUser: newName,
                users: updatedUsers,
                settings,
            };
        }
        case 'UPDATE_AVATAR': {
            if (!state.currentUser) return state;
            localStorage.setItem(`workie_avatar_${state.currentUser}`, action.payload);
            return {
                ...state,
                avatarUrl: action.payload,
            };
        }
        case 'UPDATE_SETTINGS': {
            if (!state.currentUser) return state;
            const newSettings = { ...state.settings, ...action.payload };
            saveSettingsForUser(state.currentUser, newSettings);
            return { ...state, settings: newSettings };
        }
        case 'RESET_ACCOUNT': {
            if (!state.currentUser) return state;
            saveLogsForUser(state.currentUser, []);
            localStorage.removeItem(`workie_avatar_${state.currentUser}`);
            return {
                ...state,
                logs: [],
                avatarUrl: null,
            };
        }
        case 'DELETE_ACCOUNT': {
             if (!state.currentUser) return state;
            const username = state.currentUser;
            localStorage.removeItem(`workie_user_${username}`);
            localStorage.removeItem(`workie_avatar_${username}`);
            localStorage.removeItem(`workie_settings_${username}`);
            localStorage.removeItem(`workie_tour_completed_${username}`); // Also remove tour status
            sessionStorage.removeItem('workie_currentUser');
            const updatedUsers = state.users.filter(u => u !== username);
            return {
                ...initialState,
                users: updatedUsers,
            };
        }
        default:
            return state;
    }
};

// Context
const WorkieContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

// Provider
export const WorkieProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        dispatch({ type: 'SET_USERS', payload: getStoredUsers() });
        const sessionUser = sessionStorage.getItem('workie_currentUser');
        if (sessionUser) {
            dispatch({ type: 'LOGIN', payload: sessionUser });
        }
    }, []);

    return <WorkieContext.Provider value={{ state, dispatch }}>{children}</WorkieContext.Provider>;
};

// Hook
export const useWorkie = () => {
    const context = useContext(WorkieContext);
    if (context === undefined) {
        throw new Error('useWorkie must be used within a WorkieProvider');
    }
    return context;
};