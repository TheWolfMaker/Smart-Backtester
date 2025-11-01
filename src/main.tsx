import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = '/sw.js';
    
    navigator.serviceWorker.register(swUrl)
      .then((registration) => {
        console.log('✅ Service Worker registrado correctamente:', registration);
        
        // Verificar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 Nueva versión del Service Worker encontrada');
          
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('📦 Nueva versión lista para instalar');
              // Podrías mostrar un banner de actualización aquí
            }
          });
        });
      })
      .catch((error) => {
        console.error('❌ Error registrando Service Worker:', error);
      });
  });

  // Manejar actualizaciones
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      console.log('🔄 Controller changed - recargando página');
      window.location.reload();
    }
  });
}

// Verificar si la app está en modo standalone (instalada)
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('📱 App ejecutándose en modo PWA instalada');
  document.body.classList.add('pwa-mode');
}

createRoot(document.getElementById("root")!).render(<App />);.