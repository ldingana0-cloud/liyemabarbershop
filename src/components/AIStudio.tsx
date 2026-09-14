import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { generateContent, TONE_OPTIONS, CONTENT_TYPE_LABELS } from '@/lib/ai-generator';
import type { ContentType, ContentGeneration } from '@/lib/types';
import { Scissors, Mail, Code, Image, Sparkles, Copy, Check, Loader2, Clock, Camera, Share2 } from 'lucide-react';
import { getPhotosForPrompt, type BarbershopPhoto } from '@/lib/photos';
import type { SharedContent } from '@/App';

const CONTENT_TYPES: { id: ContentType; label: string; icon: typeof Scissors; desc: string }[] = [
  { id: 'text', label: 'Marketing Text', icon: Scissors, desc: 'Promotional copy for ads, posts, and flyers' },
  { id: 'email', label: 'Email Campaign', icon: Mail, desc: 'Full email with subject and body' },
  { id: 'code', label: 'HTML Banner', icon: Code, desc: 'Embeddable HTML marketing banner' },
  { id: 'image', label: 'Image Prompt', icon: Image, desc: 'AI image generation prompts for hairstyle photos' },
];

const PROMPT_SUGGESTIONS: Record<ContentType, string[]> = {
  text: [
    'Promote our new skin fade service with a summer discount',
    'Announce a referral program — bring a friend, get 20% off',
    'Promote our executive package for corporate clients',
  ],
  email: [
    'Remind clients about their monthly grooming appointment',
    'Send a special offer for Father\'s Day grooming packages',
    'Welcome new customers to the loyalty program',
  ],
  code: [
    'A promotional banner for our beard sculpt service',
    'A booking call-to-action banner for the homepage',
    'A limited-time offer banner for holiday gift cards',
  ],
  image: [
    'A fresh skin fade with a clean line-up',
    'A classic pompadour styled with pomade',
    'A beard sculpt with hot towel treatment',
  ],
};

interface AIStudioProps {
  onShareToSocial: (content: SharedContent) => void;
}

export function AIStudio({ onShareToSocial }: AIStudioProps) {
  const [activeType, setActiveType] = useState<ContentType>('text');
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('luxurious');
  const [output, setOutput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<ContentGeneration[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [photos, setPhotos] = useState<BarbershopPhoto[]>([]);
  const [postedIds, setPostedIds] = useState<Set<string>>(new Set());

  const loadHistory = useCallback(async () => {
    const { data } = await supabase
      .from('content_generations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    setHistory((data as ContentGeneration[]) || []);
    setLoadingHistory(false);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setOutput('');
    setPhotos([]);

    await new Promise((r) => setTimeout(r, 600));

    const result = generateContent({ type: activeType, prompt, tone });
    setOutput(result);

    if (activeType === 'image') {
      setPhotos(getPhotosForPrompt(prompt, 6));
    }

    const { data } = await supabase
      .from('content_generations')
      .insert({
        content_type: activeType,
        prompt,
        output: result,
        metadata: { tone },
      })
      .select()
      .single();

    if (data) {
      setHistory((prev) => [data as ContentGeneration, ...prev]);
    }

    setGenerating(false);
  }

  function copyOutput() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareToSocial(text: string, imagePrompt: string | null) {
    onShareToSocial({ caption: text, imagePrompt });
  }

  let currentGenerationId = '';
  if (history.length > 0 && history[0].output === output) {
    currentGenerationId = history[0].id;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-serif text-4xl font-bold mb-2">AI Content Studio</h2>
        <p className="text-charcoal-300">Generate marketing content for your barbershop — text, emails, code banners, and image prompts.</p>
      </div>

      {/* Content type selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CONTENT_TYPES.map((ct) => {
          const Icon = ct.icon;
          const isActive = activeType === ct.id;
          return (
            <button
              key={ct.id}
              onClick={() => {
                setActiveType(ct.id);
                setOutput('');
                setPrompt('');
              }}
              className={`glass-card p-5 text-left transition-all duration-300 ${
                isActive ? 'border-gold-400/50 bg-gold-500/10' : 'hover:border-gold-400/30'
              }`}
            >
              <Icon className={isActive ? 'text-gold-300' : 'text-charcoal-300'} size={24} />
              <h3 className="font-semibold mt-3 mb-1">{ct.label}</h3>
              <p className="text-xs text-charcoal-400 leading-relaxed">{ct.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Prompt area */}
      <div className="glass-card p-6">
        <label className="text-sm text-gold-300 font-medium mb-2 block">
          Describe what you want to generate
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`e.g. "${PROMPT_SUGGESTIONS[activeType][0]}"`}
          className="input-field min-h-[100px] resize-none"
        />

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {PROMPT_SUGGESTIONS[activeType].map((s) => (
            <button
              key={s}
              onClick={() => setPrompt(s)}
              className="text-xs px-3 py-1.5 rounded-full bg-charcoal-700/50 border border-gold-500/15 text-charcoal-300 hover:text-gold-200 hover:border-gold-400/40 transition-all"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Tone selector (for text/email) */}
        {(activeType === 'text' || activeType === 'email') && (
          <div className="mt-4">
            <label className="text-sm text-gold-300 font-medium mb-2 block">Tone</label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    tone === t.value
                      ? 'bg-gold-500/20 text-gold-200 border border-gold-400/50'
                      : 'bg-charcoal-700/40 text-charcoal-300 border border-transparent hover:border-gold-500/20'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || generating}
          className="btn-gold mt-5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {generating ? 'Generating...' : 'Generate Content'}
        </button>
      </div>

      {/* Output */}
      {output && (
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-2xl font-bold gold-text">{CONTENT_TYPE_LABELS[activeType]}</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => shareToSocial(output, activeType === 'image' ? prompt : null)}
                className="flex items-center gap-2 text-sm text-charcoal-300 hover:text-gold-300 transition-colors"
              >
                <Share2 size={16} />
                Post to Social
              </button>
              <button
                onClick={copyOutput}
                className="flex items-center gap-2 text-sm text-charcoal-300 hover:text-gold-300 transition-colors"
              >
                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Photo gallery for image prompts */}
          {activeType === 'image' && photos.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Camera size={16} className="text-gold-300" />
                <span className="text-sm text-gold-300 font-medium">Reference Photos</span>
                <span className="text-xs text-charcoal-500">— real barbershop photography matching your prompt</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {photos.map((photo, i) => (
                  <div
                    key={i}
                    className="group relative rounded-xl overflow-hidden border border-gold-500/20 hover:border-gold-400/40 transition-all duration-300"
                  >
                    <img
                      src={photo.url}
                      alt={photo.alt}
                      loading="lazy"
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-xs text-cream-100 line-clamp-2">{photo.alt}</p>
                      <p className="text-[10px] text-charcoal-400 mt-1">Photo by {photo.photographer} on Pexels</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <pre className="whitespace-pre-wrap text-sm text-charcoal-200 leading-relaxed font-sans">
            {output}
          </pre>
        </div>
      )}

      {/* History */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl font-bold flex items-center gap-2">
            <Clock size={20} className="text-gold-300" /> Generation History
          </h3>
          <span className="text-xs text-charcoal-400">{history.length} generations</span>
        </div>

        {loadingHistory ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="mx-auto text-charcoal-500 mb-3" size={32} />
            <p className="text-charcoal-400">No content generated yet. Create your first piece above!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {history.map((item) => {
              const typeLabel = CONTENT_TYPE_LABELS[item.content_type as ContentType] || item.content_type;
              const isPosted = postedIds.has(item.id);
              return (
                <div key={item.id} className="p-4 rounded-xl bg-charcoal-700/40 border border-gold-500/10 hover:border-gold-400/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-gold-500/15 text-gold-300">
                        {typeLabel}
                      </span>
                      {item.metadata?.tone && (
                        <span className="text-xs px-2 py-1 rounded-full bg-charcoal-600/50 text-charcoal-300 capitalize">
                          {String(item.metadata.tone)}
                        </span>
                      )}
                      {isPosted && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-300 flex items-center gap-1">
                          <Check size={10} /> Posted
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-charcoal-500">
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="mb-2">
                    <p className="text-xs text-gold-200 font-medium mb-1">Search:</p>
                    <p className="text-sm text-charcoal-300 line-clamp-1">{item.prompt}</p>
                  </div>
                  {item.output && (
                    <div>
                      <p className="text-xs text-charcoal-500 font-medium mb-1">Output:</p>
                      <p className="text-xs text-charcoal-400 line-clamp-2">{item.output}</p>
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => { setOutput(item.output || ''); setActiveType(item.content_type as ContentType); }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-charcoal-600/50 text-charcoal-200 hover:text-gold-300 transition-all flex items-center gap-1"
                    >
                      <Copy size={12} /> Load
                    </button>
                    <button
                      onClick={() => shareToSocial(item.output || '', item.content_type === 'image' ? item.prompt : null)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gold-500/15 text-gold-300 hover:bg-gold-500/25 transition-all flex items-center gap-1"
                    >
                      <Share2 size={12} /> Post to Social
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
