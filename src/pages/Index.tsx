import { useEffect } from 'react';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { WeatherWidget } from '@/components/WeatherWidget';
import { DuelMode } from '@/components/DuelMode';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Index = () => {
  const {
    lookA,
    lookB,
    weather,
    initializeLooks,
    removeFromLook,
    confirmLook,
    swapItem,
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
          Arraste peças entre os looks para montar seu visual perfeito
        </p>

        <DuelMode
          lookA={lookA}
          lookB={lookB}
          onRemoveFromA={(id) => removeFromLook('A', id)}
          onRemoveFromB={(id) => removeFromLook('B', id)}
          onConfirmA={() => handleConfirmLook('A')}
          onConfirmB={() => handleConfirmLook('B')}
          onSwapItem={swapItem}
        />
      </motion.div>
    </div>
  );
};

export default Index;
