import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { WorkLog } from '../types';
import { useWorkie } from '../store/WorkieContext';
import { WORK_TYPES, PAY_TYPES, BREAK_OPTIONS_MODAL, BREAK_OPTION_LABELS, WEEKLY_HOUR_LIMIT } from '../constants';
import { formatDate, getWeekStartDate, addDays } from '../utils/dateUtils';
import { IconClose } from './icons';
import { calculateHoursAndPay } from '../utils/calculationUtils';
import Dropdown from './ui/Dropdown';
import DatePicker from './ui/DatePicker';

interface LogModalProps {
    log: WorkLog | null; // Null when adding new, populated when editing
    onClose: () => void;
    onSave: () => void; // Triggered after any save (add or update)
    allLogs: WorkLog[]; // All logs for weekly hour calculation
    payRates: { [key: string]: number }; // Pay rates for local calculation
    weeklyHourLimit: number; // The weekly hour limit
    currency: string; // Currency for error message display
}

interface TimePickerProps {
    label: string;
    name: string;
    value: string; // HH:MM
    onChange: (name: string, value: string) => void;
    error?: string;
    hasSubmitted: boolean; // Prop to control error visibility
}

const TimePicker: React.FC<TimePickerProps> = ({ label, name, value, onChange, error, hasSubmitted }) => {
    // If value is empty, default to empty string for hour/minute, otherwise parse.
    const [hour, minute] = value ? value.split(':') : ['', ''];

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = ['00', '15', '30', '45'];

    const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(name, `${e.target.value || ''}:${minute || '00'}`); // Use '' as fallback for empty
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(name, `${hour || '00'}:${e.target.value || ''}`); // Use '' as fallback for empty
    };

    // Conditional styling based on error and hasSubmitted
    const inputClass = `p-3 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 ${
        hasSubmitted && error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-purple-400'
    }`;

    return (
        <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
            <div className="flex gap-2">
                <select value={hour} onChange={handleHourChange} className={`w-full ${inputClass}`}>
                    <option value="">HH</option> {/* Placeholder */}
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="self-center text-gray-600">:</span>
                <select value={minute} onChange={handleMinuteChange} className={`w-full ${inputClass}`}>
                    <option value="">MM</option> {/* Placeholder */}
                    {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
            {hasSubmitted && error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

const LogModal: React.FC<LogModalProps> = ({ log, onClose, onSave, allLogs, payRates, weeklyHourLimit, currency }) => {
    const { state, dispatch } = useWorkie();
    
    const isAddingNew = !log;

    const initialFormData = {
        date: '', // Changed to empty string for placeholder
        workType: '', 
        customWorkType: '',
        startTime: '', 
        endTime: '', 
        payType: '', 
        customPayRate: '',
        breakOption: '', 
        customBreakDuration: '',
        notes: '',
    };

    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
    const [weeklyLimitExceededError, setWeeklyLimitExceededError] = useState<string | null>(null); 
    const [hasSubmitted, setHasSubmitted] = useState(false); // New state to track if form has been submitted

    // Validation function that returns an errors object, but doesn't set state
    const validate = (data: typeof initialFormData) => {
        const newErrors: Partial<Record<keyof typeof formData, string>> = {};

        if (!data.workType) newErrors.workType = 'Work Type is required.';
        if (!data.payType) newErrors.payType = 'Pay Type is required.';
        if (!data.breakOption) newErrors.breakOption = 'Break Duration is required.';
        if (!data.date) newErrors.date = 'Date is required.';

        // Combined check for start/end time
        if (!data.startTime || !data.endTime) {
            if (!data.startTime) newErrors.startTime = 'Start Time is required.';
            if (!data.endTime) newErrors.endTime = 'End Time is required.';
        } else {
            const start = new Date(`${data.date}T${data.startTime}`);
            const end = new Date(`${data.date}T${data.endTime}`);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                // This case should ideally not be hit with select inputs, but as a safeguard
                newErrors.startTime = 'Invalid time format.';
                newErrors.endTime = 'Invalid time format.';
            } else if (end <= start) {
                newErrors.endTime = 'End time must be after start time.';
            }
        }

        if (data.payType === 'Custom Pay') {
            const rate = parseFloat(data.customPayRate);
            if (!data.customPayRate || isNaN(rate) || rate <= 0) {
                newErrors.customPayRate = 'Must be a positive number.';
            }
        }

        if (data.workType === 'Custom' && !data.customWorkType.trim()) {
            newErrors.customWorkType = 'Cannot be empty.';
        }

        if (data.breakOption === 'Custom') {
            const duration = parseFloat(data.customBreakDuration);
            if (data.customBreakDuration === '' || isNaN(duration) || duration < 0) { 
                newErrors.customBreakDuration = 'Must be 0 or a positive number.';
            }
        }

        return newErrors;
    };

    useEffect(() => {
        if (log) {
            let breakOption = ''; 
            let customBreakDuration = '';

            if (log.breakDuration === 0) {
                breakOption = '0';
            } else if (log.breakDuration === 0.5) {
                breakOption = '0.5';
            } else if (log.breakDuration === 1) {
                breakOption = '1';
            } else {
                breakOption = 'Custom';
                customBreakDuration = log.breakDuration.toString();
            }

            const parsedFormData = {
                date: log.date,
                workType: log.workType,
                customWorkType: log.customWorkType || '',
                startTime: log.startTime,
                endTime: log.endTime,
                payType: log.payType,
                customPayRate: log.customPayRate?.toString() || '',
                breakOption: breakOption,
                customBreakDuration: customBreakDuration,
                notes: log.notes || '',
            };
            setFormData(parsedFormData);
            setErrors(validate(parsedFormData)); // Validate initial state of editing log
            setHasSubmitted(true); // Treat editing logs as already "submitted" for error display
        } else {
            setFormData(initialFormData);
            setErrors({});
            setHasSubmitted(false); // Reset for new logs
        }
        setWeeklyLimitExceededError(null); 
    }, [log]);
    
    const handleChange = useCallback((name: string, value: string) => { 
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (hasSubmitted) { // Only re-validate if already submitted
                setErrors(validate(newData));
            }
            return newData;
        });
        setWeeklyLimitExceededError(null); 
    }, [hasSubmitted]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setHasSubmitted(true); // From now on, errors will be shown

        const currentErrors = validate(formData);
        setErrors(currentErrors); // Update the errors state for display

        if (Object.keys(currentErrors).length > 0) {
            setWeeklyLimitExceededError(null); 
            return;
        }

        let finalBreakDuration: number;
        if (formData.breakOption === 'Custom') {
            finalBreakDuration = parseFloat(formData.customBreakDuration);
        } else {
            finalBreakDuration = parseFloat(formData.breakOption);
        }
        
        const logDataForCalculation = {
            date: formData.date,
            workType: formData.workType,
            customWorkType: formData.workType === 'Custom' ? formData.customWorkType : undefined,
            startTime: formData.startTime,
            endTime: formData.endTime,
            payType: formData.payType,
            customPayRate: formData.payType === 'Custom Pay' ? parseFloat(formData.customPayRate) : undefined,
            breakDuration: finalBreakDuration,
            notes: formData.notes,
        };

        const { hoursWorked: newLogHours } = calculateHoursAndPay(logDataForCalculation, payRates);

        if (isAddingNew) {
            const targetWeekStart = getWeekStartDate(new Date(formData.date + 'T00:00:00'));
            const targetWeekEnd = addDays(targetWeekStart, 6);

            const currentWeeklyHours = allLogs
                .filter(existingLog => {
                    const existingLogDate = new Date(existingLog.date + 'T00:00:00');
                    return existingLogDate >= targetWeekStart && existingLogDate <= targetWeekEnd;
                })
                .reduce((sum, existingLog) => sum + existingLog.hoursWorked, 0);

            if (currentWeeklyHours + newLogHours > weeklyHourLimit) {
                setWeeklyLimitExceededError(
                    `Adding this log would exceed the weekly limit of ${weeklyHourLimit} hours (${(currentWeeklyHours + newLogHours).toFixed(2)} total).`
                );
                return;
            }
        }
        
        const finalPayRate = logDataForCalculation.payType === 'Custom Pay' && logDataForCalculation.customPayRate !== undefined ? logDataForCalculation.customPayRate : payRates[logDataForCalculation.payType] || 0;
        const finalLogData = {
            ...logDataForCalculation,
            hoursWorked: newLogHours, 
            pay: newLogHours * finalPayRate,
        };

        if (isAddingNew) {
            dispatch({ type: 'ADD_LOG', payload: finalLogData });
            setFormData(prev => ({
                ...initialFormData,
                date: prev.date, 
            }));
            setErrors({}); // Clear errors after successful add
            setHasSubmitted(false); // Reset submitted state for next new log
            setWeeklyLimitExceededError(null);
        } else {
            dispatch({ type: 'UPDATE_LOG', payload: { ...finalLogData, id: log!.id } as WorkLog });
            onClose();
        }
        onSave();
    };
    
    // Determine if the submit button should be disabled based on current form data validity
    const isSubmitDisabled = useMemo(() => {
        const formErrors = validate(formData); // Always check latest formData for validity
        return Object.keys(formErrors).length > 0 || (isAddingNew && weeklyLimitExceededError !== null);
    }, [formData, isAddingNew, weeklyLimitExceededError]);

    const workTypeOptions = [{ value: '', label: 'Select Work Type' }, ...WORK_TYPES.map(type => ({ value: type, label: type }))];
    const payTypeOptions = [{ value: '', label: 'Select Pay Type' }, ...PAY_TYPES.map(type => ({ value: type, label: type }))];
    const breakDurationOptions = [{ value: '', label: 'Select Break Duration' }, ...BREAK_OPTIONS_MODAL.map(option => ({ value: option, label: BREAK_OPTION_LABELS[option] }))];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <IconClose className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold text-purple-600 mb-6 text-center">{isAddingNew ? 'Add Work Log' : 'Edit Work Log'}</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <DatePicker
                            label="Date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            error={hasSubmitted ? errors.date : undefined} // Only show error if submitted
                        />
                        <Dropdown
                            label="Work Type"
                            name="workType"
                            options={workTypeOptions}
                            value={formData.workType}
                            onChange={handleChange}
                            error={hasSubmitted ? errors.workType : undefined} // Only show error if submitted
                        />
                    </div>

                    {formData.workType === 'Custom' && (
                         <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Custom Work Type</label>
                            <input 
                                type="text" 
                                name="customWorkType" 
                                value={formData.customWorkType} 
                                onChange={(e) => handleChange(e.target.name, e.target.value)} 
                                placeholder="e.g., Project Phoenix" 
                                className={`w-full p-3 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 ${hasSubmitted && errors.customWorkType ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-purple-400'}`} 
                            />
                             {hasSubmitted && errors.customWorkType && <p className="text-red-500 text-xs mt-1">{errors.customWorkType}</p>}
                        </div>
                    )}

                     <div className="grid grid-cols-2 gap-4">
                        <TimePicker 
                            label="Start Time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                            error={errors.startTime}
                            hasSubmitted={hasSubmitted} // Pass hasSubmitted to TimePicker
                        />
                        <TimePicker 
                            label="End Time"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                            error={errors.endTime}
                            hasSubmitted={hasSubmitted} // Pass hasSubmitted to TimePicker
                        />
                    </div>

                    <Dropdown
                        label="Pay Type"
                        name="payType"
                        options={payTypeOptions}
                        value={formData.payType}
                        onChange={handleChange}
                        error={hasSubmitted ? errors.payType : undefined} // Only show error if submitted
                    />

                     {formData.payType === 'Custom Pay' && (
                         <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Pay Rate ({currency}/hr)</label>
                            <input 
                                type="number" 
                                name="customPayRate" 
                                value={formData.customPayRate} 
                                onChange={(e) => handleChange(e.target.name, e.target.value)} 
                                step="0.01" 
                                min="0" 
                                placeholder="e.g., 25.00" 
                                className={`w-full p-3 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 ${hasSubmitted && errors.customPayRate ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-purple-400'}`}/>
                            {hasSubmitted && errors.customPayRate && <p className="text-red-500 text-xs mt-1">{errors.customPayRate}</p>}
                        </div>
                    )}
                    
                    <Dropdown
                        label="Break Duration"
                        name="breakOption"
                        options={breakDurationOptions}
                        value={formData.breakOption}
                        onChange={handleChange}
                        error={hasSubmitted ? errors.breakOption : undefined} // Only show error if submitted
                    />

                    {formData.breakOption === 'Custom' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Custom Break (hours)</label>
                            <input 
                                type="number" 
                                name="customBreakDuration" 
                                value={formData.customBreakDuration} 
                                onChange={(e) => handleChange(e.target.name, e.target.value)} 
                                step="0.1" 
                                min="0" 
                                placeholder="e.g., 0.75 for 45 mins" 
                                className={`w-full p-3 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 ${hasSubmitted && errors.customBreakDuration ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-purple-400'}`}/>
                            {hasSubmitted && errors.customBreakDuration && <p className="text-red-500 text-xs mt-1">{errors.customBreakDuration}</p>}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Notes (Optional)</label>
                        <textarea name="notes" value={formData.notes} onChange={(e) => handleChange(e.target.name, e.target.value)} placeholder="Add any notes here..." className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" rows={3}></textarea>
                    </div>

                    {weeklyLimitExceededError && (
                        <p className="text-red-500 text-sm mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-center">{weeklyLimitExceededError}</p>
                    )}

                    <div className="pt-2 flex gap-3">
                        {isAddingNew && (
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="w-full py-3 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Done
                            </button>
                        )}
                        <button 
                            type="submit" 
                            disabled={isSubmitDisabled} 
                            className="w-full py-3 px-4 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 disabled:bg-purple-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {isAddingNew ? 'Add Log' : 'Update Log'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LogModal;