import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff, ArrowLeft, Save, Loader2, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ApiKeyField {
  id: string;
  label: string;
  description: string;
  placeholder: string;
}

const apiKeyFields: ApiKeyField[] = [
  {
    id: 'google_vision',
    label: 'Google Vision / Gemini API Key',
    description: 'Usada para analisar suas roupas e consultor de moda IA',
    placeholder: 'AIza...',
  },
  {
    id: 'openweathermap',
    label: 'OpenWeatherMap API Key',
    description: 'Usada para buscar o clima da sua cidade',
    placeholder: 'Sua chave OpenWeatherMap...',
  },
];

interface SavedKey {
  key_name: string;
  key_preview: string;
  updated_at: string;
}

const ApiKeys = () => {
  const navigate = useNavigate();
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [savedKeys, setSavedKeys] = useState<Record<string, SavedKey>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Faça login para gerenciar suas chaves');
        return;
      }

      const { data, error } = await supabase.functions.invoke('manage-api-keys', {
        method: 'GET',
      });

      if (error) throw error;

      const keysMap: Record<string, SavedKey> = {};
      (data?.keys || []).forEach((k: SavedKey) => {
        keysMap[k.key_name] = k;
      });
      setSavedKeys(keysMap);
    } catch (err) {
      console.error('Error fetching keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = (id: string) => {
    setVisible((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleChange = (id: string, value: string) => {
    setKeys((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (keyName: string) => {
    const value = keys[keyName];
    if (!value?.trim()) {
      toast.error('Digite a chave antes de salvar');
      return;
    }

    setSaving((prev) => ({ ...prev, [keyName]: true }));
    try {
      const { error } = await supabase.functions.invoke('manage-api-keys', {
        method: 'POST',
        body: { key_name: keyName, key_value: value.trim() },
      });

      if (error) throw error;

      toast.success('Chave salva com segurança! 🔒');
      setKeys((prev) => ({ ...prev, [keyName]: '' }));
      await fetchKeys();
    } catch (err) {
      console.error('Error saving key:', err);
      toast.error('Erro ao salvar chave');
    } finally {
      setSaving((prev) => ({ ...prev, [keyName]: false }));
    }
  };

  const handleDelete = async (keyName: string) => {
    try {
      const { error } = await supabase.functions.invoke('manage-api-keys', {
        method: 'POST',
        body: JSON.stringify({ key_name: keyName }),
        headers: { 'x-action': 'delete' },
      });

      // Use DELETE method workaround via body
      const { error: delError } = await supabase.functions.invoke('manage-api-keys', {
        method: 'DELETE' as any,
        body: { key_name: keyName },
      });

      if (delError) throw delError;

      toast.success('Chave removida');
      setSavedKeys((prev) => {
        const copy = { ...prev };
        delete copy[keyName];
        return copy;
      });
    } catch (err) {
      console.error('Error deleting key:', err);
      toast.error('Erro ao remover chave');
    }
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
            🔒 Suas chaves são salvas de forma segura no servidor e protegidas por RLS.
            Apenas você pode acessá-las.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5">
            {apiKeyFields.map((field) => {
              const saved = savedKeys[field.id];
              return (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.id} className="text-foreground font-medium">
                      {field.label}
                    </Label>
                    {saved && (
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <CheckCircle className="w-3 h-3" />
                        Configurada
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{field.description}</p>

                  {saved && (
                    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                      <code className="text-sm font-mono text-foreground flex-1">
                        {saved.key_preview}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(field.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}

                  <div className="relative">
                    <Input
                      id={field.id}
                      type={visible[field.id] ? 'text' : 'password'}
                      placeholder={saved ? 'Nova chave para substituir...' : field.placeholder}
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

                  <Button
                    onClick={() => handleSave(field.id)}
                    disabled={!keys[field.id]?.trim() || saving[field.id]}
                    size="sm"
                    className="gap-2"
                  >
                    {saving[field.id] ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    {saved ? 'Atualizar' : 'Salvar'}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ApiKeys;
