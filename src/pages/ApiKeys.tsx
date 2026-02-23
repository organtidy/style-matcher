import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff, ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ApiKeyField {
  id: string;
  label: string;
  description: string;
  placeholder: string;
}

const apiKeyFields: ApiKeyField[] = [
  {
    id: 'google_vision',
    label: 'Google Vision API Key',
    description: 'Usada para analisar suas roupas por IA',
    placeholder: 'AIza...',
  },
  {
    id: 'openweathermap',
    label: 'OpenWeatherMap API Key',
    description: 'Usada para buscar o clima da sua cidade',
    placeholder: 'Sua chave OpenWeatherMap...',
  },
  {
    id: 'gemini',
    label: 'Google Gemini API Key',
    description: 'Usada pelo consultor de moda IA',
    placeholder: 'AIza...',
  },
];

const ApiKeys = () => {
  const navigate = useNavigate();
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  const toggleVisibility = (id: string) => {
    setVisible((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleChange = (id: string, value: string) => {
    setKeys((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    // TODO: Integrar com backend seguro (salvar no banco via edge function)
    toast.info('🔒 Integração segura será implementada em breve!', {
      description: 'As chaves serão salvas de forma criptografada no servidor.',
    });
  };

  return (
    <div className="page-container pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Minhas Chaves</h1>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            ⚠️ Em breve suas chaves serão salvas de forma segura no servidor.
            Por enquanto, esta página é apenas visual.
          </p>
        </div>

        <div className="space-y-5">
          {apiKeyFields.map((field) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <Label htmlFor={field.id} className="text-foreground font-medium">
                {field.label}
              </Label>
              <p className="text-xs text-muted-foreground">{field.description}</p>
              <div className="relative">
                <Input
                  id={field.id}
                  type={visible[field.id] ? 'text' : 'password'}
                  placeholder={field.placeholder}
                  value={keys[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility(field.id)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {visible[field.id] ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <Button onClick={handleSave} className="w-full gap-2">
          <Save className="w-4 h-4" />
          Salvar Chaves
        </Button>
      </motion.div>
    </div>
  );
};

export default ApiKeys;
