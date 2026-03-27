import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('--- SYSTEM BOOT ---');
document.addEventListener('DOMContentLoaded', () => {
  console.log('--- DOM READY ---');
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = '<h1 style="color: white; padding: 20px;">Vercel Boot Success</h1>';
    console.log('--- INJECTED HTML ---');
  } else {
    console.error('--- ROOT NOT FOUND ---');
  }
});

// Try immediate render too
try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <div style={{ color: 'white', padding: '40px', background: 'rgba(255,255,255,0.1)' }}>
      <h1>React Mount Attempt</h1>
      <App />
    </div>
  );
  console.log('--- REACT RENDER CALLED ---');
} catch (e) {
  console.error('--- REACT RENDER FAILED ---', e);
}
