

import React from 'react';
import { WorkLog } from '../types';
import { IconEdit, IconDelete } from './icons';
import { useWorkie } from '../store/WorkieContext';

interface WorkLogTableProps {
    logs: WorkLog[];
    onEdit: (log: WorkLog) => void;
    onDelete: (log: WorkLog) => void;
}

// Helper for styling work type tags
const getWorkTypeStyle = (workType: string): string => {
    switch (workType) {
        case 'SA': return 'bg-purple-100 text-purple-800';
        case 'UKSR': return 'bg-blue-100 text-blue-800';
        case 'EC': return 'bg-green-100 text-green-800';
        case 'Custom': return 'bg-gray-100 text-gray-800';
        default: return 'bg-yellow-100 text-yellow-800';
    }
};

// Helper for formatting date
const formatDateParts = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00'); // Use T00:00:00 to avoid timezone issues affecting the date
    return {
        day: date.toLocaleDateString('en-GB', { weekday: 'short' }),
        date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    };
};


const WorkLogTable: React.FC<WorkLogTableProps> = ({ logs, onEdit, onDelete }) => {
    const { state } = useWorkie();

    if (logs.length === 0) {
        return (
            <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md flex flex-col items-center justify-center">
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <p className="text-gray-700 font-semibold text-lg">No logs for this week</p>
                <p className="text-gray-500 mt-1">Add a log to get started!</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-3">
            {logs.map(log => {
                const { day, date } = formatDateParts(log.date);
                const workTypeLabel = log.workType === 'Custom' ? log.customWorkType : log.workType;

                return (
                    <div key={log.id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 transition-transform hover:scale-[1.01] duration-200 ease-in-out">
                        
                        <div className="flex-shrink-0 flex sm:flex-col items-center justify-center w-full sm:w-20 text-center bg-purple-50 rounded-xl p-2">
                            <span className="font-bold text-purple-600 text-lg sm:text-base mr-2 sm:mr-0">{day}</span>
                            <span className="text-gray-600 text-sm">{date}</span>
                        </div>

                        <div className="hidden sm:block w-px bg-gray-200 self-stretch mx-2"></div>

                        <div className="flex-grow">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getWorkTypeStyle(log.workType)}`}>
                                {workTypeLabel}
                            </span>
                            <p className="text-base text-gray-800 mt-2 font-medium">{log.startTime} - {log.endTime}</p>
                            <p className="text-sm text-gray-500">{log.hoursWorked.toFixed(2)} hrs worked</p>
                            {log.notes && <p className="text-sm text-gray-500 mt-1 italic truncate">"{log.notes}"</p>}
                        </div>
                        
                        <div className="flex-shrink-0 text-left sm:text-right mt-2 sm:mt-0">
                             <p className="font-bold text-xl text-purple-800">{state.settings.currency}{log.pay.toFixed(2)}</p>
                             <div className="flex items-center gap-2 mt-2 justify-start sm:justify-end">
                                 <button onClick={() => onEdit(log)} aria-label="Edit log" className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-100 transition-colors">
                                     <IconEdit className="h-5 w-5" />
                                 </button>
                                 <button onClick={() => onDelete(log)} aria-label="Delete log" className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors">
                                     <IconDelete className="h-5 w-5" />
                                 </button>
                             </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default WorkLogTable;
