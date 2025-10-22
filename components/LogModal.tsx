import React, { useState, useEffect } from 'react';
import { WorkLog } from '../types';
import { useWorkie } from '../store/WorkieContext';
import { WORK_TYPES, PAY_TYPES } from '../constants';
import { formatDate } from '../utils/dateUtils';
import { IconClose } from './icons';

interface LogModalProps {
    log: WorkLog | null;
    onClose: () => void;
    onSave: () => void;
}

interface TimePickerProps {
    label: string;
    name: string;
    value: string; // HH:MM
    onChange: (name: string, value: string) => void;
    error?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ label, name, value, onChange, error }) => {
    const [hour, minute] = value.split(':');

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = ['00', '15', '30', '45'];

    const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(name, `${e.target.value}:${minute}`);
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(name, `${hour}:${e.target.value}`);
    };

    const inputClass = `p-3 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-purple-400'}`;

    return (
        <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
            <div className="flex gap-2">
                <select value={hour} onChange={handleHourChange} className={`w-full ${inputClass}`}>
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="self-center text-gray-600">:</span>
                <select value={minute} onChange={handleMinuteChange} className={`w-full ${inputClass}`}>
                    {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

const LogModal: React.FC<LogModalProps> = ({ log, onClose, onSave }) => {
    const { dispatch } = useWorkie();
    const [formData, setFormData] = useState({
        date: formatDate(new Date()),
        workType: 'SA',
        customWorkType: '',
        startTime: '09:00',
        endTime: '17:00',
        payType: 'SP2',
        customPayRate: '',
        skippedBreak: false,
        notes: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

    const validate = (data = formData) => {
        const newErrors: Partial<Record<keyof typeof formData, string>> = {};

        if (data.startTime && data.endTime) {
            // Compare as full date-time objects to correctly handle times crossing midnight if dates differ (though currently dates are same)
            // Or more simply for same-day comparison:
            const startTimeMinutes = parseInt(data.startTime.split(':')[0]) * 60 + parseInt(data.startTime.split(':')[1]);
            const endTimeMinutes = parseInt(data.endTime.split(':')[0]) * 60 + parseInt(data.endTime.split(':')[1]);
            
            if (endTimeMinutes <= startTimeMinutes) {
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    useEffect(() => {
        if (log) {
            setFormData({
                date: log.date,
                workType: log.workType,
                customWorkType: log.customWorkType || '',
                startTime: log.startTime,
                endTime: log.endTime,
                payType: log.payType,
                customPayRate: log.customPayRate?.toString() || '',
                skippedBreak: log.skippedBreak,
                notes: log.notes || '',
            });
        }
    }, [log]);

    useEffect(() => {
        validate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData]);
    
    // Modified handleChange to also handle direct name/value pairs from custom components like TimePicker
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | string, value?: string | boolean) => {
        if (typeof e === 'string') { // Custom component call (e.g., TimePicker)
            const name = e;
            setFormData(prev => ({ ...prev, [name]: value as string }));
        } else { // Native input change event
            const { name, value: targetValue, type } = e.target;
            if (type === 'checkbox') {
                const { checked } = e.target as HTMLInputElement;
                setFormData(prev => ({ ...prev, [name]: checked }));
            } else {
                setFormData(prev => ({ ...prev, [name]: targetValue }));
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) return;
        
        const logData = {
            date: formData.date,
            workType: formData.workType,
            customWorkType: formData.workType === 'Custom' ? formData.customWorkType : undefined,
            startTime: formData.startTime,
            endTime: formData.endTime,
            payType: formData.payType,
            customPayRate: formData.payType === 'Custom Pay' ? parseFloat(formData.customPayRate) : undefined,
            skippedBreak: formData.skippedBreak,
            notes: formData.notes,
        };

        if (log) {
            dispatch({ type: 'UPDATE_LOG', payload: { ...logData, id: log.id, hoursWorked: 0, pay: 0 } });
        } else {
            dispatch({ type: 'ADD_LOG', payload: logData });
        }
        onSave();
    };
    
    const isFormValid = Object.keys(errors).length === 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <IconClose className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold text-purple-600 mb-6 text-center">{log ? 'Edit' : 'Add'} Work Log</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Work Type</label>
                            <select name="workType" value={formData.workType} onChange={handleChange} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400">
                                {WORK_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                    </div>

                    {formData.workType === 'Custom' && (
                         <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Custom Work Type</label>
                            <input type="text" name="customWorkType" value={formData.customWorkType} onChange={handleChange} required placeholder="e.g., Project Phoenix" className={`w-full p-3 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 ${errors.customWorkType ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-purple-400'}`} />
                             {errors.customWorkType && <p className="text-red-500 text-xs mt-1">{errors.customWorkType}</p>}
                        </div>
                    )}

                     <div className="grid grid-cols-2 gap-4">
                        <TimePicker 
                            label="Start Time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                            error={errors.startTime}
                        />
                        <TimePicker 
                            label="End Time"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                            error={errors.endTime}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Pay Type</label>
                        <select name="payType" value={formData.payType} onChange={handleChange} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400">
                           {PAY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>

                     {formData.payType === 'Custom Pay' && (
                         <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Pay Rate (£/hr)</label>
                            <input type="number" name="customPayRate" value={formData.customPayRate} onChange={handleChange} required step="0.01" min="0" placeholder="e.g., 25.00" className={`w-full p-3 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 ${errors.customPayRate ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-purple-400'}`}/>
                            {errors.customPayRate && <p className="text-red-500 text-xs mt-1">{errors.customPayRate}</p>}
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                        <label htmlFor="skippedBreak" className="font-medium text-gray-700">Skip break</label>
                        <label htmlFor="skippedBreak" className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" id="skippedBreak" name="skippedBreak" className="sr-only peer" checked={formData.skippedBreak} onChange={handleChange} />
                          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Notes (Optional)</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Add any notes here..." className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" rows={3}></textarea>
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={!isFormValid} className="w-full py-3 px-4 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 disabled:bg-purple-300 disabled:cursor-not-allowed transition-colors">{log ? 'Update Log' : 'Save Log'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LogModal;