
import React from 'react';
import { WorkLog } from '../types';
import { useWorkie } from '../store/WorkieContext';

interface DeleteConfirmationModalProps {
    log: WorkLog;
    onClose: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ log, onClose }) => {
    const { dispatch } = useWorkie();
    
    const handleDelete = () => {
        dispatch({ type: 'DELETE_LOG', payload: log.id });
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
                <h2 className="text-xl font-bold text-gray-800">Are you sure?</h2>
                <p className="text-gray-600 mt-2">This will permanently delete the log from {log.date}.</p>
                <div className="flex justify-center gap-4 mt-6">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button onClick={handleDelete} className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Delete</button>
                </div>
            </div>
        </div>
    );
}

export default DeleteConfirmationModal;
