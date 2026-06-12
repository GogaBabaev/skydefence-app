import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';

// Telegram Mini App appends its own params to the URL hash (e.g. #tgWebAppData=...)
// HashRouter would try to use that as a route path → "not found".
// Fix: if hash doesn't start with '/', reset to '#/' (home).
if (!window.location.hash.startsWith('#/')) {
  window.location.hash = '/';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
