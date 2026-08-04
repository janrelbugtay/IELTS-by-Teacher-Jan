import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "100436990047-iqjgukeqju6hjl7n5cakiphul5cn3j1s.apps.googleusercontent.com"}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
