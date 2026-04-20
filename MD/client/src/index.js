import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import SplashScreen from './SplashScreen';

function Root() {
  // In development, server is already up (started by concurrently), skip splash
  const isDev = process.env.NODE_ENV === 'development';
  const [ready, setReady] = useState(isDev);

  if (!ready) {
    return <SplashScreen onReady={() => setReady(true)} />;
  }

  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);