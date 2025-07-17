// src/App.tsx

import React from 'react';
import ChatWidget from './ChatWidget';

// We can import the type of defaultConfig directly from main.tsx for consistency
import { defaultConfig } from './main.tsx';

// Define the interface for the props of your App component
// It now expects a 'config' prop that has the same shape as defaultConfig
interface AppProps {
    config: typeof defaultConfig;
}

// App component now receives the final configuration as a prop
const App: React.FC<AppProps> = ({ config }) => {
    // App's role is simply to pass the configuration down to ChatWidget
    return (
        <ChatWidget
            n8nWebhookUrl={config.n8nWebhookUrl}
            theme={config.theme}
            clientId={config.clientId}
        />
    );
};

export default App;