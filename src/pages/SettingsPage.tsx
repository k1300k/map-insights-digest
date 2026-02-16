import { useState, useEffect } from "react";
import { useSources, useKeywords, useAddSource, useToggleSource, useDeleteSource, useAddKeyword, useDeleteKeyword, useAiConfig, useUpdateAiConfig } from "@/hooks/useSupabaseData";
import { Plus, Trash2, X, Check, Globe, Rss, Loader2, Bot, Eye, EyeOff, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sanitizeError } from "@/lib/sanitizeError";

const AI_PROVIDERS = [
  { value: "lovable", label: "Lovable AI (기본)", models: [
    "google/gemini-2.5-flash", "google/gemini-2.5-pro", "google/gemini-3-flash-preview", "google/gemini-3-pro-preview",
    "openai/gpt-5", "openai/gpt-5-mini", "openai/gpt-5-nano",
  ]},
  { value: "google", label: "Google Gemini (직접 API)", models: [
    "gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-1.5-pro",
  ]},
];

export default function SettingsPage() {
  const { toast } = useToast();
  const { data: sources = [], isLoading: loadingSources } = useSources();
  const { data: includeKw = [], isLoading: loadingInclude } = useKeywords("include");
  const { data: excludeKw = [], isLoading: loadingExclude } = useKeywords("exclude");
  const { data: aiConfig, isLoading: loadingAiConfig } = useAiConfig();
  const updateAiConfigMut = useUpdateAiConfig();

  const addSourceMut = useAddSource();
  const toggleSourceMut = useToggleSource();
  const deleteSourceMut = useDeleteSource();
  const addKeywordMut = useAddKeyword();
  const deleteKeywordMut = useDeleteKeyword();

  const [newInclude, setNewInclude] = useState("");
  const [newExclude, setNewExclude] = useState("");
  const [showAddSource, setShowAddSource] = useState(false);
  const [newSource, setNewSource] = useState({ name: "", type: "rss" as string, url: "", parser_type: "standard", region_hint: "NA" as string });

  // AI config state
  const [aiProvider, setAiProvider] = useState("lovable");
  const [aiModel, setAiModel] = useState("google/gemini-2.5-flash");
  const [aiApiKey, setAiApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [aiDirty, setAiDirty] = useState(false);

  useEffect(() => {
    if (aiConfig) {
      setAiProvider(aiConfig.provider);
      setAiModel(aiConfig.model);
      setAiApiKey(aiConfig.api_key || "");
      setAiDirty(false);
    }
  }, [aiConfig]);

  const addKeyword = (type: "include" | "exclude") => {
    const val = type === "include" ? newInclude.trim() : newExclude.trim();
    if (!val) return;
    addKeywordMut.mutate({ value: val, type }, {
      onSuccess: () => {
        if (type === "include") setNewInclude(""); else setNewExclude("");
        toast({ title: "Keyword added", description: val });
      },
      onError: (e) => toast({ title: "Error", description: sanitizeError(e), variant: "destructive" }),
    });
  };

  const removeKeyword = (id: string) => {
    deleteKeywordMut.mutate(id);
  };

  const toggleSource = (id: string, currentEnabled: boolean) => {
    toggleSourceMut.mutate({ id, enabled: !currentEnabled });
  };

  const removeSource = (id: string) => {
    deleteSourceMut.mutate(id, {
      onSuccess: () => toast({ title: "Source removed" }),
    });
  };

  const addSource = () => {
    if (!newSource.name || !newSource.url) return;
    addSourceMut.mutate(newSource, {
      onSuccess: () => {
        setNewSource({ name: "", type: "rss", url: "", parser_type: "standard", region_hint: "NA" });
        setShowAddSource(false);
        toast({ title: "Source added", description: newSource.name });
      },
      onError: (e) => toast({ title: "Error", description: sanitizeError(e), variant: "destructive" }),
    });
  };

  const handleProviderChange = (provider: string) => {
    setAiProvider(provider);
    const providerConfig = AI_PROVIDERS.find(p => p.value === provider);
    if (providerConfig) setAiModel(providerConfig.models[0]);
    setAiDirty(true);
  };

  const saveAiConfig = () => {
    if (!aiConfig) return;
    updateAiConfigMut.mutate({
      id: aiConfig.id,
      provider: aiProvider,
      model: aiModel,
      api_key: aiProvider === "google" ? aiApiKey : null,
    }, {
      onSuccess: () => {
        toast({ title: "AI 설정 저장됨", description: `${aiProvider} / ${aiModel}` });
        setAiDirty(false);
      },
      onError: (e) => toast({ title: "Error", description: sanitizeError(e), variant: "destructive" }),
    });
  };

  const isLoading = loadingSources || loadingInclude || loadingExclude || loadingAiConfig;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage keywords and sources for daily pipeline</p>
      </div>

      {/* AI Engine Config */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">AI Engine</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Provider</label>
            <select
              value={aiProvider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {AI_PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Model</label>
            <select
              value={aiModel}
              onChange={(e) => { setAiModel(e.target.value); setAiDirty(true); }}
              className="w-full px-3 py-1.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {AI_PROVIDERS.find(p => p.value === aiProvider)?.models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {aiProvider === "google" && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Google Gemini API Key</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={aiApiKey}
                  onChange={(e) => { setAiApiKey(e.target.value); setAiDirty(true); }}
                  placeholder="AIza..."
                  className="w-full px-3 py-1.5 pr-9 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Google AI Studio</a>에서 API 키를 발급받으세요
            </p>
          </div>
        )}

        {aiProvider === "lovable" && (
          <p className="text-xs text-muted-foreground">Lovable AI는 별도의 API 키 없이 사용 가능합니다.</p>
        )}

        <div className="flex justify-end">
          <button
            onClick={saveAiConfig}
            disabled={!aiDirty || updateAiConfigMut.isPending}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateAiConfigMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            저장
          </button>
        </div>
      </div>

      {/* Keywords */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Include */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <h2 className="text-sm font-semibold text-foreground mb-3">Include Keywords</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {includeKw.map((k) => (
              <span key={k.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-medium">
                {k.value}
                <button onClick={() => removeKeyword(k.id)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newInclude}
              onChange={(e) => setNewInclude(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKeyword("include")}
              placeholder="Add keyword..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button onClick={() => addKeyword("include")} className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Exclude */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <h2 className="text-sm font-semibold text-foreground mb-3">Exclude Keywords</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {excludeKw.map((k) => (
              <span key={k.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
                {k.value}
                <button onClick={() => removeKeyword(k.id)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newExclude}
              onChange={(e) => setNewExclude(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKeyword("exclude")}
              placeholder="Add keyword..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button onClick={() => addKeyword("exclude")} className="p-1.5 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sources */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Sources ({sources.length})</h2>
          <button
            onClick={() => setShowAddSource(!showAddSource)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3 w-3" /> Add Source
          </button>
        </div>

        {showAddSource && (
          <div className="rounded-xl border border-primary/30 bg-card p-4 mb-4 shadow-card space-y-3 animate-fade-in">
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={newSource.name} onChange={(e) => setNewSource({ ...newSource, name: e.target.value })} placeholder="Source name" className="px-3 py-1.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
              <input value={newSource.url} onChange={(e) => setNewSource({ ...newSource, url: e.target.value })} placeholder="URL" className="px-3 py-1.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
              <select value={newSource.type} onChange={(e) => setNewSource({ ...newSource, type: e.target.value })} className="px-3 py-1.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="rss">RSS</option>
                <option value="html">HTML</option>
              </select>
              <select value={newSource.region_hint} onChange={(e) => setNewSource({ ...newSource, region_hint: e.target.value })} className="px-3 py-1.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="NA">North America</option>
                <option value="EU">Europe</option>
                <option value="KR">Korea</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAddSource(false)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={addSource} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                <Check className="h-3 w-3" /> Save
              </button>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-card">
          {sources.map((s, i) => (
            <div key={s.id} className={`flex items-center gap-3 px-4 py-3 ${i < sources.length - 1 ? "border-b border-border" : ""}`}>
              <button onClick={() => toggleSource(s.id, s.enabled)} className={`flex-shrink-0 h-4 w-4 rounded border transition-colors ${s.enabled ? "bg-primary border-primary" : "border-muted-foreground/30"}`}>
                {s.enabled && <Check className="h-4 w-4 text-primary-foreground" />}
              </button>
              <div className="flex-shrink-0">
                {s.type === "rss" ? <Rss className="h-3.5 w-3.5 text-maps-yellow" /> : <Globe className="h-3.5 w-3.5 text-maps-blue" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${s.enabled ? "text-foreground" : "text-muted-foreground"}`}>{s.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{s.url}</p>
              </div>
              <span className="hidden sm:inline text-[10px] text-muted-foreground font-mono">{s.region_hint}</span>
              <button onClick={() => removeSource(s.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
