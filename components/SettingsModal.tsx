import React, { useState } from 'react';
import { useWorkie } from '../store/WorkieContext';
import { PAY_TYPES } from '../constants';
import { UserSettings } from '../types';
import { IconClose, IconMoney, IconRefresh, IconDelete, IconChevronLeft, IconSave, IconChevronRight } from './icons';

interface SettingsModalProps {
    onClose: () => void;
}

type ModalView = 'main' | 'editPay' | 'changeCurrency' | 'confirmReset' | 'confirmDelete';

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const { state, dispatch } = useWorkie();
    const [view, setView] = useState<ModalView>('main');
    const [settings, setSettings] = useState<UserSettings>(state.settings);

    const handlePayRateChange = (payType: string, value: string) => {
        const newRate = parseFloat(value);
        if (!isNaN(newRate)) {
            setSettings(prev => ({
                ...prev,
                payRates: {
                    ...prev.payRates,
                    [payType]: newRate
                }
            }));
        }
    };

    const handleSavePayRates = () => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: { payRates: settings.payRates } });
        setView('main');
    };

    const handleSaveCurrency = () => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: { currency: settings.currency } });
        setView('main');
    };

    const handleResetAccount = () => {
        dispatch({ type: 'RESET_ACCOUNT' });
        onClose();
    };

    const handleDeleteAccount = () => {
        dispatch({ type: 'DELETE_ACCOUNT' });
        // The context handles logout, and the app will re-render to the WelcomeScreen
        onClose();
    };

    const renderMainView = () => (
        <>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Settings</h2>
            <div className="space-y-3">
                <button onClick={() => setView('editPay')} className="w-full flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                    <div className="flex items-center gap-3">
                        <IconMoney className="w-6 h-6 text-purple-500" />
                        <span className="font-medium text-gray-700">Edit Pay Rates</span>
                    </div>
                    <IconChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button onClick={() => setView('changeCurrency')} className="w-full flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                    <div className="flex items-center gap-3">
                         <span className="font-bold text-xl w-6 text-center text-purple-500">{state.settings.currency}</span>
                        <span className="font-medium text-gray-700">Change Currency</span>
                    </div>
                    <IconChevronRight className="w-5 h-5 text-gray-400" />
                </button>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                 <button onClick={() => setView('confirmReset')} className="w-full flex justify-between items-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition">
                    <div className="flex items-center gap-3">
                        <IconRefresh className="w-6 h-6 text-red-500" />
                        <span className="font-medium text-red-700">Reset Account</span>
                    </div>
                    <IconChevronRight className="w-5 h-5 text-red-400" />
                </button>
                <button onClick={() => setView('confirmDelete')} className="w-full flex justify-between items-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition">
                    <div className="flex items-center gap-3">
                        <IconDelete className="w-6 h-6 text-red-500" />
                        <span className="font-medium text-red-700">Delete Account</span>
                    </div>
                    <IconChevronRight className="w-5 h-5 text-red-400" />
                </button>
            </div>
        </>
    );

    const renderSubView = (title: string, onSave: () => void, children: React.ReactNode) => (
        <>
            <div className="flex items-center mb-6">
                <button onClick={() => setView('main')} className="p-2 rounded-full hover:bg-gray-100">
                    <IconChevronLeft className="w-6 h-6 text-gray-500" />
                </button>
                <h2 className="text-2xl font-bold text-center text-gray-800 flex-grow">{title}</h2>
                 <button onClick={onSave} className="p-2 rounded-full hover:bg-green-100 text-green-500 hover:text-green-600">
                    <IconSave className="w-6 h-6" />
                </button>
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </>
    );

    const renderConfirmationView = (title: string, message: string, onConfirm: () => void) => (
         <>
            <h2 className="text-2xl font-bold text-center text-red-600 mb-4">{title}</h2>
            <p className="text-gray-600 text-center mb-6">{message}</p>
            <div className="flex justify-center gap-4">
                <button onClick={() => setView('main')} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                <button onClick={onConfirm} className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Confirm</button>
            </div>
        </>
    );


    const renderContent = () => {
        switch(view) {
            case 'editPay':
                return renderSubView('Edit Pay Rates', handleSavePayRates, 
                    PAY_TYPES.filter(pt => pt !== 'Custom Pay').map(payType => (
                        <div key={payType}>
                            <label className="block text-sm font-medium text-gray-600 mb-1">{payType} Rate</label>
                            <div className="flex items-center">
                                <span className="p-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg text-gray-500">{settings.currency}</span>
                                <input 
                                    type="number"
                                    value={settings.payRates[payType] || ''}
                                    onChange={(e) => handlePayRateChange(payType, e.target.value)}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                        </div>
                    ))
                );
            case 'changeCurrency':
                 return renderSubView('Change Currency', handleSaveCurrency,
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Currency Symbol</label>
                        <select 
                            value={settings.currency}
                            onChange={(e) => setSettings(prev => ({...prev, currency: e.target.value as UserSettings['currency']}))}
                            className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                        >
                            <option value="£">GBP (£)</option>
                            <option value="$">USD ($)</option>
                            <option value="€">EUR (€)</option>
                        </select>
                    </div>
                );
            case 'confirmReset':
                return renderConfirmationView(
                    'Reset Account?', 
                    'This will delete all your work logs and profile picture. Your user account will remain. This action cannot be undone.', 
                    handleResetAccount
                );
            case 'confirmDelete':
                 return renderConfirmationView(
                    'Delete Account?', 
                    'This will permanently delete your user profile and all associated data. This action cannot be undone.', 
                    handleDeleteAccount
                );
            case 'main':
            default:
                return renderMainView();
        }
    };
    

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <IconClose className="h-6 w-6" />
                </button>
                {renderContent()}
            </div>
        </div>
    );
};

export default SettingsModal;
