import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './style.css';

const app = document.querySelector('#app');
if (!app) throw new Error('No app element found');
const strict = JSON.parse(app.getAttribute('data-strict') || 'false');

createRoot(document.querySelector('#app')!).render(
  strict ? <StrictMode><App/></StrictMode> : <App/>,
);
