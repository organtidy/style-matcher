import { registerSW } from 'virtual:pwa-register';


export const updateSW = registerSW({
  onNeedRefresh() {
    console.log('PWA: Nova versão disponível para atualização. Atualizando automaticamente...');
    // Força a atualização imediatamente sem perguntar ao usuário
    updateSW(true);
  },
  onOfflineReady() {
    console.log('PWA: App pronto para uso offline.');
  },
});

// Periodic background check for updates every 15 minutes
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready
    .then((registration) => {
      // Check on window focus
      window.addEventListener('focus', () => {
        registration.update().catch((e) => console.debug('SW update check on focus:', e));
      });

      // Check periodically
      setInterval(() => {
        registration.update().catch((e) => console.debug('SW periodic update check:', e));
      }, 15 * 60 * 1000);
    })
    .catch((err) => {
      console.debug('Service Worker not ready:', err);
    });
}
