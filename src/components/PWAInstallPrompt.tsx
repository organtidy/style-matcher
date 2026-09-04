import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share, PlusSquare, X, Smartphone, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ua = navigator.userAgent;
    const iOSCheck = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(iOSCheck);

    // Listen for beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('PWA: beforeinstallprompt capturado com sucesso!');
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleReopen = () => {
      setShowGuide(false);
      setIsOpen(true);
    };
    window.addEventListener('open-pwa-install', handleReopen);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-pwa-install', handleReopen);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowGuide(true);
      return;
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('PWA escolha do usuário:', outcome);
        if (outcome === 'accepted') {
          setIsOpen(false);
        }
      } catch (err) {
        console.error('Erro ao invocar prompt nativo PWA:', err);
        setShowGuide(true);
      }
    } else {
      // Show browser-specific instructions if deferred prompt not yet ready
      setShowGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => {
          setShowGuide(false);
          setIsOpen(true);
        }}
        className="fixed bottom-20 right-4 z-40 bg-primary/95 hover:bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-full shadow-xl flex items-center gap-1.5 backdrop-blur-md border border-white/20 transition-transform active:scale-95"
        title="Instalar aplicativo"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Baixar App</span>
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal / Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-sm rounded-3xl border border-primary/30 bg-card/95 p-5 shadow-2xl backdrop-blur-xl space-y-4"
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted/50 transition-colors"
            aria-label="Fechar aviso"
          >
            <X className="w-5 h-5" />
          </button>

          {/* App Header */}
          <div className="flex items-center gap-3.5 pr-6">
            <div className="relative shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="Personal Stylist"
                className="rounded-2xl shadow-lg border border-primary/20 object-cover bg-background"
                style={{ width: '52px', height: '52px' }}
              />
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1 rounded-full shadow-sm">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>

            <div>
              <h3 className="font-bold text-foreground text-base leading-snug">
                Personal Stylist
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-primary" />
                {isIOS ? 'Instalar no iPhone / iPad' : 'Baixar como Aplicativo'}
              </p>
            </div>
          </div>

          {/* Benefits */}
          {!showGuide && (
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-3 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Instalação instantânea sem loja de apps</span>
              </div>
              <div className="flex items-center gap-2 text-foreground font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Recebe atualizações automáticas</span>
              </div>
              <div className="flex items-center gap-2 text-foreground font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Acesso rápido e offline</span>
              </div>
            </div>
          )}

          {/* Step-by-step Guide (iOS or Android manual) */}
          {showGuide ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3 pt-1 text-xs border-t border-border/60"
            >
              <p className="font-semibold text-foreground text-center">
                {isIOS ? 'Como instalar no Safari (iOS):' : 'Como instalar no seu navegador:'}
              </p>
              
              {isIOS ? (
                <div className="space-y-2.5 bg-muted/40 p-3 rounded-xl">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      Toque no ícone <strong className="text-foreground">Compartilhar</strong> (<Share className="w-3.5 h-3.5 inline mx-0.5 text-primary" />) na barra do Safari.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      Role para baixo e toque em <strong className="text-foreground">"Adicionar à Tela de Início"</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-primary" />).
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      Toque em <strong className="text-foreground">"Adicionar"</strong> no canto superior direito.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 bg-muted/40 p-3 rounded-xl">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      Toque no menu de três pontos (<strong className="text-foreground">⋮</strong>) no canto superior do navegador.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      Selecione <strong className="text-foreground">"Instalar aplicativo"</strong> ou <strong className="text-foreground">"Adicionar à tela inicial"</strong>.
                    </p>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="w-full text-xs"
              >
                Entendi, fechar aviso
              </Button>
            </motion.div>
          ) : (
            /* Action Buttons */
            <div className="flex flex-col gap-2 pt-1">
              <Button
                onClick={handleInstallClick}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 gap-2 h-11 text-sm rounded-xl"
              >
                {isIOS ? (
                  <>
                    <Share className="w-4 h-4" />
                    <span>Instalar no iPhone / iPad</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Baixar Aplicativo</span>
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="w-full text-xs text-muted-foreground hover:text-foreground h-8"
              >
                Agora não, usar no navegador
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
