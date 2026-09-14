import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { generateContent } from '@/lib/ai-generator';
import type { SocialPost, SocialPlatform } from '@/lib/types';
import { Instagram, Plus, X, Sparkles, CheckCircle, Clock, Send, Loader2, Copy, Check, Share2, MessageCircle, Linkedin, ExternalLink } from 'lucide-react';
import type { SharedContent } from '@/App';

const PLATFORMS: { id: SocialPlatform; label: string; icon: typeof Instagram; color: string }[] = [
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-600' },
  { id: 'tiktok', label: 'TikTok', icon: Sparkles, color: 'from-gray-700 to-gray-900' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'from-blue-600 to-blue-800' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'from-green-500 to-green-700' },
];

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-charcoal-600/40 text-charcoal-300',
  scheduled: 'bg-blue-500/15 text-blue-300',
  published: 'bg-green-500/15 text-green-300',
};

interface SocialMediaProps {
  sharedContent?: SharedContent | null;
  onSharedConsumed?: () => void;
}

export function SocialMedia({ sharedContent, onSharedConsumed }: SocialMediaProps = {}) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('instagram');
  const [caption, setCaption] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [sharing, setSharing] = useState<string | null>(null);

  useEffect(() => {
    if (sharedContent) {
      setCaption(sharedContent.caption);
      setImagePrompt(sharedContent.imagePrompt || '');
      setShowCreate(true);
      onSharedConsumed?.();
    }
  }, [sharedContent, onSharedConsumed]);

  const loadPosts = useCallback(async () => {
    const { data } = await supabase.from('social_posts').select('*').order('created_at', { ascending: false });
    setPosts((data as SocialPost[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  async function handleGenerate() {
    if (!caption.trim()) return;
    setGenerating(true);

    const generated = generateContent({ type: 'text', prompt: caption, tone: 'luxurious' });
    setCaption(generated);

    if (selectedPlatform === 'instagram' || selectedPlatform === 'tiktok' || selectedPlatform === 'whatsapp') {
      const imgPrompt = generateContent({ type: 'image', prompt: imagePrompt || caption });
      setImagePrompt(imgPrompt);
    }

    setGenerating(false);
  }

  async function handleSave(status: string) {
    if (!caption.trim()) return;

    await supabase.from('social_posts').insert({
      platform: selectedPlatform,
      caption,
      content: caption,
      image_prompt: imagePrompt || null,
      status,
    });

    setShowCreate(false);
    setCaption('');
    setImagePrompt('');
    loadPosts();

    if (status === 'published') {
      shareToPlatform(selectedPlatform, caption);
    }
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('social_posts').update({ status }).eq('id', id);
    loadPosts();
  }

  async function deletePost(id: string) {
    await supabase.from('social_posts').delete().eq('id', id);
    loadPosts();
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  async function shareToPlatform(platform: SocialPlatform, text: string) {
    setSharing(platform);

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
      showToast('Opened WhatsApp with your caption pre-filled.');
      setSharing(null);
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({ text });
        setSharing(null);
        return;
      } catch {
        // user cancelled — fall through to clipboard + open
      }
    }

    await navigator.clipboard.writeText(text);

    const urls: Record<SocialPlatform, string> = {
      whatsapp: '',
      linkedin: 'https://www.linkedin.com/feed/',
      instagram: 'https://www.instagram.com/',
      tiktok: 'https://www.tiktok.com/',
    };
    window.open(urls[platform], '_blank', 'noopener,noreferrer');
    showToast('Caption copied to clipboard. Paste it when the platform opens.');
    setSharing(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-serif text-4xl font-bold mb-2">Social Media</h2>
          <p className="text-charcoal-300">Create, schedule, and publish posts across platforms.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-gold flex items-center gap-2">
          <Plus size={18} /> Create Post
        </button>
      </div>

      {/* Platform stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PLATFORMS.map((p) => {
          const Icon = p.icon;
          const count = posts.filter((post) => post.platform === p.id).length;
          return (
            <div key={p.id} className="glass-card p-5 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                <Icon className="text-white" size={20} />
              </div>
              <div>
                <p className="font-semibold">{p.label}</p>
                <p className="text-xs text-charcoal-400">{count} posts</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Posts list */}
      <div className="glass-card p-6">
        <h3 className="font-serif text-2xl font-bold mb-4">All Posts</h3>
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="mx-auto text-charcoal-500 mb-3" size={32} />
            <p className="text-charcoal-400">No posts yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => {
              const platform = PLATFORMS.find((p) => p.id === post.platform);
              const Icon = platform?.icon || Sparkles;
              return (
                <div key={post.id} className="p-4 rounded-xl bg-charcoal-700/40 border border-gold-500/10 hover:border-gold-400/20 transition-all">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${platform?.color || 'from-gray-600 to-gray-800'} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="text-white" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{platform?.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[post.status] || ''}`}>
                          {post.status}
                        </span>
                        <span className="text-xs text-charcoal-500 ml-auto">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-charcoal-200 line-clamp-3">{post.caption}</p>
                      {post.image_prompt && (
                        <div className="mt-2 p-2 rounded-lg bg-charcoal-800/50 border border-gold-500/10">
                          <p className="text-xs text-charcoal-400 line-clamp-2">{post.image_prompt}</p>
                        </div>
                      )}
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => copyText(post.caption, post.id)} className="text-xs px-3 py-1.5 rounded-lg bg-charcoal-600/50 text-charcoal-200 hover:text-gold-300 transition-all flex items-center gap-1">
                          {copied === post.id ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                          {copied === post.id ? 'Copied' : 'Copy'}
                        </button>
                        <button
                          onClick={() => shareToPlatform(post.platform, post.caption)}
                          disabled={sharing === post.platform}
                          className="text-xs px-3 py-1.5 rounded-lg bg-gold-500/15 text-gold-300 hover:bg-gold-500/25 transition-all flex items-center gap-1 disabled:opacity-50"
                        >
                          {sharing === post.platform ? <Loader2 size={12} className="animate-spin" /> : <ExternalLink size={12} />}
                          Share
                        </button>
                        {post.status === 'draft' && (
                          <button onClick={() => updateStatus(post.id, 'published')} className="text-xs px-3 py-1.5 rounded-lg bg-green-500/15 text-green-300 hover:bg-green-500/25 transition-all flex items-center gap-1">
                            <Send size={12} /> Publish
                          </button>
                        )}
                        <button onClick={() => deletePost(post.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25 transition-all">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowCreate(false)}>
          <div className="glass-card p-6 lg:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl font-bold gold-text">Create Social Post</h3>
              <button onClick={() => setShowCreate(false)} className="text-charcoal-400 hover:text-gold-300 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gold-300 font-medium mb-2 block">Platform</label>
                <div className="grid grid-cols-4 gap-2">
                  {PLATFORMS.map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPlatform(p.id)}
                        className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                          selectedPlatform === p.id
                            ? 'border-gold-400/50 bg-gold-500/10'
                            : 'border-charcoal-700/50 hover:border-gold-500/20'
                        }`}
                      >
                        <Icon size={18} className={selectedPlatform === p.id ? 'text-gold-300' : 'text-charcoal-300'} />
                        <span className="text-[10px]">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm text-gold-300 font-medium mb-1.5 block">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Write your post caption or describe what you want..."
                />
              </div>

              <div>
                <label className="text-sm text-gold-300 font-medium mb-1.5 block">Image Description (optional)</label>
                <input
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  className="input-field"
                  placeholder="e.g. A fresh skin fade with clean line-up"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={!caption.trim() || generating}
                className="btn-outline w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                AI Enhance
              </button>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleSave('draft')}
                  disabled={!caption.trim()}
                  className="flex-1 btn-outline flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Clock size={16} /> Save Draft
                </button>
                <button
                  onClick={() => handleSave('published')}
                  disabled={!caption.trim()}
                  className="flex-1 btn-gold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Share2 size={16} /> Share & Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-slide-up">
          <div className="glass-card px-5 py-3 flex items-center gap-3 border-gold-400/40">
            <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
            <p className="text-sm text-cream-100">{toast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
