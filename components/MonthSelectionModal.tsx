
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { IconClose, IconChevronLeft, IconChevronRight } from './icons';

interface MonthSelectionModalProps {
    onClose: () => void;
    onExport: (year: number, month: number) => Promise<boolean>; // Changed to return Promise<boolean>
}

const MonthSelectionModal: React.FC<MonthSelectionModalProps> = ({ onClose, onExport }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [noLogsFound, setNoLogsFound] = useState<boolean | null>(null); // null: no check yet, true: logs found, false: no logs

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Reset noLogsFound when month or year changes
    const resetNoLogsFound = useCallback(() => {
        setNoLogsFound(null);
    }, []);

    const handlePrevYear = useCallback(() => {
        setCurrentYear(prev => prev - 1);
        resetNoLogsFound();
    }, [resetNoLogsFound]);

    const handleNextYear = useCallback(() => {
        setCurrentYear(prev => prev + 1);
        resetNoLogsFound();
    }, [resetNoLogsFound]);

    const handleMonthSelect = useCallback((monthIndex: number) => {
        setCurrentMonth(monthIndex);
        resetNoLogsFound();
    }, [resetNoLogsFound]);

    const monthNames = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => new Date(currentYear, i, 1).toLocaleString('default', { month: 'short' }));
    }, [currentYear]);

    const handleConfirmExport = async () => {
        const success = await onExport(currentYear, currentMonth);
        if (success) {
            onClose();
        } else {
            setNoLogsFound(false); // Display message: no logs found
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <IconClose className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold text-purple-600 mb-6 text-center">Select Month for Export</h2>

                <div className="flex justify-between items-center mb-4">
                    <button onClick={handlePrevYear} className="p-2 rounded-full hover:bg-gray-100 transition" aria-label="Previous year">
                        <IconChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <span className="font-semibold text-gray-800 text-lg">
                        {currentYear}
                    </span>
                    <button onClick={handleNextYear} className="p-2 rounded-full hover:bg-gray-100 transition" aria-label="Next year">
                        <IconChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-2">
                    {monthNames.map((monthName, index) => {
                        const isSelected = index === currentMonth;
                        return (
                            <button
                                key={index}
                                onClick={() => handleMonthSelect(index)}
                                className={`py-3 px-2 rounded-lg text-center font-medium transition-colors duration-150
                                    ${isSelected ? 'bg-purple-500 text-white shadow-md' : 'text-gray-800 hover:bg-purple-100'}
                                `}
                                aria-selected={isSelected}
                            >
                                {monthName}
                            </button>
                        );
                    })}
                </div>

                {noLogsFound === false && (
                    <p className="text-red-500 text-sm mt-4 text-center p-2 bg-red-50 border border-red-200 rounded-lg">
                        No logs recorded for this month.
                    </p>
                )}

                <div className="flex justify-center gap-4 mt-8">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button type="button" onClick={handleConfirmExport} className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">Export</button>
                </div>
            </div>
        </div>
    );
};

export default MonthSelectionModal;
