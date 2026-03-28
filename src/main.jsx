import React from 'react'
import ReactDOM from 'react-dom/client'

console.log('!!! REACT LOADED !!!');

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <h1 style={{ color: 'white', padding: '20px' }}>REACT MOUNT SUCCESS</h1>
  );
  console.log('!!! REACT RENDER CALLED !!!');
} else {
  console.error('!!! ROOT NOT FOUND !!!');
}
