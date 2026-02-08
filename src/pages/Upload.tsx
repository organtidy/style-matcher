import { useState, useRef } from 'react';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { ClothingCategory, AccessorySubCategory, ClothingItem, ClothingOccasion } from '@/types/clothing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Camera, Upload as UploadIcon, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { OccasionSelector } from '@/components/OccasionSelector';

const categories: { value: ClothingCategory; label: string }[] = [
  { value: 'top', label: 'Parte de Cima' },
  { value: 'bottom', label: 'Parte de Baixo' },
  { value: 'shoes', label: 'Calçados' },
  { value: 'outerwear', label: 'Casacos/Jaquetas' },
  { value: 'accessory', label: 'Acessórios' },
];

const accessorySubCategories: { value: AccessorySubCategory; label: string }[] = [
  { value: 'bone', label: 'Boné' },
  { value: 'brinco', label: 'Brinco' },
  { value: 'pulseira', label: 'Pulseira' },
  { value: 'relogio', label: 'Relógio' },
  { value: 'oculos', label: 'Óculos' },
  { value: 'colar', label: 'Colar' },
  { value: 'outro', label: 'Outro' },
];

const warmthLevels = [
  { value: 1, label: 'Muito Leve (Verão)' },
  { value: 2, label: 'Leve' },
  { value: 3, label: 'Médio' },
  { value: 4, label: 'Quente' },
  { value: 5, label: 'Muito Quente (Inverno)' },
];

export default function UploadPage() {
  const { addClothing } = useWardrobeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [category, setCategory] = useState<ClothingCategory | ''>('');
  const [subCategory, setSubCategory] = useState<AccessorySubCategory | ''>('');
  const [description, setDescription] = useState('');
  const [warmthLevel, setWarmthLevel] = useState<number>(2);
  const [styleTags, setStyleTags] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [occasion, setOccasion] = useState<ClothingOccasion | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        // Mock AI analysis
        mockAIAnalysis();
      };
      reader.readAsDataURL(file);
    }
  };

  const mockAIAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setCategory('top');
      setDescription('Camiseta identificada por IA');
      setStyleTags('casual, urbano');
      setWarmthLevel(2);
      setIsAnalyzing(false);
      toast.success('IA identificou a peça!', { icon: '🤖' });
    }, 1500);
  };

  const handleSubmit = () => {
    if (!imagePreview || !category) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const newItem: ClothingItem = {
      id: Date.now().toString(),
      image_url: imagePreview,
      description,
      warmth_level: warmthLevel,
      style_tags: styleTags.split(',').map(t => t.trim()).filter(Boolean),
      last_worn: null,
      category: category as ClothingCategory,
      sub_category: category === 'accessory' ? (subCategory as AccessorySubCategory) : undefined,
      occasion: occasion ?? undefined,
      status: 'clean',
      created_at: new Date().toISOString(),
    };

    addClothing(newItem);
    toast.success('Peça adicionada ao guarda-roupa!', { icon: '👕' });
    
    // Reset form
    setImagePreview(null);
    setCategory('');
    setSubCategory('');
    setDescription('');
    setWarmthLevel(2);
    setStyleTags('');
    setOccasion(null);
  };

  const clearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-2">
          <UploadIcon className="w-5 h-5 text-primary" />
          <h1 className="section-title">Adicionar Peça</h1>
        </div>

        {/* Image Upload Area */}
        <div className="relative">
          {imagePreview ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square rounded-2xl overflow-hidden glass-card"
            >
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={clearImage}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-destructive/90 backdrop-blur-sm flex items-center justify-center"
              >
                <X className="w-4 h-4 text-destructive-foreground" />
              </button>
              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                    <span className="text-sm text-muted-foreground">Analisando com IA...</span>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer glass-card">
              <Camera className="w-12 h-12 text-muted-foreground mb-2" />
              <span className="text-muted-foreground text-sm">Toque para fotografar</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Occasion Selector */}
        <OccasionSelector
          selected={occasion}
          onSelect={setOccasion}
          title="Ocasiões"
        />
        <p className="text-xs text-muted-foreground -mt-1">
          {occasion ? `Peça será categorizada como "${occasion}"` : 'Sem seleção — a IA categorizará automaticamente'}
        </p>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Categoria *</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ClothingCategory)}>
              <SelectTrigger className="glass-card border-border/50">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {category === 'accessory' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <Label>Tipo de Acessório</Label>
              <Select value={subCategory} onValueChange={(v) => setSubCategory(v as AccessorySubCategory)}>
                <SelectTrigger className="glass-card border-border/50">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {accessorySubCategories.map((sub) => (
                    <SelectItem key={sub.value} value={sub.value}>
                      {sub.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          )}

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Camiseta preta com estampa"
              className="glass-card border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label>Nível de Aquecimento</Label>
            <Select
              value={warmthLevel.toString()}
              onValueChange={(v) => setWarmthLevel(parseInt(v))}
            >
              <SelectTrigger className="glass-card border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {warmthLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value.toString()}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tags de Estilo</Label>
            <Input
              value={styleTags}
              onChange={(e) => setStyleTags(e.target.value)}
              placeholder="casual, urbano, elegante (separado por vírgula)"
              className="glass-card border-border/50"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full bg-primary hover:bg-primary/90"
            disabled={!imagePreview || !category}
          >
            <UploadIcon className="w-4 h-4 mr-2" />
            Adicionar ao Guarda-Roupa
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
