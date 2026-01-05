import { useWardrobeStore } from '@/store/wardrobeStore';
import { ClothingCategory } from '@/types/clothing';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt, Filter } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const categoryLabels: Record<ClothingCategory | 'all', string> = {
  all: 'Todos',
  top: 'Camisas',
  bottom: 'Calças',
  shoes: 'Calçados',
  outerwear: 'Casacos',
  accessory: 'Acessórios',
};

export default function Wardrobe() {
  const { clothes } = useWardrobeStore();
  const [filter, setFilter] = useState<ClothingCategory | 'all'>('all');

  const cleanClothes = clothes.filter((c) => c.status === 'clean');
  const filteredClothes =
    filter === 'all'
      ? cleanClothes
      : cleanClothes.filter((c) => c.category === filter);

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <Shirt className="w-5 h-5 text-primary" />
          <h1 className="section-title">Guarda-Roupa</h1>
        </div>

        <p className="text-sm text-muted-foreground">
          {cleanClothes.length} peças disponíveis
        </p>

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
                className="clothing-item"
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
    </div>
  );
}
