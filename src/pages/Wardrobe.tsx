import { useWardrobeStore } from '@/store/wardrobeStore';
import { ClothingCategory, ClothingItem } from '@/types/clothing';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt, Filter, Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const categoryLabels: Record<ClothingCategory | 'all', string> = {
  all: 'Todos',
  top: 'Camisas',
  bottom: 'Calças',
  shoes: 'Calçados',
  outerwear: 'Casacos',
  accessory: 'Acessórios',
};

export default function Wardrobe() {
  const { user } = useAuth();
  const { clothes, removeClothing, clearAllClothes, loadUserClothes, loadingClothes } = useWardrobeStore();
  const [filter, setFilter] = useState<ClothingCategory | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (user?.id && clothes.length === 0) {
      loadUserClothes(user.id);
    }
  }, [user?.id, clothes.length, loadUserClothes]);

  const cleanClothes = clothes.filter((c) => c.status === 'clean');
  const filteredClothes =
    filter === 'all'
      ? cleanClothes
      : cleanClothes.filter((c) => c.category === filter);

  const handleDelete = async (item: ClothingItem) => {
    await removeClothing(item.id, user?.id);
    setSelectedItem(null);
    toast.success('Peça removida do guarda-roupa e do banco!', { icon: '🗑️' });
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      await clearAllClothes(user?.id);
      setClearDialogOpen(false);
      toast.success('Guarda-roupa zerado com sucesso!', { icon: '🗑️' });
    } catch (err) {
      console.error('Error clearing wardrobe:', err);
      toast.error('Erro ao zerar guarda-roupa.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shirt className="w-5 h-5 text-primary" />
            <h1 className="section-title">Guarda-Roupa</h1>
          </div>
          {clothes.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearDialogOpen(true)}
              className="text-xs h-8 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Zerar Tudo
            </Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          {cleanClothes.length} peças disponíveis
        </p>

        {/* Notice for unlogged visitors */}
        {!user && (
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
            <span className="text-lg">💡</span>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide">
                Modo Visitante (Não logado)
              </p>
              <p className="text-xs text-foreground/90 leading-relaxed">
                As peças desta sessão não são salvas no banco de dados.{' '}
                <a href="/auth" className="underline font-medium text-amber-500 hover:text-amber-400">
                  Crie sua conta ou faça login
                </a>{' '}
                para salvar seu guarda-roupa permanentemente na nuvem.
              </p>
            </div>
          </div>
        )}

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {(Object.keys(categoryLabels) as (ClothingCategory | 'all')[]).map(
            (cat) => (
              <Button
                key={cat}
                variant={filter === cat ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setFilter(cat)}
                className={`shrink-0 rounded-full ${
                  filter === cat ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                {categoryLabels[cat]}
              </Button>
            )
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredClothes.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="clothing-item cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <img
                  src={item.image_url}
                  alt={item.description}
                  className="clothing-item-image"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <span className="text-xs text-white/90 line-clamp-1">
                    {item.description}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredClothes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <Filter className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              Nenhuma peça encontrada nesta categoria
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Image Expand Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-4">
          {selectedItem && (
            <>
              <motion.img
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                src={selectedItem.image_url}
                alt={selectedItem.description}
                className="max-w-full max-h-[70vh] rounded-2xl object-contain shadow-2xl"
              />
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-white font-medium drop-shadow-md">
                  {selectedItem.description}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedItem)}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir peça
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Clearing All Clothes */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl bg-card border-border/80 p-6 space-y-4">
          <div className="flex items-center gap-3 text-destructive">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Zerar Guarda-Roupa?</h3>
              <p className="text-xs text-muted-foreground">Esta ação não pode ser desfeita.</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Todas as {clothes.length} peças serão apagadas permanentemente{user ? ' do seu banco de dados no Supabase' : ' desta sessão'}.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearDialogOpen(false)}
              disabled={isClearing}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
              disabled={isClearing}
              className="text-xs gap-1.5"
            >
              {isClearing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Apagando...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sim, apagar tudo</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
