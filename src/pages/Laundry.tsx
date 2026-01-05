import { useWardrobeStore } from '@/store/wardrobeStore';
import { LaundryItem } from '@/components/LaundryItem';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Laundry() {
  const {
    clothes,
    selectedLaundryItems,
    toggleLaundrySelection,
    moveToClean,
    getDirtyClothes,
  } = useWardrobeStore();

  const dirtyClothes = getDirtyClothes();
  const hasSelection = selectedLaundryItems.length > 0;

  const handleWash = () => {
    moveToClean(selectedLaundryItems);
    toast.success(`${selectedLaundryItems.length} peça(s) lavada(s)!`, {
      icon: '🧺',
    });
  };

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-primary" />
          <h1 className="section-title">Lavanderia</h1>
        </div>

        <p className="text-sm text-muted-foreground">
          {dirtyClothes.length > 0
            ? 'Selecione as peças que você lavou'
            : 'Nenhuma roupa para lavar! 🎉'}
        </p>

        <div className="grid grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {dirtyClothes.map((item) => (
              <LaundryItem
                key={item.id}
                item={item}
                isSelected={selectedLaundryItems.includes(item.id)}
                onToggle={() => toggleLaundrySelection(item.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {dirtyClothes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <Sparkles className="w-16 h-16 text-primary/30 mb-4" />
            <p className="text-muted-foreground">Todas as roupas estão limpas!</p>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {hasSelection && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fab animate-pulse-glow"
            style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <Button
              onClick={handleWash}
              className="w-full h-full rounded-full bg-transparent hover:bg-transparent p-0"
            >
              <div className="flex flex-col items-center">
                <Droplets className="w-5 h-5" />
                <span className="text-[10px]">{selectedLaundryItems.length}</span>
              </div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
