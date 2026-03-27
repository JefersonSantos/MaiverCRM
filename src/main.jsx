import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('Main.jsx: Initializing Root...');
const rootElement = document.getElementById('root');
if (!rootElement) console.error('Main.jsx: Root element not found!');

ReactDOM.createRoot(rootElement).render(
  <App />
);
