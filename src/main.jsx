import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './tokens.css';
import { Website } from './components/website.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Website />
  </StrictMode>
);
