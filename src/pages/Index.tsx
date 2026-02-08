import { useEffect, useState } from 'react';
import { useWardrobeStore, LookId } from '@/store/wardrobeStore';
import { WeatherWidget } from '@/components/WeatherWidget';
import { DuelMode } from '@/components/DuelMode';
import { OccasionSelector } from '@/components/OccasionSelector';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWeather } from '@/hooks/useWeather';
import { ClothingOccasion } from '@/types/clothing';

const Index = () => {
  const {
    lookA,
    lookB,
    lookC,
    lookD,
    visibleLooks,
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
  } = useWardrobeStore();

  const { weather, location, loading: weatherLoading, error: weatherError, refresh: refreshWeather } = useWeather();
  const [selectedOccasion, setSelectedOccasion] = useState<ClothingOccasion | null>('trabalho');

  useEffect(() => {
    initializeLooks();
  }, [initializeLooks]);

  const handleConfirmLook = (lookId: LookId) => {
    confirmLook(lookId);
    toast.success(`Look ${lookId} confirmado! Peças movidas para lavanderia.`, {
      icon: '👔',
    });
  };

  const handleRefresh = () => {
    initializeLooks();
    toast.success('Novos looks gerados!', { icon: '✨' });
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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="section-title">
              {selectedOccasion 
                ? `Looks — ${selectedOccasion.charAt(0).toUpperCase() + selectedOccasion.slice(1)}`
                : 'Sugestões de Hoje'
              }
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="text-muted-foreground hover:text-primary"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Arraste peças entre os looks ou toque nos slots para adicionar
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
