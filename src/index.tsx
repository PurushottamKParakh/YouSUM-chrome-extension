import React from 'react';
import ReactDOM from 'react-dom/client'; // Use the new 'react-dom/client' import
import Popup from './popup/Popup';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement); // Ensure 'root' exists in your HTML
root.render(<Popup />);
