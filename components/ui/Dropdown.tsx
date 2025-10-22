
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { IconChevronDown } from '../icons'; 

interface DropdownOption {
    value: string;
    label: string;
}

interface DropdownProps {
    label: string;
    name: string;
    options: DropdownOption[];
    value: string;
    onChange: (name: string, value: string) => void;
    placeholder?: string;
    error?: string;
    className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
    label,
    name,
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    error,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOptionLabel = options.find(option => option.value === value)?.label || placeholder;

    const handleSelect = useCallback((optionValue: string) => {
        onChange(name, optionValue);
        setIsOpen(false);
    }, [name, onChange]);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);
    
    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex justify-between items-center w-full p-3 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-purple-400'} ${value === '' ? 'text-gray-500' : 'text-gray-800'}`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span>{selectedOptionLabel}</span>
                <IconChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            
            {isOpen && (
                <ul
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto animate-slide-down-fade"
                    role="listbox"
                    tabIndex={-1}
                >
                    {options.map((option) => (
                        <li
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`p-3 cursor-pointer hover:bg-purple-50 text-gray-800 ${option.value === value ? 'bg-purple-100 font-semibold' : ''}`}
                            role="option"
                            aria-selected={option.value === value}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
            <style jsx>{`
                .animate-slide-down-fade {
                    animation: slideDownFade 0.2s ease-out forwards;
                }
                @keyframes slideDownFade {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default Dropdown;
    