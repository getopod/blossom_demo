
import React, { useState, useEffect, useCallback } from 'react';
import { Screen, UserData, Dispensary, Strain, JournalEntry } from './types';
import { subscribeToAuthChanges, signInWithGoogle, logout } from './firebase';
import { findDispensaries, generateFlight } from './geminiService';

// --- Static Data ---

const TERPENE_DATA: Record<string, { desc: string, icon: string }> = {
  "Myrcene": { desc: "Herbal & earthy. Promotes relaxation and 'couch-lock' effects.", icon: "🌿" },
  "Limonene": { desc: "Citrusy. Uplifting, mood-enhancing, and stress-relieving.", icon: "🍋" },
  "Caryophyllene": { desc: "Peppery & spicy. Known for anti-inflammatory and pain-relieving properties.", icon: "🌶️" },
  "Pinene": { desc: "Pine aroma. May boost alertness and counteract short-term memory loss.", icon: "🌲" },
  "Linalool": { desc: "Floral & lavender. Deeply calming and helpful for sleep/anxiety.", icon: "🪻" },
  "Humulene": { desc: "Woody & earthy. Found in hops, may suppress appetite.", icon: "🪵" },
  "Terpinolene": { desc: "Floral, herbal, & citrus. Often found in Sativas; uplifting yet sedative.", icon: "🌸" },
  "Ocimene": { desc: "Sweet, woody, & herbal. Associated with antiviral and decongestant effects.", icon: "🍃" }
};

// --- Components ---

const LoadingIndicator: React.FC<{ message?: string; dark?: boolean }> = ({ message = "Loading...", dark = false }) => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className={`w-12 h-12 border-4 ${dark ? 'border-white/20 border-t-white' : 'border-pink-100 border-t-pink-600'} rounded-full animate-spin`}></div>
    {message && <p className={`text-sm font-medium animate-pulse ${dark ? 'text-white/60' : 'text-slate-400'}`}>{message}</p>}
  </div>
);

const Button: React.FC<{ 
  onClick: () => void; 
  disabled?: boolean; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'demo' | 'danger';
  children: React.ReactNode;
  className?: string;
}> = ({ onClick, disabled, variant = 'primary', children, className = "" }) => {
  const base = "w-full py-4 px-6 rounded-full font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm tracking-wide";
  const styles = {
    primary: "bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xl shadow-pink-200",
    secondary: "bg-slate-900 text-white shadow-lg",
    outline: "border-2 border-slate-100 text-slate-700 hover:border-pink-200 hover:bg-pink-50/30",
    ghost: "text-slate-400 hover:text-slate-600 hover:bg-slate-50",
    demo: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    danger: "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100"
  };
  
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Logo = ({ size = 60, color = "#db2777" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="drop-shadow-sm">
    <ellipse cx="50" cy="25" rx="18" ry="22" fill={color} />
    <ellipse cx="25" cy="45" rx="18" ry="22" fill={color} transform="rotate(-72 25 45)" />
    <ellipse cx="35" cy="75" rx="18" ry="22" fill={color} transform="rotate(-144 35 75)" />
    <ellipse cx="65" cy="75" rx="18" ry="22" fill={color} transform="rotate(-216 65 75)" />
    <ellipse cx="75" cy="45" rx="18" ry="22" fill={color} transform="rotate(-288 75 45)" />
    <circle cx="50" cy="50" r="12" fill="white" />
    <path d="M50 42 L50 58 M44 48 L50 42 L56 48 M44 52 L50 58 L56 52" stroke={color} strokeWidth="2" fill="none" />
  </svg>
);

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.AUTH);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [dispensaries, setDispensaries] = useState<Dispensary[]>([]);
  const [selectedDispensary, setSelectedDispensary] = useState<Dispensary | null>(null);
  const [flight, setFlight] = useState<Strain[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Traveler',
          photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
          age: null,
          sex: '',
          effects: [],
          journal: {}
        });
        setCurrentScreen(Screen.ONBOARDING);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleDemoMode = () => {
    setUser({
      uid: 'demo-user-123',
      email: 'demo@blossom.ai',
      displayName: 'Demo',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      age: null,
      sex: '',
      effects: [],
      journal: {}
    });
    setCurrentScreen(Screen.ONBOARDING);
  };

  const handleAgeCheck = () => {
    if (user && user.age !== null) {
      if (user.age < 21) {
        setCurrentScreen(Screen.BLOCKED);
      } else {
        setCurrentScreen(Screen.LOCATION);
      }
    }
  };

  const handleLocationFetch = useCallback(async () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        if (user) {
          setUser({ ...user, location: { lat: latitude, lng: longitude } });
        }
        const nearby = await findDispensaries(latitude, longitude);
        setDispensaries(nearby);
        setLoading(false);
        setCurrentScreen(Screen.EFFECTS);
      },
      () => {
        findDispensaries(37.7749, -122.4194).then(nearby => {
          setDispensaries(nearby);
          setLoading(false);
          setCurrentScreen(Screen.EFFECTS);
        });
      }
    );
  }, [user]);

  const handleFlightGeneration = async () => {
    if (!user || user.effects.length === 0) return;
    setLoading(true);
    setCurrentScreen(Screen.LOADING);
    try {
      const results = await generateFlight(user.effects);
      setFlight(results);
      const newJournal: Record<string, JournalEntry> = { ...user.journal };
      results.forEach(s => {
        if (!newJournal[s.name]) {
          newJournal[s.name] = {
            strainName: s.name,
            acquired: false,
            ratings: user.effects.reduce((acc, effect) => {
              acc[effect] = { score: 0, comment: '' };
              return acc;
            }, {} as Record<string, { score: number; comment: string }>)
          };
        }
      });
      setUser({ ...user, journal: newJournal });
      setCurrentScreen(Screen.FLIGHT);
    } catch (e) {
      setCurrentScreen(Screen.DISPENSARIES);
    } finally {
      setLoading(false);
    }
  };

  const AuthScreen = () => (
    <div className="h-full flex flex-col justify-center items-center px-10 bg-white text-center">
      <div className="mb-10"><Logo size={110} /></div>
      <h1 className="font-serif text-5xl mb-4 tracking-tight text-slate-900">Blossom</h1>
      <p className="text-slate-400 mb-12 text-sm leading-relaxed max-w-[240px]">Personalized cannabis curation.</p>
      <div className="w-full space-y-3">
        <Button onClick={() => signInWithGoogle().catch(handleDemoMode)} variant="outline">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt=""/>
          Continue with Google
        </Button>
        <Button onClick={handleDemoMode} variant="demo">
          Try as Guest (Demo Mode)
        </Button>
        <Button onClick={() => setCurrentScreen(Screen.TERPENES_LIBRARY)} variant="ghost">
          Learn About Terpenes
        </Button>
      </div>
    </div>
  );

  const TerpenesLibraryScreen = () => (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10 bg-white">
        <h2 className="font-serif text-3xl text-slate-900">Terpene Guide</h2>
        <button onClick={() => setCurrentScreen(user ? Screen.FLIGHT : Screen.AUTH)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        {Object.entries(TERPENE_DATA).map(([name, data]) => (
          <div key={name} className="p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-3xl">{data.icon}</span>
              <h3 className="text-xl font-bold text-slate-800">{name}</h3>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">{data.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const BlockedScreen = () => (
    <div className="h-full flex flex-col justify-center items-center px-10 text-center bg-white">
      <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-8 text-4xl shadow-inner">🚫</div>
      <h2 className="font-serif text-3xl mb-4 text-slate-900">Adults Only</h2>
      <p className="text-slate-400 mb-12 text-sm leading-relaxed">Blossom is for adults. Come back when you are older.</p>
      <Button onClick={() => { setUser(null); setCurrentScreen(Screen.AUTH); logout(); }} variant="secondary">Exit</Button>
    </div>
  );

  const OnboardingScreen = () => {
    const isReady = user?.age && user?.sex;
    return (
      <div className="h-full flex flex-col p-8 bg-white">
        <div className="mb-12">
          <h2 className="font-serif text-3xl mb-2 text-slate-900">Who are you?</h2>
        </div>
        <div className="flex-1 space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] uppercase font-black text-slate-300 tracking-[0.2em]">Age</label>
            <input 
              type="number" 
              placeholder="e.g. 28" 
              className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:border-pink-500 transition-all text-xl font-medium"
              value={user?.age || ''}
              onChange={(e) => setUser(u => u ? ({...u, age: parseInt(e.target.value)}) : null)}
            />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] uppercase font-black text-slate-300 tracking-[0.2em]">Sex</label>
            <div className="grid grid-cols-3 gap-4">
              {['Female', 'Male', 'No'].map(s => (
                <button 
                  key={s}
                  onClick={() => setUser(u => u ? ({...u, sex: s}) : null)}
                  className={`py-5 rounded-3xl border-2 transition-all font-bold text-sm ${user?.sex === s ? 'border-pink-600 bg-pink-50 text-pink-600 shadow-md' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Button disabled={!isReady} onClick={handleAgeCheck}>Continue</Button>
      </div>
    );
  };

  const LocationScreen = () => (
    <div className="h-full flex flex-col p-10 bg-white text-center justify-center items-center">
      <div className="w-28 h-28 bg-rose-50 rounded-full flex items-center justify-center mb-10 shadow-inner">
        <span className="text-5xl animate-bounce">📍</span>
      </div>
      <h2 className="font-serif text-3xl mb-4 text-slate-900">Location</h2>
      <p className="text-slate-400 text-sm mb-12 leading-relaxed">We need this to give real advice.</p>
      <Button onClick={handleLocationFetch} disabled={loading}>
        {loading ? <LoadingIndicator message="" /> : 'Enable Location'}
      </Button>
    </div>
  );

  const EffectsScreen = () => {
    const options = [
      { id: 'relaxed', label: 'Relaxed', icon: '😌' },
      { id: 'creative', label: 'Creative', icon: '🎨' },
      { id: 'happy', label: 'Happy', icon: '😊' },
      { id: 'focused', label: 'Focused', icon: '🎯' },
      { id: 'sleepy', label: 'Sleepy', icon: '😴' },
      { id: 'energetic', label: 'Energetic', icon: '⚡' },
      { id: 'social', label: 'Social', icon: '🗣️' },
      { id: 'pain-relief', label: 'Comfort', icon: '🩹' },
    ];
    const toggleEffect = (id: string) => {
      if (!user) return;
      const effects = user.effects.includes(id) 
        ? user.effects.filter(e => e !== id) 
        : [...user.effects, id].slice(0, 4);
      setUser({...user, effects});
    };
    return (
      <div className="h-full flex flex-col p-8 bg-white">
        <h2 className="font-serif text-3xl mb-2 text-slate-900">How do you want to feel?</h2>
        <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto no-scrollbar pb-6">
          {options.map(o => (
            <button 
              key={o.id} 
              onClick={() => toggleEffect(o.id)} 
              className={`p-6 rounded-[2.5rem] border-2 flex flex-col items-center gap-3 transition-all duration-300 ${user?.effects.includes(o.id) ? 'border-pink-600 bg-pink-50 shadow-lg scale-[1.02]' : 'border-slate-50 bg-slate-50 opacity-70'}`}
            >
              <span className="text-3xl">{o.icon}</span>
              <span className="font-bold text-[10px] uppercase tracking-widest text-slate-600">{o.label}</span>
            </button>
          ))}
        </div>
        <Button disabled={user?.effects.length === 0} onClick={() => setCurrentScreen(Screen.DISPENSARIES)}>Find Matches</Button>
      </div>
    );
  };

  const DispensaryListScreen = () => (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center">
        <h2 className="font-serif text-3xl text-slate-900">Dispensaries</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
        {dispensaries.map(d => (
          <div 
            key={d.id} 
            onClick={() => setSelectedDispensary(d)} 
            className={`p-6 rounded-[2rem] bg-white border-2 cursor-pointer transition-all duration-300 ${selectedDispensary?.id === d.id ? 'border-pink-600 shadow-xl' : 'border-transparent shadow-sm'}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className={`font-bold ${selectedDispensary?.id === d.id ? 'text-pink-600' : 'text-slate-800'}`}>{d.name}</h3>
              <span className="text-pink-500 font-bold text-[10px]">{d.distance}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-4">
              <span className="text-yellow-400">★</span>
              <span className="font-bold text-slate-600">{d.rating}</span>
              <span>({d.reviewsCount})</span>
            </div>
            <div className="text-[10px] text-slate-300 mb-2">{d.address}</div>
            {/* Displaying grounding link as required by Gemini grounding guidelines */}
            {d.uri && (
              <a 
                href={d.uri} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-pink-600 underline text-[10px] font-bold block transition-opacity hover:opacity-70"
                onClick={(e) => e.stopPropagation()}
              >
                View on Google Maps
              </a>
            )}
          </div>
        ))}
      </div>
      <div className="p-8 bg-white border-t border-slate-100">
        <Button disabled={!selectedDispensary} onClick={handleFlightGeneration}>Curate My Flight</Button>
      </div>
    </div>
  );

  const LoadingScreen = () => (
    <div className="h-full flex flex-col justify-center items-center p-12 bg-white text-center">
      <Logo size={90} />
      <div className="mt-12"><LoadingIndicator message="Doing Some Magic..." /></div>
    </div>
  );

  const FlightScreen = () => {
    const [expandedStrains, setExpandedStrains] = useState<Set<number>>(new Set());
    const [expandedTerpene, setExpandedTerpene] = useState<string | null>(null);

    const toggleStrain = (index: number) => {
      const next = new Set(expandedStrains);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      setExpandedStrains(next);
    };

    return (
      <div className="h-full flex flex-col bg-white">
        <div className="p-8 border-b border-slate-100 flex justify-between items-end bg-white sticky top-0 z-10">
          <div>
            <h2 className="font-serif text-3xl text-slate-900">Your Flight</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentScreen(Screen.TERPENES_LIBRARY)} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl shadow-sm border border-slate-100">
              📚
            </button>
            <button onClick={() => setCurrentScreen(Screen.PROFILE)} className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-pink-50 transition-transform active:scale-90">
              <img src={user?.photoURL} alt="" className="w-full h-full object-cover" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {flight.map((s, i) => {
            const isExpanded = expandedStrains.has(i);
            return (
              <div key={i} className="bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => toggleStrain(i)}
                  className="w-full p-7 flex items-center justify-between"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-lg">{i+1}</div>
                    <h3 className="font-bold text-xl text-slate-900 text-left">{s.name}</h3>
                  </div>
                  <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-7 pb-7 space-y-6 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center border-t border-slate-200 pt-4">
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{s.brand}</p>
                      <div className="bg-white px-3 py-1.5 rounded-2xl text-pink-600 font-black text-[10px] shadow-sm border border-pink-50">{s.thc} THC</div>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed italic">"{s.description}"</p>
                    <div className="flex flex-wrap gap-2">
                      {s.terpenes.map(t => {
                        const info = TERPENE_DATA[t] || { icon: "✨", desc: "A minor terpene adding to the entourage effect." };
                        const isTerpExp = expandedTerpene === `${i}-${t}`;
                        return (
                          <div key={t} className="flex flex-col">
                            <button 
                              onClick={() => setExpandedTerpene(isTerpExp ? null : `${i}-${t}`)}
                              className={`px-3 py-2 rounded-xl font-bold text-[9px] uppercase tracking-widest border transition-all ${isTerpExp ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-100 shadow-sm'}`}
                            >
                              {t}
                            </button>
                            {isTerpExp && (
                              <div className="mt-2 p-3 bg-white border border-slate-100 rounded-xl shadow-lg z-20 max-w-[200px] animate-in zoom-in-95">
                                <p className="text-[10px] text-slate-600 leading-normal">
                                  <span className="mr-1">{info.icon}</span>
                                  {info.desc}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="p-8 bg-white border-t border-slate-100">
          <Button onClick={() => setCurrentScreen(Screen.PROFILE)}>View Journal & Rates</Button>
        </div>
      </div>
    );
  };

  const ProfileScreen = () => {
    const [tab, setTab] = useState<'settings' | 'journal'>('journal');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(user);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedDetails, setExpandedDetails] = useState<string | null>(null);

    const updateJournal = (strainName: string, updates: Partial<JournalEntry>) => {
      if (!user) return;
      const newJournal = { ...user.journal };
      newJournal[strainName] = { ...newJournal[strainName], ...updates };
      setUser({ ...user, journal: newJournal });
    };

    const updateRating = (strainName: string, effect: string, score: number) => {
      if (!user) return;
      const entry = user.journal[strainName];
      const newRatings = { ...entry.ratings };
      newRatings[effect] = { ...newRatings[effect], score };
      updateJournal(strainName, { ratings: newRatings });
    };

    const updateComment = (strainName: string, effect: string, comment: string) => {
      if (!user) return;
      const entry = user.journal[strainName];
      const newRatings = { ...entry.ratings };
      newRatings[effect] = { ...newRatings[effect], comment };
      updateJournal(strainName, { ratings: newRatings });
    };

    const clearJournal = () => {
      if (user) {
        setUser({ ...user, journal: {} });
      }
      setShowClearConfirm(false);
    };

    const handleSave = () => {
      if (editData) setUser(editData);
      setIsEditing(false);
    };

    const filteredJournal = flight.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="h-full flex flex-col bg-white overflow-hidden relative">
        {/* header */}
        <div className="p-8 bg-slate-900 text-white text-center relative overflow-hidden">
          <button onClick={() => setCurrentScreen(Screen.FLIGHT)} className="absolute left-8 top-10 text-white/50 hover:text-white transition-colors">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div className="w-20 h-20 rounded-[1.8rem] border-4 border-white/10 mx-auto mb-4 overflow-hidden shadow-2xl">
            <img src={user?.photoURL} alt="" className="w-full h-full object-cover"/>
          </div>
          <h2 className="font-serif text-2xl mb-1">{user?.displayName}</h2>
          
          {/* tabs */}
          <div className="mt-8 flex bg-white/5 rounded-2xl p-1 relative z-10">
            <button 
              onClick={() => setTab('journal')} 
              className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${tab === 'journal' ? 'bg-white text-slate-900 shadow-lg' : 'text-white/40'}`}
            >
              Journal
            </button>
            <button 
              onClick={() => setTab('settings')} 
              className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${tab === 'settings' ? 'bg-white text-slate-900 shadow-lg' : 'text-white/40'}`}
            >
              Settings
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {tab === 'settings' ? (
            <div className="p-8 space-y-8">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Name</label>
                    <input 
                      value={editData?.displayName} 
                      onChange={e => setEditData(d => d ? ({...d, displayName: e.target.value}) : null)} 
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:border-pink-500 transition-all font-medium"
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button onClick={handleSave}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                   <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <span className="text-[10px] font-black text-slate-300 uppercase block mb-2 tracking-widest">Age</span>
                      <span className="font-bold text-2xl text-slate-800">{user?.age || '—'}</span>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <span className="text-[10px] font-black text-slate-300 uppercase block mb-2 tracking-widest">Sex</span>
                      <span className="font-bold text-2xl text-slate-800">{user?.sex || '—'}</span>
                    </div>
                  </div>
                  <div className="space-y-3 pt-6">
                    <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    <Button variant="danger" onClick={() => setShowClearConfirm(true)}>Clear Journal</Button>
                    <Button variant="ghost" onClick={() => { setUser(null); setCurrentScreen(Screen.AUTH); logout(); }}>Sign Out</Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 space-y-6">
              <div className="relative mb-4">
                <input 
                  type="text" 
                  placeholder="Search strains..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:border-pink-500 focus:bg-white transition-all text-sm"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                </div>
              </div>

              <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-2">Your Entries</h4>
              
              {filteredJournal.length === 0 && (
                <div className="py-20 text-center text-slate-300 italic text-sm">No matches found.</div>
              )}

              {filteredJournal.map((s, i) => {
                const entry = user?.journal[s.name];
                if (!entry) return null;
                const isDetExpanded = expandedDetails === s.name;

                return (
                  <div key={i} className={`p-6 rounded-[2.5rem] border-2 transition-all ${entry.acquired ? 'border-pink-100 bg-white shadow-md' : 'border-slate-50 bg-slate-50 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={entry.acquired} 
                          onChange={(e) => updateJournal(s.name, { acquired: e.target.checked })}
                          className="w-5 h-5 accent-pink-600 rounded-lg"
                        />
                        <h3 className="font-bold text-slate-900">{s.name}</h3>
                      </div>
                      {entry.acquired && <span className="text-[8px] bg-pink-600 text-white px-2 py-1 rounded-full font-black uppercase">Tried</span>}
                    </div>

                    {entry.acquired && (
                      <div className="space-y-6 mt-6 pt-6 border-t border-pink-50 animate-in fade-in">
                        {/* Collapsible Details */}
                        <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                          <button 
                            onClick={() => setExpandedDetails(isDetExpanded ? null : s.name)}
                            className="w-full p-4 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest"
                          >
                            <span>Strain Info</span>
                            <span className={`transition-transform ${isDetExpanded ? 'rotate-180' : ''}`}>▼</span>
                          </button>
                          {isDetExpanded && (
                            <div className="p-4 pt-0 space-y-4 animate-in slide-in-from-top-2">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-400">THC: {s.thc}</span>
                                <span className="text-slate-400">CBD: {s.cbd}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 italic">"{s.description}"</p>
                              <div className="flex flex-wrap gap-1">
                                {s.terpenes.map(t => (
                                  <span key={t} className="text-[9px] bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-500">{t}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {user?.effects.map(effect => (
                          <div key={effect} className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest capitalize">{effect}</span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button 
                                    key={star} 
                                    onClick={() => updateRating(s.name, effect, star)}
                                    className={`text-lg transition-transform active:scale-125 ${star <= entry.ratings[effect].score ? 'text-pink-600' : 'text-slate-200'}`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                            </div>
                            <textarea 
                              placeholder="Notes..."
                              value={entry.ratings[effect].comment}
                              onChange={(e) => updateComment(s.name, effect, e.target.value)}
                              className="w-full p-4 bg-slate-50 rounded-2xl text-xs outline-none focus:bg-white focus:border-pink-200 border border-transparent transition-all resize-none h-20"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Clear Confirm Modal */}
        {showClearConfirm && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-8 animate-in fade-in">
            <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-[300px] shadow-2xl space-y-6 text-center animate-in zoom-in-95">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-3xl">🗑️</div>
              <div>
                <h3 className="font-serif text-2xl text-slate-900 mb-2">Clear Journal?</h3>
                <p className="text-slate-400 text-sm leading-relaxed">This will delete all your session notes forever. You can't undo this.</p>
              </div>
              <div className="space-y-3">
                <Button variant="danger" onClick={clearJournal}>Yes, Clear Everything</Button>
                <Button variant="outline" onClick={() => setShowClearConfirm(false)}>Keep It</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-100 flex items-center justify-center p-0 md:p-10">
      <div className="w-full h-full md:w-[375px] md:h-[667px] bg-white md:rounded-[3.5rem] shadow-2xl overflow-hidden relative flex flex-col border border-slate-200/50">
        {renderScreen(currentScreen, {
          AuthScreen, OnboardingScreen, LocationScreen, 
          EffectsScreen, DispensaryListScreen, LoadingScreen, FlightScreen, 
          ProfileScreen, BlockedScreen, TerpenesLibraryScreen
        })}
      </div>
    </div>
  );
};

function renderScreen(current: Screen, components: any) {
  switch (current) {
    case Screen.AUTH: return <components.AuthScreen />;
    case Screen.ONBOARDING: return <components.OnboardingScreen />;
    case Screen.LOCATION: return <components.LocationScreen />;
    case Screen.EFFECTS: return <components.EffectsScreen />;
    case Screen.DISPENSARIES: return <components.DispensaryListScreen />;
    case Screen.LOADING: return <components.LoadingScreen />;
    case Screen.FLIGHT: return <components.FlightScreen />;
    case Screen.PROFILE: return <components.ProfileScreen />;
    case Screen.BLOCKED: return <components.BlockedScreen />;
    case Screen.TERPENES_LIBRARY: return <components.TerpenesLibraryScreen />;
    default: return <components.AuthScreen />;
  }
}

export default App;
