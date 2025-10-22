import React, { useState } from 'react';
import { useWorkie } from '../store/WorkieContext';

const WelcomeScreen: React.FC = () => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { state, dispatch } = useWorkie();

    const handleLogin = () => {
        const trimmedUsername = username.trim();
        if (trimmedUsername.length >= 3) {
            setError(null);
            dispatch({ type: 'LOGIN', payload: trimmedUsername });
             if (!state.users.includes(trimmedUsername)) {
                dispatch({ type: 'SET_USERS', payload: [...state.users, trimmedUsername] });
            }
        } else {
            setError('Name must be at least 3 characters long.');
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
        if (error) {
            setError(null);
        }
    };

    const selectUser = (user: string) => {
        setUsername(user);
        setError(null);
        dispatch({ type: 'LOGIN', payload: user });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <img src="https://res.cloudinary.com/dt2cxv6zw/image/upload/c_crop,w_320,h_180,ar_16:9/v1759421648/workie__1_-removebg-preview_uynvtc.png" alt="Workie Logo" className="w-full max-w-xs mb-8" />
            <div className="w-full max-w-md p-8 space-y-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg animate-fade-in-scale">
                <style>{`
                    @keyframes fade-in-scale {
                        from { opacity: 0; transform: scale(0.98); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-fade-in-scale {
                        animation: fade-in-scale 0.5s ease-out forwards;
                    }
                    .animate-fade-in-up-1 { animation: fade-in-scale 0.5s ease-out 0.1s forwards; opacity: 0; }
                    .animate-fade-in-up-2 { animation: fade-in-scale 0.5s ease-out 0.2s forwards; opacity: 0; }
                    .animate-fade-in-up-3 { animation: fade-in-scale 0.5s ease-out 0.3s forwards; opacity: 0; }
                `}</style>
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">Welcome to Workie</h1>
                    <p className="mt-2 text-gray-600 text-lg">Your friendly work hours calculator.</p>
                </div>

                <div className="space-y-4">
                    <div className="animate-fade-in-up-1">
                        <input
                            type="text"
                            value={username}
                            onChange={handleInputChange}
                            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                            placeholder="Enter your name"
                            className={`w-full px-4 py-3 text-lg bg-white text-gray-800 rounded-xl border-2 focus:ring-2 focus:outline-none transition placeholder:text-gray-500 ${error ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-gray-300 focus:ring-purple-200 focus:border-purple-400'}`}
                        />
                         {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
                    </div>
                    <button
                        onClick={handleLogin}
                        className="w-full px-4 py-3 text-lg font-semibold text-purple-900 bg-purple-300 rounded-xl hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 transition duration-200 animate-fade-in-up-2"
                    >
                        Continue
                    </button>
                </div>

                {state.users.length > 0 && (
                    <div className="pt-4 border-t border-gray-200 animate-fade-in-up-3">
                        <h3 className="text-sm font-medium text-center text-gray-500">Or select a previous user:</h3>
                        <div className="mt-3 flex flex-wrap justify-center gap-2">
                            {state.users.map(user => (
                                <button
                                    key={user}
                                    onClick={() => selectUser(user)}
                                    className="px-4 py-1.5 text-purple-700 bg-purple-100 rounded-full hover:bg-purple-200 transition"
                                >
                                    {user}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WelcomeScreen;