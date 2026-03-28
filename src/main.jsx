import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('!!! REAL APP IMPORTED !!!');

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    ReactDOM.createRoot(rootElement).render(<App />);
    console.log('!!! REAL APP RENDER CALLED !!!');
  } catch (err) {
    console.error('!!! REAL APP RENDER FAILED !!!', err);
    rootElement.innerHTML = `<h1 style="color: red;">RENDER ERROR: ${err.message}</h1>`;
  }
}
