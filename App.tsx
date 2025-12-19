import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Plus, Trophy, Briefcase, Trash2, ExternalLink, 
  Loader2, Sparkles, Filter, Sun, Moon, Swords, Check, 
  AlertCircle, Link as LinkIcon, Image as ImageIcon,
  Upload, Settings2, RefreshCw, Globe, Crown, Diamond, Zap, Medal, X, Save, Copy, Camera
} from 'lucide-react';
import { PlayerCard, PlayerRarity, PlayerStats } from './types';
import { generatePlayerData, generatePlayerImage } from './services/geminiService';

type Theme = 'light' | 'dark';

// Utility to convert Wikipedia page URLs to raw image URLs
const autoFixWikipediaUrl = (url: string): string => {
  if (!url) return url;
  
  // Already a direct redirect or upload? Just add width if missing for better reliability
  if (url.includes('Special:Redirect/file/')) {
    return url.includes('&width=') ? url : `${url}&width=800`;
  }
  if (url.includes('upload.wikimedia.org')) return url;
  
  // If it's a "File:" page URL, try a robust transform
  if (url.includes('/wiki/File:')) {
    const parts = url.split('/wiki/File:');
    if (parts.length > 1) {
      // Clean the filename (remove anchors or query params)
      const fileName = parts[1].split(/[?#]/)[0];
      return `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${fileName}&width=800`;
    }
  }

  // Handle generic Wikimedia page links
  if (url.includes('wikimedia.org/wiki/') && !url.includes('File:')) {
    // This is likely a gallery or category page, we can't easily fix it without more context
    // but we return it as is and hope the AI provided something usable
    return url;
  }
  
  return url;
};

const getRarityIcon = (rarity: PlayerRarity | string, size = 12) => {
  const r = rarity.toString().toUpperCase();
  if (r.includes('LEGENDARY')) return <Crown size={size} />;
  if (r.includes('EPIC')) return <Diamond size={size} />;
  if (r.includes('RARE')) return <Trophy size={size} />;
  if (r.includes('UNCOMMON')) return <Zap size={size} />;
  return <Medal size={size} />;
};

const getRarityColorClasses = (rarity: PlayerRarity | string) => {
  const r = rarity.toString().toUpperCase();
  if (r.includes('LEGENDARY')) return 'bg-yellow-500 text-black border-yellow-300 font-bold';
  if (r.includes('EPIC')) return 'bg-purple-600 text-white border-purple-400';
  if (r.includes('RARE')) return 'bg-blue-600 text-white border-blue-400';
  if (r.includes('UNCOMMON')) return 'bg-emerald-600 text-white border-emerald-400';
  return 'bg-gray-500 text-white border-gray-400';
};

const RarityBadge: React.FC<{ rarity: PlayerRarity }> = ({ rarity }) => (
  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm border ${getRarityColorClasses(rarity)}`}>
    {getRarityIcon(rarity, 10)}
    {rarity}
  </span>
);

const StatBar: React.FC<{ label: string; value: number; theme: Theme; highlight?: boolean }> = ({ label, value, theme, highlight }) => (
  <div className={`flex flex-col gap-1 transition-all duration-500 ${highlight ? 'stat-winner' : ''}`}>
    <div className="flex justify-between items-end">
      <span className={`text-[10px] font-bold uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>{label}</span>
      <span className={`text-sm font-oswald ${highlight ? 'text-green-500 font-bold scale-110' : (theme === 'dark' ? 'text-white' : 'text-slate-900')}`}>
        {value}
      </span>
    </div>
    <div className={`h-1.5 w-full rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}>
      <div className={`h-full transition-all duration-1000 ${highlight ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

const CardItem: React.FC<{ 
  card: PlayerCard; 
  onDelete: (id: string) => void;
  onClick: (card: PlayerCard) => void;
  theme: Theme;
  isSelected?: boolean;
  isComparisonMode?: boolean;
}> = ({ card, onDelete, onClick, theme, isSelected, isComparisonMode }) => {
  const rarityStr = card.rarity.toString().toUpperCase();
  const isLegendary = rarityStr.includes('LEGENDARY');
  const isEpic = rarityStr.includes('EPIC');
  const [imgError, setImgError] = useState(false);
  
  // Detect if image is AI generated or Grounded
  const isAIImage = card.imageUrl && card.imageUrl.startsWith('data:');

  // Clear image error if the URL changes
  useEffect(() => {
    setImgError(false);
  }, [card.imageUrl]);

  return (
    <div 
      onClick={() => onClick(card)}
      className={`relative group cursor-pointer transition-all duration-500 rounded-3xl overflow-hidden glass border 
        ${theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-white/70 border-slate-200 shadow-md'} 
        ${isSelected ? 'ring-4 ring-blue-500 scale-105 z-10' : 'hover:-translate-y-2 hover:shadow-2xl'}
        ${isLegendary && !isSelected ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/10' : ''}
        ${isEpic && !isSelected ? 'border-purple-500/50 shadow-lg shadow-purple-500/10' : ''}`}
    >
      <div className="aspect-[3/4] overflow-hidden relative bg-slate-900 flex items-center justify-center">
        {!imgError && card.imageUrl ? (
          <img 
            src={card.imageUrl} 
            alt={card.name} 
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-950">
            <ImageIcon className="text-white/10 mb-2" size={32} />
            <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest leading-tight">Portrait Refused</span>
            <div className="flex flex-col gap-2 mt-4 w-full px-2">
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  window.open(`https://www.google.com/search?q=${encodeURIComponent(card.name + ' ' + card.club + ' official football photo')}&tbm=isch`, '_blank'); 
                }} 
                className="w-full py-1.5 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg text-[9px] uppercase font-bold text-blue-400 border border-blue-600/20 transition-colors"
              >
                Search Web
              </button>
            </div>
          </div>
        )}
        
        {/* Source indicator */}
        <div className="absolute bottom-4 right-4 z-20">
          {isAIImage ? (
             <div className="p-1.5 bg-purple-500 text-white rounded-lg shadow-lg" title="AI Synthesized Portrait"><Sparkles size={12} /></div>
          ) : (
             <div className="p-1.5 bg-blue-500 text-white rounded-lg shadow-lg" title="Grounded Official Asset"><Camera size={12} /></div>
          )}
        </div>

        {(isLegendary || isEpic) && <div className="absolute inset-0 card-shimmer pointer-events-none opacity-40" />}
        <div className="absolute top-4 left-4"><RarityBadge rarity={card.rarity} /></div>
        {isSelected && <div className="absolute top-4 right-4 bg-blue-500 text-white rounded-full p-1.5 shadow-lg z-20"><Check size={16} strokeWidth={3} /></div>}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/40 to-transparent">
          <p className="text-[11px] font-bold text-blue-400 uppercase leading-none tracking-widest mb-1">{card.position}</p>
          <h3 className="text-xl font-oswald text-white truncate leading-tight uppercase">{card.name}</h3>
          <p className="text-xs text-gray-300 truncate opacity-70 font-medium">{card.club}</p>
        </div>
      </div>
      {!isComparisonMode && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(card.id); }} 
          className="absolute top-4 right-4 p-2 bg-black/60 rounded-full text-white/40 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-20"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};

export default function App() {
  const [collection, setCollection] = useState<PlayerCard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScouting, setIsScouting] = useState(false);
  const [scoutProgress, setScoutProgress] = useState('');
  const [scoutError, setScoutError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PlayerRarity | 'ALL'>('ALL');
  const [theme, setTheme] = useState<Theme>('dark');
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCard, setSelectedCard] = useState<PlayerCard | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [comparisonSelection, setComparisonSelection] = useState<PlayerCard[]>([]);

  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [newAssetUrl, setNewAssetUrl] = useState('');

  const detailTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('footy_collection_v2');
    if (saved) try { setCollection(JSON.parse(saved)); } catch (e) { console.error(e); }
    const savedTheme = localStorage.getItem('footy_theme') as Theme;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => { 
    localStorage.setItem('footy_collection_v2', JSON.stringify(collection)); 
  }, [collection]);

  useEffect(() => { 
    document.body.style.backgroundColor = theme === 'dark' ? '#0a0a0c' : '#f8fafc'; 
  }, [theme]);

  useEffect(() => {
    if (selectedCard && detailTopRef.current) {
      detailTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedCard]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('footy_theme', next);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { 
        setUploadedBase64(reader.result as string); 
        setCustomImageUrl(''); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateImageManual = () => {
    if (selectedCard && newAssetUrl.trim()) {
      const fixedUrl = autoFixWikipediaUrl(newAssetUrl.trim());
      setCollection(prev => prev.map(card => card.id === selectedCard.id ? { ...card, imageUrl: fixedUrl } : card));
      setSelectedCard(prev => prev ? { ...prev, imageUrl: fixedUrl } : null);
      setIsEditingUrl(false);
      setNewAssetUrl('');
    }
  };

  const handleScout = async () => {
    if (!searchTerm.trim()) return;
    setIsScouting(true); setScoutError(null);
    setScoutProgress('Synchronizing Player Intel...');
    
    try {
      const { data, sources } = await generatePlayerData(searchTerm);
      let finalImageUrl = '';

      if (uploadedBase64) {
        finalImageUrl = uploadedBase64;
      } else if (customImageUrl.trim()) {
        finalImageUrl = autoFixWikipediaUrl(customImageUrl.trim());
      } else {
        setScoutProgress(`Forging Cinematic Portrait...`);
        try {
          // Attempt AI Generation
          finalImageUrl = await generatePlayerImage(data.name || 'Unknown', data.club || 'Free Agent', data.rarity as PlayerRarity);
        } catch (imgErr: any) { 
          // If AI is blocked (safety) or failed, use the search grounded image immediately
          console.warn("AI Generation blocked or failed, falling back to grounded search link.");
          finalImageUrl = autoFixWikipediaUrl(data.suggestedImageUrl || ''); 
        }
      }

      // Normalization Layer
      let normalizedRarity = PlayerRarity.COMMON;
      if (data.rarity) {
        const r = data.rarity.charAt(0).toUpperCase() + data.rarity.slice(1).toLowerCase();
        normalizedRarity = Object.values(PlayerRarity).includes(r as PlayerRarity) ? (r as PlayerRarity) : PlayerRarity.COMMON;
      }

      const newCard: PlayerCard = {
        id: crypto.randomUUID(),
        name: data.name || 'Unknown',
        nationality: data.nationality || 'Unknown',
        club: data.club || 'Free Agent',
        position: data.position || 'N/A',
        stats: data.stats || { pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50 },
        rarity: normalizedRarity,
        marketValue: data.marketValue || 0,
        imageUrl: finalImageUrl,
        suggestedImageUrl: autoFixWikipediaUrl(data.suggestedImageUrl || ''),
        description: data.description || '',
        timestamp: Date.now(),
        groundingSources: sources
      };

      setCollection(prev => [newCard, ...prev]);
      setSearchTerm(''); setCustomImageUrl(''); setUploadedBase64(null);
      setSelectedCard(newCard); 
      setIsRevealing(true);
      setIsComparisonMode(false);
    } catch (err: any) { 
      setScoutError(err.message || 'Scouting connection failed.'); 
    }
    finally { setIsScouting(false); setScoutProgress(''); }
  };

  const handleCardClick = (card: PlayerCard) => {
    if (isComparisonMode) {
      setComparisonSelection(prev => {
        if (prev.find(c => c.id === card.id)) return prev.filter(c => c.id !== card.id);
        return prev.length >= 2 ? [prev[1], card] : [...prev, card];
      });
    } else { 
      setSelectedCard(card); 
      setIsRevealing(false); 
      setIsEditingUrl(false);
    }
  };

  const filteredCollection = collection.filter(card => {
    if (filter === 'ALL') return true;
    return card.rarity.toString().toUpperCase() === filter.toString().toUpperCase();
  });

  const totalValue = collection.reduce((sum, c) => sum + (c.marketValue || 0), 0);
  const compareStatsValue = (statKey: keyof PlayerStats, p1: PlayerCard, p2: PlayerCard) => 
    p1.stats[statKey] > p2.stats[statKey] ? 1 : p1.stats[statKey] < p2.stats[statKey] ? 2 : 0;

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0a0a0c] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar Navigation */}
      <aside className={`w-full md:w-[22rem] p-8 glass border-r flex flex-col gap-8 h-screen sticky top-0 z-30 overflow-y-auto ${theme === 'dark' ? 'bg-[#0a0a0c]/80 border-white/10' : 'bg-white/95 border-slate-200 shadow-2xl'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center bg-blue-600 shadow-xl shadow-blue-600/30 transform rotate-3"><Trophy className="text-white" size={28} /></div>
            <div>
              <h1 className="font-oswald text-2xl font-bold uppercase tracking-tight leading-none mb-1">FootyCards</h1>
              <p className="text-[10px] uppercase font-black opacity-40 tracking-widest leading-none">AI Lab v2.0</p>
            </div>
          </div>
          <button onClick={toggleTheme} className={`p-3 rounded-2xl transition-all ${theme === 'dark' ? 'bg-white/10 text-yellow-400 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2"><Search size={14} /> Scouting Module</h2>
            <button onClick={() => setIsAdvanced(!isAdvanced)} className={`p-1.5 rounded-lg transition-colors ${isAdvanced ? 'bg-blue-600 text-white' : 'opacity-60 hover:opacity-100'}`}><Settings2 size={16} /></button>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Scout player name..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              disabled={isScouting} 
              className={`w-full rounded-2xl px-6 py-5 text-sm border focus:ring-4 focus:ring-blue-600/20 outline-none transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white placeholder-white/20' : 'bg-slate-100 border-slate-200 text-slate-900'}`} 
              onKeyDown={(e) => e.key === 'Enter' && handleScout()} 
            />
            <button onClick={handleScout} disabled={isScouting} className="absolute right-3 top-3 p-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white shadow-lg transition-all active:scale-95">
              {isScouting ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
            </button>
          </div>
          {isAdvanced && (
            <div className={`p-6 rounded-[1.5rem] border space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 ${theme === 'dark' ? 'bg-blue-900/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase opacity-60 flex items-center gap-1.5"><LinkIcon size={12}/> Asset Bypass</label>
                <input type="text" value={customImageUrl} onChange={(e) => setCustomImageUrl(e.target.value)} className={`w-full rounded-xl px-4 py-3 text-xs border bg-transparent outline-none focus:border-blue-500 ${theme === 'dark' ? 'border-white/10' : 'border-slate-300'}`} placeholder="Bypass generation filters..." />
              </div>
              <div onClick={() => fileInputRef.current?.click()} className="w-full py-5 border-2 border-dashed rounded-[1.25rem] flex flex-col items-center cursor-pointer hover:bg-blue-500/10 transition-colors border-blue-500/30">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                <Upload size={20} className="text-blue-500 mb-1" />
                <span className="text-[10px] uppercase font-black text-blue-500">Manual Asset Draft</span>
              </div>
            </div>
          )}
          {scoutError && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[11px] text-red-500 font-bold flex items-center gap-2 animate-in slide-in-from-left-2"><AlertCircle size={14} /> {scoutError}</div>}
          {isScouting && (
            <div className="flex flex-col items-center gap-3 py-6 animate-pulse">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] text-blue-500 uppercase font-black tracking-[0.2em]">{scoutProgress}</p>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-6">
          <button 
            onClick={() => { setIsComparisonMode(!isComparisonMode); setComparisonSelection([]); setSelectedCard(null); }} 
            className={`w-full py-5 rounded-[1.5rem] font-bold text-xs uppercase flex items-center justify-center gap-3 border transition-all duration-500 ${isComparisonMode ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40 border-blue-500' : (theme === 'dark' ? 'hover:bg-white/5 border-white/10' : 'hover:bg-slate-100 border-slate-200')}`}
          >
            <Swords size={20} /> {isComparisonMode ? 'Exit Battle Mode' : 'Enter Battle Arena'}
          </button>
          
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-5 rounded-[1.5rem] border transition-all hover:border-blue-500/50 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
              <p className="text-[9px] uppercase font-black opacity-40 mb-1">Treasury</p>
              <p className="text-2xl font-oswald leading-none">{collection.length}</p>
            </div>
            <div className={`p-5 rounded-[1.5rem] border transition-all hover:border-blue-500/50 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
              <p className="text-[9px] uppercase font-black opacity-40 mb-1">Squad Val.</p>
              <p className="text-2xl font-oswald text-blue-500 leading-none">€{(totalValue / 1000000).toFixed(1)}M</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2"><Filter size={14} /> Tier Filters</h2>
            <button 
              onClick={() => setFilter('ALL')} 
              className={`w-full text-[10px] font-black px-4 py-3.5 rounded-2xl border transition-all text-left flex justify-between items-center ${filter === 'ALL' ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'opacity-40 hover:opacity-100 border-transparent hover:bg-white/5'}`}
            >
              All Assets <span>{collection.length}</span>
            </button>
            <div className="grid grid-cols-1 gap-2">
              {Object.values(PlayerRarity).map(r => (
                <button 
                  key={r} 
                  onClick={() => setFilter(r as any)} 
                  className={`text-[10px] font-black px-4 py-3.5 rounded-2xl border flex items-center gap-3 transition-all ${filter === r ? getRarityColorClasses(r) : 'opacity-40 hover:opacity-100 border-transparent hover:bg-white/5'}`}
                >
                  {getRarityIcon(r, 16)} {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Pitch */}
      <main className="flex-1 p-8 md:p-16 overflow-y-auto h-screen relative scroll-smooth">
        <div className="max-w-7xl mx-auto">
          {isRevealing && selectedCard ? (
            <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in zoom-in-95 fade-in duration-1000">
              <div 
                onClick={() => setIsRevealing(false)} 
                className={`w-80 aspect-[3/4] rounded-[1.5rem] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-2xl cursor-pointer transition-all hover:scale-110 active:scale-95 group relative animate-float border border-white/10 ${selectedCard.rarity.toUpperCase().includes('LEGENDARY') ? 'from-yellow-600 to-yellow-800 shadow-yellow-500/50' : ''}`}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]" />
                <div className="flex flex-col items-center">
                   <Sparkles className="text-white animate-pulse mb-4" size={64} />
                   <p className="font-oswald text-2xl text-white uppercase tracking-tighter">Draft Asset</p>
                </div>
                <div className="absolute -bottom-20 w-full text-center">
                   <p className="text-sm font-black uppercase tracking-[0.4em] text-blue-500 animate-pulse">Validation Success</p>
                   <p className="text-[10px] uppercase font-bold opacity-40 mt-3">Tap to reveal asset</p>
                </div>
              </div>
            </div>
          ) : isComparisonMode && comparisonSelection.length === 2 ? (
            /* Battle Arena Mode */
            <div className="space-y-16 animate-in fade-in duration-700">
              <div className="flex justify-between items-center border-b pb-8 border-current opacity-10">
                <h2 className="text-4xl font-oswald uppercase flex items-center gap-4"><Swords className="text-blue-500" size={40} /> Battle Arena Protocol</h2>
                <button 
                  onClick={() => setComparisonSelection([])} 
                  className={`text-xs font-black uppercase border px-6 py-3 rounded-2xl transition-all active:scale-95 ${theme === 'dark' ? 'border-red-500 text-red-500 hover:bg-red-500/10' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                >
                  Clear Selection
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-12 items-start relative">
                <div className="space-y-12 animate-in slide-in-from-left-8 duration-700">
                  <CardItem card={comparisonSelection[0]} theme={theme} onDelete={()=>{}} onClick={()=>{}} isComparisonMode />
                  <div className={`grid grid-cols-1 gap-6 p-8 rounded-[1.5rem] glass border ${theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-white/70 border-slate-200 shadow-md'}`}>
                    {(Object.keys(comparisonSelection[0].stats) as Array<keyof PlayerStats>).map(s => (
                      <StatBar key={s} label={s} value={comparisonSelection[0].stats[s]} theme={theme} highlight={compareStatsValue(s, comparisonSelection[0], comparisonSelection[1]) === 1} />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="w-px h-full bg-gradient-to-b from-transparent via-current to-transparent opacity-10 absolute left-1/2 -translate-x-1/2 hidden md:block" />
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-blue-600 flex items-center justify-center font-oswald text-5xl font-bold shadow-[0_0_60px_rgba(37,99,235,0.6)] z-10 transform -rotate-12 border-4 border-white text-white">VS</div>
                </div>

                <div className="space-y-12 animate-in slide-in-from-right-8 duration-700">
                  <CardItem card={comparisonSelection[1]} theme={theme} onDelete={()=>{}} onClick={()=>{}} isComparisonMode />
                  <div className={`grid grid-cols-1 gap-6 p-8 rounded-[1.5rem] glass border ${theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-white/70 border-slate-200 shadow-md'}`}>
                    {(Object.keys(comparisonSelection[1].stats) as Array<keyof PlayerStats>).map(s => (
                      <StatBar key={s} label={s} value={comparisonSelection[1].stats[s]} theme={theme} highlight={compareStatsValue(s, comparisonSelection[0], comparisonSelection[1]) === 2} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : selectedCard ? (
            /* Detailed View Mode */
            <div ref={detailTopRef} className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-16 animate-in slide-in-from-bottom-8 duration-700 items-start pb-20">
              <div className="flex flex-col items-center gap-8 lg:sticky lg:top-8 lg:self-start">
                <div className={`w-full max-w-sm rounded-[1.5rem] glass p-6 border transition-all duration-700 ${selectedCard.rarity.toString().toUpperCase().includes('LEGENDARY') ? 'border-yellow-500/50 shadow-2xl shadow-yellow-500/20' : (theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 shadow-2xl bg-white/70')}`}>
                  <div className="aspect-[3/4] rounded-[1.25rem] overflow-hidden mb-8 bg-slate-900 flex items-center justify-center relative shadow-inner">
                    {selectedCard.imageUrl ? (
                      <img 
                        src={selectedCard.imageUrl} 
                        className="w-full h-full object-cover" 
                        alt={selectedCard.name} 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <ImageIcon className="text-white/5" size={64} />
                    )}
                    {(selectedCard.rarity.toUpperCase().includes('LEGENDARY') || selectedCard.rarity.toUpperCase().includes('EPIC')) && <div className="absolute inset-0 card-shimmer pointer-events-none opacity-40" />}
                  </div>
                  <div className="space-y-8 px-2 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.3em] leading-none mb-2">{selectedCard.position}</p>
                        <h2 className="text-4xl font-oswald uppercase leading-none">{selectedCard.name}</h2>
                      </div>
                      <RarityBadge rarity={selectedCard.rarity} />
                    </div>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                      {(Object.entries(selectedCard.stats) as [keyof PlayerStats, number][]).map(([l, v]) => (
                        <StatBar key={l} label={l} value={v} theme={theme} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 w-full max-w-sm">
                  {isEditingUrl ? (
                    <div className="flex flex-col gap-2 p-4 rounded-2xl glass border border-blue-500/30 animate-in fade-in">
                      <input 
                        type="text" 
                        value={newAssetUrl} 
                        onChange={(e) => setNewAssetUrl(e.target.value)} 
                        placeholder="Paste image URL here..." 
                        className={`w-full rounded-xl px-4 py-3 text-[10px] border outline-none focus:border-blue-500 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200'}`}
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={handleUpdateImageManual} 
                          className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-blue-700"
                        >
                          <Save size={14} /> Commit Changes
                        </button>
                        <button 
                          onClick={() => { setIsEditingUrl(false); setNewAssetUrl(''); }} 
                          className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase border ${theme === 'dark' ? 'border-white/10 text-white hover:bg-white/10' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setIsEditingUrl(true); setNewAssetUrl(selectedCard.imageUrl); }} 
                      className={`py-4 px-8 rounded-2xl text-[11px] font-black uppercase flex items-center justify-center gap-3 border transition-all transform hover:scale-[1.02] ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-900'}`}
                    >
                      <LinkIcon size={16} /> Asset Override Module
                    </button>
                  )}

                  <button 
                    onClick={() => setSelectedCard(null)} 
                    className={`py-4 px-8 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border transition-all transform hover:scale-[1.02] ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-900'}`}
                  >
                    Return to Treasury
                  </button>
                </div>
              </div>

              <div className="space-y-12 py-4">
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-3"><Sparkles size={16} className="text-blue-500" /> Scout's Intel Report</h3>
                  <div className={`p-10 rounded-[1.5rem] border shadow-sm relative overflow-hidden ${theme === 'dark' ? 'bg-white/[0.03] border-white/10 italic font-medium' : 'bg-white/80 border-slate-200 italic'}`}>
                    <p className="text-xl leading-relaxed opacity-90">"{selectedCard.description}"</p>
                    <div className="absolute top-0 right-0 p-8 opacity-5"><Briefcase size={80} /></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className={`p-8 rounded-[1.5rem] glass border shadow-sm ${theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-white/70 border-slate-200'}`}>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">Market Valuation</h3>
                    <p className="text-5xl font-oswald text-blue-600 leading-none">€{(selectedCard.marketValue / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className={`p-8 rounded-[1.5rem] glass border shadow-sm ${theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-white/70 border-slate-200'}`}>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">Registration</h3>
                    <p className="text-2xl font-oswald uppercase leading-none mb-1">{selectedCard.club}</p>
                    <p className="text-sm font-bold uppercase tracking-widest text-blue-600 leading-none">{selectedCard.nationality}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    className="flex-1 py-5 bg-blue-600 hover:bg-blue-700 transition-all rounded-[1.5rem] text-sm font-black uppercase tracking-widest text-white shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3 transform hover:translate-y-[-2px]" 
                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(selectedCard.name)}+football+news`, '_blank')}
                  >
                    <ExternalLink size={18} /> Deep Intel Link
                  </button>
                </div>

                {selectedCard.groundingSources && selectedCard.groundingSources.length > 0 && (
                  <div className="space-y-6 pt-6 border-t border-current opacity-10">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-3"><Globe size={16} className="text-blue-500" /> Grounded Verifiers</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedCard.groundingSources.map((source, i) => (
                        <a 
                          key={i} 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`px-5 py-3 rounded-2xl border text-[11px] font-bold flex items-center gap-3 transition-all max-w-xs truncate ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-600/50' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 hover:border-blue-600/50'}`}
                        >
                          <ExternalLink size={14} className="shrink-0 text-blue-600" /> <span className="truncate">{source.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Treasury Grid Mode */
            <div className="space-y-12 pb-12">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b pb-8 border-current opacity-10">
                 <div>
                   <h2 className="text-5xl font-oswald uppercase leading-none mb-2">Squad Treasury</h2>
                   <p className="text-[11px] uppercase font-black tracking-[0.4em] opacity-40">Monitoring {filteredCollection.length} Data Entities</p>
                 </div>
                 {isComparisonMode && (
                   <div className="px-6 py-4 bg-blue-600/10 text-blue-600 rounded-3xl border border-blue-600/20 text-[10px] font-black uppercase flex items-center gap-3 animate-pulse">
                     <Swords size={16} /> Battle Arena Selection: {comparisonSelection.length}/2
                   </div>
                 )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {filteredCollection.length > 0 ? (
                  filteredCollection.map(c => (
                    <CardItem 
                      key={c.id} 
                      card={c} 
                      onDelete={id => setCollection(prev => prev.filter(x => x.id !== id))} 
                      onClick={handleCardClick} 
                      theme={theme} 
                      isSelected={comparisonSelection.some(x => x.id === c.id)} 
                      isComparisonMode={isComparisonMode} 
                    />
                  ))
                ) : (
                  <div className="col-span-full h-[35rem] flex flex-col items-center justify-center opacity-10 border-4 border-dashed rounded-[2rem] border-current">
                    <Trophy size={100} className="mb-8" />
                    <h3 className="font-oswald text-4xl uppercase tracking-tighter">Treasury Empty</h3>
                    <p className="text-xs font-black uppercase tracking-[0.4em] mt-4">Initiate scouting sequence to recruit athletes</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}