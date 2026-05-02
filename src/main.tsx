import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('Starting React app...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = createRoot(rootElement);
  root.render(<App />);

  console.log('React app rendered successfully');
} catch (error) {
  console.error('Failed to render React app:', error);
  // Fallback: show error message
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; background: #f5f5f0; color: #5A5A40;">
        <h1 style="color: #ef4444; margin-bottom: 20px;">Application Error</h1>
        <p style="text-align: center; max-width: 600px; margin-bottom: 20px;">
          The application failed to load. Please try refreshing the page or clearing your browser cache.
        </p>
        <button onclick="window.location.reload()" style="background: #5A5A40; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
          Refresh Page
        </button>
        <details style="margin-top: 20px; text-align: left;">
          <summary style="cursor: pointer; margin-bottom: 10px;">Technical Details</summary>
          <pre style="background: #f9f9f9; padding: 10px; border-radius: 5px; font-size: 12px; overflow: auto; max-width: 600px;">${error instanceof Error ? error.message : String(error)}</pre>
        </details>
      </div>
    `;
  }
}
