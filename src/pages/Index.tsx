import { useEffect, useState } from 'react';
import { useWardrobeStore, LookId } from '@/store/wardrobeStore';
import { WeatherWidget } from '@/components/WeatherWidget';
import { DuelMode } from '@/components/DuelMode';
import { OccasionSelector } from '@/components/OccasionSelector';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, MapPin, Loader2, Wine, PlusCircle, Shirt, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWeather } from '@/hooks/useWeather';
import { useAuth } from '@/hooks/useAuth';
import { ClothingOccasion } from '@/types/clothing';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const {
    clothes,
    lookA,
    lookB,
    lookC,
    lookD,
    visibleLooks,
    loadUserClothes,
    loadingClothes,
    aiConsultantLoading,
    generateAILooks,
    aiTip,
    wineSuggestion,
    initializeLooks,
    removeFromLook,
    confirmLook,
    swapItem,
    openWardrobePicker,
    closeWardrobePicker,
    wardrobePickerOpen,
    wardrobePickerLook,
    wardrobePickerSlot,
    getAvailableItemsForSlot,
    addToLook,
    addLook,
    removeLook,
    regenerateLook,
  } = useWardrobeStore();

  const { weather, location, loading: weatherLoading, error: weatherError, refresh: refreshWeather } = useWeather();
  const [selectedOccasion, setSelectedOccasion] = useState<ClothingOccasion | null>('trabalho');

  useEffect(() => {
    if (user?.id) {
      loadUserClothes(user.id);
    }
  }, [user?.id, loadUserClothes]);

  const handleConfirmLook = (lookId: LookId) => {
    confirmLook(lookId);
    toast.success(`Look ${lookId} confirmado! Peças movidas para lavanderia.`, {
      icon: '👔',
    });
  };

  const handleRefreshRandom = () => {
    if (clothes.length === 0) {
      toast.info('Adicione roupas primeiro para gerar combinações!');
      return;
    }
    initializeLooks();
    toast.success('Looks recombinados!', { icon: '🎲' });
  };

  const handleGenerateAI = async () => {
    if (clothes.length === 0) {
      toast.info('Seu guarda-roupa está vazio. Adicione suas peças primeiro!', { icon: '📸' });
      navigate('/upload');
      return;
    }

    try {
      await generateAILooks(weather, selectedOccasion || 'casual');
      toast.success('Consultor IA estilizou seus looks!', { icon: '✨' });
    } catch (err: any) {
      toast.error(err.message || 'Erro ao consultar a IA.');
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.info('Você saiu da sua conta.');
  };

  const availableItems = wardrobePickerSlot && wardrobePickerLook 
    ? getAvailableItemsForSlot(wardrobePickerSlot, wardrobePickerLook)
    : [];

  const slotLabels: Record<string, string> = {
    'head': 'Boné / Óculos',
    'top': 'Camisa / Casaco',
    'bottom': 'Calça / Bermuda',
    'shoes': 'Calçado',
    'accessory-left': 'Pulseira / Relógio',
    'accessory-right': 'Brinco / Colar / Jóias',
  };

  // Build looks array for DuelMode
  const looks = [
    { id: 'A' as LookId, items: lookA },
    { id: 'B' as LookId, items: lookB },
    ...(visibleLooks.includes('C') ? [{ id: 'C' as LookId, items: lookC }] : []),
    ...(visibleLooks.includes('D') ? [{ id: 'D' as LookId, items: lookD }] : []),
  ];

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* User Account / Plan Status / Guest Notice Bar */}
        <div className="flex items-center justify-between gap-2 mb-1">
          {user ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {user.email}
              </span>
              <div className="flex items-center gap-2">
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                  profile?.plan_type === 'ultra' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                  profile?.plan_type === 'pro' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                  'bg-muted text-muted-foreground border-border'
                }`}>
                  {profile?.plan_type === 'ultra' && <Sparkles className="w-3 h-3" />}
                  PLANO {profile?.plan_type?.toUpperCase() || 'FREE'}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  title="Sair da conta"
                  onClick={handleLogout}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-amber-500 flex items-center gap-1.5">
                <span>💡</span> Modo Visitante
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/auth')}
                className="text-xs h-7 px-3 border-amber-500/40 text-amber-500 hover:bg-amber-500/10 gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                Entrar / Cadastrar
              </Button>
            </div>
          )}
        </div>

        {/* Guest explanatory card when not logged in */}
        {!user && (
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-2.5">
            <span className="text-base shrink-0">👕</span>
            <p className="text-xs text-foreground/90 leading-relaxed">
              Você pode fazer upload de roupas e testar combinações nesta sessão. Para ter suas peças <strong className="text-amber-500">salvas no banco de dados</strong>, acesse sua conta.
            </p>
          </div>
        )}
        {weatherLoading ? (
          <div className="weather-widget weather-gradient flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-muted-foreground text-sm">Buscando clima...</span>
          </div>
        ) : weather ? (
          <div className="relative">
            <WeatherWidget weather={weather} />
            {location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="w-3 h-3" />
                <span>{location}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 ml-1"
                  onClick={refreshWeather}
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        ) : weatherError ? (
          <div className="weather-widget weather-gradient">
            <span className="text-sm text-destructive">{weatherError}</span>
            <Button variant="ghost" size="sm" onClick={refreshWeather}>
              Tentar novamente
            </Button>
          </div>
        ) : null}

        {/* Occasion Filter */}
        <OccasionSelector
          selected={selectedOccasion}
          onSelect={setSelectedOccasion}
          title="Ocasiões"
        />

        {/* AI Action Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="section-title">
              {selectedOccasion 
                ? `Looks — ${selectedOccasion.charAt(0).toUpperCase() + selectedOccasion.slice(1)}`
                : 'Sugestões de Hoje'
              }
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleGenerateAI}
              disabled={aiConsultantLoading || loadingClothes}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md gap-1.5 flex-1 sm:flex-initial"
            >
              {aiConsultantLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Consultando IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Consultor IA</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleRefreshRandom}
              title="Recombinar aleatório"
              className="shrink-0 border-border/60 hover:text-primary"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* AI Tips Banner */}
        {aiTip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3"
          >
            <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">Dica do Consultor IA</p>
              <p className="text-xs text-foreground/90 leading-relaxed">{aiTip}</p>
            </div>
          </motion.div>
        )}

        {/* Wine Recommendation Banner */}
        {wineSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3"
          >
            <Wine className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide">
                Harmonização de Vinho: {wineSuggestion.name} ({wineSuggestion.vintage})
              </p>
              <p className="text-xs text-foreground/90 leading-relaxed">{wineSuggestion.reason}</p>
            </div>
          </motion.div>
        )}

        {/* Empty Wardrobe Notification Banner */}
        {!loadingClothes && clothes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-dashed border-primary/40 p-4 text-center space-y-2 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <Shirt className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-semibold text-foreground">Monte seu guarda-roupa virtual</h3>
                <p className="text-[11px] text-muted-foreground">
                  Toque nos slots do manequim 3D abaixo ou adicione novas fotos de roupas.
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/upload')}
              size="sm"
              className="gap-2 bg-primary hover:bg-primary/90 text-xs shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Adicionar Peça
            </Button>
          </motion.div>
        )}

        <p className="text-xs text-muted-foreground">
          Arraste peças entre os looks ou toque nos slots do manequim 3D para personalizar seu visual
        </p>

        <DuelMode
          looks={looks}
          visibleLooks={visibleLooks}
          onRemoveFromLook={removeFromLook}
          onAddToLook={openWardrobePicker}
          onConfirmLook={handleConfirmLook}
          onSwapItem={swapItem}
          onAddLook={addLook}
          onRemoveLook={removeLook}
          onRegenerateLook={regenerateLook}
        />

      </motion.div>

      {/* Wardrobe Picker Sheet */}
      <Sheet open={wardrobePickerOpen} onOpenChange={(open) => !open && closeWardrobePicker()}>
        <SheetContent side="bottom" className="h-[60vh]">
          <SheetHeader>
            <SheetTitle>
              Escolher {wardrobePickerSlot ? slotLabels[wardrobePickerSlot] : 'Peça'}
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-full mt-4 pb-8">
            {availableItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma peça disponível para este slot
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3 pb-8">
                {availableItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => wardrobePickerLook && addToLook(wardrobePickerLook, item)}
                    className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={item.image_url}
                      alt={item.description}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;
