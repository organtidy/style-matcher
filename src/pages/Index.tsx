import { useEffect } from 'react';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { WeatherWidget } from '@/components/WeatherWidget';
import { DuelMode } from '@/components/DuelMode';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

const Index = () => {
  const {
    lookA,
    lookB,
    weather,
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
  } = useWardrobeStore();

  useEffect(() => {
    initializeLooks();
  }, [initializeLooks]);

  const handleConfirmLook = (lookId: 'A' | 'B') => {
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

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <WeatherWidget weather={weather} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="section-title">Sugestões de Hoje</h2>
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
          lookA={lookA}
          lookB={lookB}
          onRemoveFromA={(id) => removeFromLook('A', id)}
          onRemoveFromB={(id) => removeFromLook('B', id)}
          onAddToA={(slotType) => openWardrobePicker('A', slotType)}
          onAddToB={(slotType) => openWardrobePicker('B', slotType)}
          onConfirmA={() => handleConfirmLook('A')}
          onConfirmB={() => handleConfirmLook('B')}
          onSwapItem={swapItem}
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
