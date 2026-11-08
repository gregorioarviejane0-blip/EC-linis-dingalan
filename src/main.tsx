import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'leaflet/dist/leaflet.css';
import { registerSW } from 'virtual:pwa-register';

// Auto-register PWA service worker for offline attendance and mobile app installation
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Linis Dingalan: New PWA update ready.');
  },
  onOfflineReady() {
    console.log('Linis Dingalan: App is cached and ready for offline field work.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
