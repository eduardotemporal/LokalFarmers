import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // App component will be created later
import './index.css'; // Import Tailwind styles

// Find the root element in your index.html (assuming it has id 'root')
const rootElement = document.getElementById('root');

// Ensure the root element exists before rendering
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element with ID 'root'. Make sure it exists in your index.html.");
}
