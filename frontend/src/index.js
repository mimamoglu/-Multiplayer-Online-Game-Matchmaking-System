import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { GlobalProvider } from "./GlobalState";

// Root öğesini seçiyoruz
const rootElement = document.getElementById('root');

// Root öğesi null kontrolü
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <GlobalProvider><React.StrictMode>
    <App />
  </React.StrictMode></GlobalProvider>
    
  );
} else {
  console.error("Root element not found. Ensure you have a <div id='root'></div> in your index.html.");
}
