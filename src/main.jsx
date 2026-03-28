import React from 'react'
import ReactDOM from 'react-dom/client'

const SimpleApp = () => (
  <div style={{ color: 'white', padding: '40px', background: 'rgba(255,255,255,0.1)' }}>
    <h1>APP COMPONENT SUCCESS</h1>
    <p>If you see this, the basic App structure is working on Vercel.</p>
  </div>
);

console.log('!!! REACT + SIMPLE APP LOADED !!!');

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<SimpleApp />);
  console.log('!!! RENDER SUCCESSFUL !!!');
}
