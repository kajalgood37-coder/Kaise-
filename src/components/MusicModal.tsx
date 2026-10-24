import React, { useState, useEffect } from 'react';
import { X, Music2, Pin, PinOff, Play, Plus, Search, ExternalLink, Sparkles, Radio } from 'lucide-react';
import { SongItem, MusicCategory } from '../types';

interface MusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskPriyaToPlay: (song: SongItem) => void;
}

const DEFAULT_SONGS: SongItem[] = [
  {
    id: 's-1',
    title: 'Kesariya',
    artist: 'Arijit Singh, Pritam',
    category: 'Bollywood Romantic',
    vibe: 'Pure romance & warm vibes',
    isPinned: true,
  },
  {
    id: 's-2',
    title: 'Lover',
    artist: 'Diljit Dosanjh',
    category: 'Punjabi Beats',
    vibe: 'Catchy, electric & upbeat',
    isPinned: true,
  },
  {
    id: 's-3',
    title: 'Baarishein',
    artist: 'Anuv Jain',
    category: 'Lo-Fi Chill',
    vibe: 'Rainy mood & cozy acoustic',
    isPinned: true,
  },
  {
    id: 's-4',
    title: 'Chaleya',
    artist: 'Arijit Singh, Shilpa Rao',
    category: 'Bollywood Romantic',
    vibe: 'Sweet melody & foot-tapping rhythm',
    isPinned: false,
  },
  {
    id: 's-5',
    title: 'Winning Speech',
    artist: 'Karan Aujla',
    category: 'Punjabi Beats',
    vibe: 'Heavy bass & boss attitude',
    isPinned: false,
  },
  {
    id: 's-6',
    title: 'Tu Jaane Na',
    artist: 'Atif Aslam',
    category: 'Retro Classics',
    vibe: 'Nostalgic heartbreak masterpiece',
    isPinned: false,
  },
  {
    id: 's-7',
    title: 'Kahani Suno 2.0',
    artist: 'Kaifi Khalil',
    category: 'Lo-Fi Chill',
    vibe: 'Soulful late-night feels',
    isPinned: false,
  },
  {
    id: 's-8',
    title: 'Lag Jaa Gale',
    artist: 'Lata Mangeshkar',
    category: 'Retro Classics',
    vibe: 'Timeless eternal classic',
    isPinned: false,
  },
];

const STORAGE_KEY = 'priya_pinned_songs_v1';

export const MusicModal: React.FC<MusicModalProps> = ({
  isOpen,
  onClose,
  onAskPriyaToPlay,
}) => {
  const [songs, setSongs] = useState<SongItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_SONGS;
  });

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newArtist, setNewArtist] = useState<string>('');
  const [newCategory, setNewCategory] = useState<MusicCategory>('Bollywood Romantic');

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
    } catch {
      // ignore
    }
  }, [songs]);

  if (!isOpen) return null;

  const togglePin = (id: string) => {
    setSongs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newSong: SongItem = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      artist: newArtist.trim() || 'My Favorite',
      category: newCategory,
      vibe: 'Custom pinned favorite',
      isPinned: true,
    };

    setSongs((prev) => [newSong, ...prev]);
    setNewTitle('');
    setNewArtist('');
    setShowAddForm(false);
  };

  const categories = ['All', 'Pinned ⭐', 'Bollywood Romantic', 'Punjabi Beats', 'Lo-Fi Chill', 'Retro Classics'];

  const filteredSongs = songs.filter((s) => {
    const matchesCat =
      activeCategory === 'All'
        ? true
        : activeCategory === 'Pinned ⭐'
        ? s.isPinned
        : s.category === activeCategory;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const pinnedCount = songs.filter((s) => s.isPinned).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg text-white">
              <Music2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-['Outfit']">Gane & Music Lounge</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {pinnedCount} Pinned
                </span>
              </div>
              <p className="text-xs text-white/50">Pin your favorite songs & ask Priya to play them</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Pin New Song</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add Song Form Dropdown */}
        {showAddForm && (
          <form
            onSubmit={handleAddSong}
            className="p-4 bg-slate-950/70 border-b border-white/10 flex flex-col sm:flex-row items-center gap-2.5 animate-in slide-in-from-top-2 duration-200"
          >
            <input
              type="text"
              placeholder="Song title (e.g. Tum Hi Ho)..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full sm:flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
              autoFocus
            />
            <input
              type="text"
              placeholder="Artist (e.g. Arijit Singh)..."
              value={newArtist}
              onChange={(e) => setNewArtist(e.target.value)}
              className="w-full sm:w-44 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as MusicCategory)}
              className="w-full sm:w-40 px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="Bollywood Romantic">Bollywood Romantic</option>
              <option value="Punjabi Beats">Punjabi Beats</option>
              <option value="Lo-Fi Chill">Lo-Fi Chill</option>
              <option value="Retro Classics">Retro Classics</option>
            </select>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shrink-0"
            >
              Save & Pin
            </button>
          </form>
        )}

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search gane or artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-rose-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'bg-white/5 text-white/60 hover:text-white border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Songs List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {filteredSongs.length === 0 ? (
            <div className="py-12 text-center text-white/40 text-xs">
              No songs found matching your search. Pin new ones above!
            </div>
          ) : (
            filteredSongs.map((song) => (
              <div
                key={song.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                  song.isPinned
                    ? 'bg-gradient-to-r from-rose-500/[0.08] via-purple-500/[0.06] to-transparent border-rose-500/30'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                }`}
              >
                {/* Song Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      song.isPinned
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    <Music2 className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white truncate">{song.title}</h4>
                      {song.isPinned && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                          <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50 truncate">
                      {song.artist} • <span className="text-rose-300/80">{song.category}</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Pin / Unpin Button */}
                  <button
                    onClick={() => togglePin(song.id)}
                    title={song.isPinned ? 'Unpin song' : 'Pin to top'}
                    className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors border ${
                      song.isPinned
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                        : 'bg-white/5 text-white/50 border-white/10 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {song.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                    <span className="text-[11px]">{song.isPinned ? 'Unpin' : 'Pin'}</span>
                  </button>

                  {/* Ask Priya to Play */}
                  <button
                    onClick={() => {
                      onAskPriyaToPlay(song);
                      onClose();
                    }}
                    title="Ask Priya to play this over live voice"
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-rose-950/50"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Ask Priya</span>
                  </button>

                  {/* External YouTube Link */}
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                      `${song.title} ${song.artist} song`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Play on YouTube"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-white/50">
          <span>Pinned songs stay saved on your device</span>
          <span className="text-rose-300 font-medium">Say "Priya koi gana sunao" anytime! 🎶</span>
        </div>
      </div>
    </div>
  );
};
