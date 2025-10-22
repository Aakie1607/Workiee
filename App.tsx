
import React from 'react';
import { WorkieProvider, useWorkie } from './store/WorkieContext';
import WelcomeScreen from './components/WelcomeScreen';
import Dashboard from './components/Dashboard';

const AppContent: React.FC = () => {
    const { state } = useWorkie();

    return (
        <div className="min-h-screen font-sans text-gray-800">
            {state.currentUser ? <Dashboard /> : <WelcomeScreen />}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <WorkieProvider>
            <AppContent />
        </WorkieProvider>
    );
};

export default App;