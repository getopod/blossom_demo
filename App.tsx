
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Screen, UserData, Dispensary, Strain, JournalEntry, FlightRecord } from './types';
import { subscribeToAuthChanges, signInWithGoogle, logout } from './firebase';
import { findDispensaries, generateFlight } from './geminiService';

// static
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

const POPULAR_STRAINS = [
  "Blue Dream", "OG Kush", "Sour Diesel", "Girl Scout Cookies", "Jack Herer", 
  "Northern Lights", "White Widow", "Purple Haze", "Gorilla Glue #4", "Granddaddy Purple",
  "Bubba Kush", "Amnesia Haze", "Wedding Cake", "Pineapple Express", "Green Crack",
  "Bruce Banner", "Durban Poison", "Skywalker OG", "Gelato", "Zkittlez"
];

// components
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
  const [flight, setFlight] = useState<Strain[]>([]);
  const [profileTab, setProfileTab] = useState<'history' | 'profile'>('history');
  const [historySubTab, setHistorySubTab] = useState<'tried' | 'flights' | 'ratings' | 'recent'>('recent');
  const [searchingForStrain, setSearchingForStrain] = useState<string | null>(null);
  const [strainSearchQuery, setStrainSearchQuery] = useState('');
  // Fix: Lifted showClearConfirm state from ProfileScreen to App scope so it is accessible in the main render return.
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        const existingData: Partial<UserData> = JSON.parse(localStorage.getItem(`blossom_${firebaseUser.uid}`) || '{}');
        
        const userData: UserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Traveler',
          photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
          age: existingData.age || null,
          sex: existingData.sex || '',
          location: existingData.location,
          effects: [],
          journal: existingData.journal || {},
          flightsHistory: existingData.flightsHistory || []
        };
        
        setUser(userData);

        if (!userData.age || !userData.sex) {
          setCurrentScreen(Screen.ONBOARDING);
        } else {
          setCurrentScreen(Screen.HOME);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && user.uid) {
      localStorage.setItem(`blossom_${user.uid}`, JSON.stringify(user));
    }
  }, [user]);

  const handleDemoMode = () => {
    const userData: UserData = {
      uid: 'demo-user',
      email: 'demo@blossom.wack',
      displayName: 'Demo',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      age: null,
      sex: '',
      effects: [],
      journal: {},
      flightsHistory: []
    };
    setUser(userData);
    setCurrentScreen(Screen.ONBOARDING);
  };

  const handleAgeCheck = () => {
    if (user && user.age !== null) {
      if (user.age < 21) {
        setCurrentScreen(Screen.BLOCKED);
      } else {
        if (user.location) {
          setCurrentScreen(Screen.HOME);
        } else {
          setCurrentScreen(Screen.LOCATION);
        }
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
        setLoading(false);
        setCurrentScreen(Screen.HOME);
      },
      () => {
        setLoading(false);
        if (user) setUser({ ...user, location: { lat: 37.7749, lng: -122.4194 } });
        setCurrentScreen(Screen.HOME);
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
            timestamp: Date.now(),
            ratings: user.effects.reduce((acc, effect) => {
              acc[effect] = { score: 0, comment: '' };
              return acc;
            }, {} as Record<string, { score: number; comment: string }>)
          };
        }
      });
      
      const newFlightRecord: FlightRecord = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        effects: [...user.effects],
        strains: results
      };

      setUser({ 
        ...user, 
        journal: newJournal,
        flightsHistory: [newFlightRecord, ...(user.flightsHistory || [])]
      });
      setCurrentScreen(Screen.FLIGHT);
    } catch (e) {
      console.error(e);
      setCurrentScreen(Screen.EFFECTS);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyStrain = async (strain: Strain | string) => {
    const strainName = typeof strain === 'string' ? strain : strain.name;
    if (!user?.location) {
      setCurrentScreen(Screen.LOCATION);
      return;
    }
    setSearchingForStrain(strainName);
    setLoading(true);
    setCurrentScreen(Screen.LOADING);
    try {
      const nearby = await findDispensaries(user.location.lat, user.location.lng, strainName);
      setDispensaries(nearby);
      setCurrentScreen(Screen.DISPENSARIES);
    } catch (e) {
      console.error(e);
      setCurrentScreen(Screen.HOME);
    } finally {
      setLoading(false);
    }
  };

  const AuthScreen = () => (
    <div className="h-full flex flex-col justify-center items-center px-10 bg-white text-center">
      <div className="mb-10"><Logo size={110} /></div>
      <h1 className="font-serif text-5xl mb-4 tracking-tight text-slate-900">Blossom</h1>
      <div className="w-full space-y-3">
        <Button onClick={handleDemoMode} variant="demo">
          Demo
        </Button>      
        <Button onClick={() => signInWithGoogle().catch(handleDemoMode)} variant="outline">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt=""/>
          Continue with Google
        </Button>
        <Button onClick={() => setCurrentScreen(Screen.TERPENES_LIBRARY)} variant="outline">
          Terpenes
        </Button>
      </div>
    </div>
  );

  const HomeScreen = () => {
    const filteredStrains = strainSearchQuery 
      ? POPULAR_STRAINS.filter(s => s.toLowerCase().includes(strainSearchQuery.toLowerCase())) 
      : [];

    return (
      <div className="h-full flex flex-col bg-white overflow-hidden">
        <div className="p-6 bg-white border-b border-slate-50 sticky top-0 z-10 shadow-sm">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Strains..." 
              value={strainSearchQuery}
              onChange={(e) => setStrainSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-pink-500 focus:bg-white transition-all text-sm font-medium"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </div>
          </div>
          
          {strainSearchQuery && (
            <div className="mt-4 max-h-48 overflow-y-auto no-scrollbar space-y-2 animate-in slide-in-from-top-2">
              {filteredStrains.length > 0 ? (
                filteredStrains.map(s => (
                  <button 
                    key={s} 
                    onClick={() => handleBuyStrain(s)}
                    className="w-full p-4 flex items-center justify-between bg-pink-50/50 hover:bg-pink-50 rounded-xl transition-colors text-left"
                  >
                    <span className="font-bold text-slate-800 text-sm">{s}</span>
                    <span className="text-pink-500 font-black text-[9px] uppercase tracking-widest">Find Near Me</span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-slate-300 text-xs italic">No matches</div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-10 text-center">
          <div className="mb-10"><Logo size={90} /></div>   
          <div className="w-full space-y-4">
            <Button onClick={() => setCurrentScreen(Screen.EFFECTS)} variant="primary">
              Explore
            </Button>
            <Button onClick={() => {
              setProfileTab('history');
              setCurrentScreen(Screen.PROFILE);
            }} variant="outline">
              Journal
            </Button>
            <Button onClick={() => setCurrentScreen(Screen.TERPENES_LIBRARY)} variant="outline">
              Terpenes
            </Button>
          </div>
        </div>
      </div>
    );
  };

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
              placeholder="" 
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
      <h2 className="font-serif text-3xl mb-4 text-slate-900">Where are you?</h2>
      <Button onClick={handleLocationFetch} disabled={loading}>
        {loading ? <LoadingIndicator message="" /> : 'Enable Location'}
      </Button>
    </div>
  );

  const TerpenesLibraryScreen = () => (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10 bg-white">
        <h2 className="font-serif text-3xl text-slate-900">Terpenes</h2>
        <button onClick={() => setCurrentScreen(user ? Screen.HOME : Screen.AUTH)} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
        {Object.entries(TERPENE_DATA).map(([name, data]) => (
          <div key={name} className="p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">{data.icon}</span>
              <h3 className="text-xl font-bold text-slate-800">{name}</h3>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">{data.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const FlightScreen = () => {
    const [expandedStrains, setExpandedStrains] = useState<Set<number>>(new Set());
    const [expandedTerpenes, setExpandedTerpenes] = useState<Set<string>>(new Set());

    const toggleStrain = (index: number) => {
      const next = new Set(expandedStrains);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      setExpandedStrains(next);
    };

    const toggleTerpene = (t: string, strainIndex: number) => {
      const key = `${strainIndex}-${t}`;
      const next = new Set(expandedTerpenes);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      setExpandedTerpenes(next);
    };

    return (
      <div className="h-full flex flex-col bg-white">
        <div className="p-8 border-b border-slate-100 flex justify-between items-end bg-white sticky top-0 z-10">
          <div>
            <h2 className="font-serif text-3xl text-slate-900">Your Flight</h2>
          </div>
          <button onClick={() => setCurrentScreen(Screen.PROFILE)} className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-pink-50">
            <img src={user?.photoURL} alt="" className="w-full h-full object-cover" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {flight.map((s, i) => {
            const isExpanded = expandedStrains.has(i);
            return (
              <div key={i} className={`bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 ${isExpanded ? 'bg-white ring-2 ring-pink-100' : ''}`}>
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
                    
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Terpenes (Tap for details)</p>
                       <div className="flex flex-wrap gap-2">
                        {s.terpenes.map(t => {
                          const terpKey = `${i}-${t}`;
                          const isTerpExpanded = expandedTerpenes.has(terpKey);
                          const info = TERPENE_DATA[t] || { icon: "✨", desc: "A minor but aromatic compound." };
                          return (
                            <div key={t} className="w-full">
                              <button 
                                onClick={() => toggleTerpene(t, i)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${isTerpExpanded ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-100 shadow-sm'}`}
                              >
                                <span className="font-bold text-[10px] uppercase tracking-widest">{t}</span>
                                <span className="text-lg">{info.icon}</span>
                              </button>
                              {isTerpExpanded && (
                                <div className="p-4 bg-slate-800 text-white/80 text-[11px] rounded-2xl mt-2 animate-in fade-in zoom-in-95 leading-relaxed">
                                  {info.desc}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Button onClick={() => handleBuyStrain(s)} variant="secondary" className="py-3 text-xs">
                      Find
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="p-8 bg-white border-t border-slate-100">
          <div className="flex gap-3">
            <Button onClick={() => setCurrentScreen(Screen.HOME)} variant="outline" className="flex-1 py-3 px-0 text-xs">
              Again
            </Button>
            <Button onClick={() => {
              setProfileTab('history');
              setCurrentScreen(Screen.PROFILE);
            }} variant="primary" className="flex-1 py-3 px-0 text-xs">
              Journal
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const ProfileScreen = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(user);
    // showClearConfirm state has been lifted to App component scope

    // Filtered data for subtabs
    const triedStrains = useMemo(() => Object.values(user?.journal || {}).filter(j => j.acquired), [user?.journal]);
    const recentEntries = useMemo(() => 
      Object.values(user?.journal || {})
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5)
    , [user?.journal]);
    
    const averageRatings = useMemo(() => {
      if (!user) return {};
      const totals: Record<string, { sum: number, count: number }> = {};
      Object.values(user.journal).forEach(entry => {
        if (!entry.acquired) return;
        Object.entries(entry.ratings).forEach(([effect, rating]) => {
          if (rating.score > 0) {
            if (!totals[effect]) totals[effect] = { sum: 0, count: 0 };
            totals[effect].sum += rating.score;
            totals[effect].count += 1;
          }
        });
      });
      return Object.entries(totals).reduce((acc, [effect, data]) => {
        acc[effect] = data.sum / data.count;
        return acc;
      }, {} as Record<string, number>);
    }, [user?.journal]);

    const handleSave = () => {
      if (editData) setUser(editData);
      setIsEditing(false);
    };

    return (
      <div className="h-full flex flex-col bg-white overflow-hidden relative">
        <div className="p-8 bg-slate-900 text-white text-center relative overflow-hidden">
          <button onClick={() => setCurrentScreen(Screen.HOME)} className="absolute left-8 top-10 text-white/50 hover:text-white transition-colors">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div className="w-20 h-20 rounded-[1.8rem] border-4 border-white/10 mx-auto mb-4 overflow-hidden shadow-2xl">
            <img src={user?.photoURL} alt="" className="w-full h-full object-cover"/>
          </div>
          <h2 className="font-serif text-2xl mb-1">{user?.displayName}</h2>
          
          <div className="mt-8 flex bg-white/5 rounded-2xl p-1 relative z-10">
            <button 
              onClick={() => setProfileTab('history')} 
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${profileTab === 'history' ? 'bg-white text-slate-900 shadow-lg' : 'text-white/40'}`}
            >
              History
            </button>
            <button 
              onClick={() => setProfileTab('profile')} 
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${profileTab === 'profile' ? 'bg-white text-slate-900 shadow-lg' : 'text-white/40'}`}
            >
              Profile
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {profileTab === 'profile' ? (
            <div className="p-8 space-y-8 animate-in fade-in">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Name</label>
                    <input 
                      value={editData?.displayName} 
                      onChange={e => setEditData(d => d ? ({...d, displayName: e.target.value}) : null)} 
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:border-pink-500 text-sm font-medium"
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button onClick={handleSave}>Save</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                   <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <span className="text-[10px] font-black text-slate-300 uppercase block mb-2 tracking-widest">Age</span>
                      <span className="font-bold text-2xl text-black">{user?.age || '—'}</span>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <span className="text-[10px] font-black text-slate-300 uppercase block mb-2 tracking-widest">Sex</span>
                      <span className="font-bold text-2xl text-black">{user?.sex || '—'}</span>
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
            <div className="flex flex-col h-full animate-in fade-in">
              <div className="flex border-b border-slate-50 sticky top-0 bg-white z-10 px-4">
                {(['recent', 'tried', 'flights', 'ratings'] as const).map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setHistorySubTab(tab)}
                    className={`flex-1 py-4 text-[9px] font-black uppercase tracking-tighter transition-all border-b-2 ${historySubTab === tab ? 'border-pink-600 text-slate-900' : 'border-transparent text-slate-300'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-4">
                {historySubTab === 'recent' && (
                  <>
                    {recentEntries.length === 0 ? <p className="text-center text-slate-300 italic text-xs py-10">No entries yet.</p> : 
                      recentEntries.map(entry => {
                        const ratedValues = Object.values(entry.ratings).filter(r => r.score > 0);
                        const avg = ratedValues.length > 0 ? (ratedValues.reduce((a, b) => a + b.score, 0) / ratedValues.length).toFixed(1) : '—';
                        return (
                          <div key={entry.strainName} className="p-5 rounded-3xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-slate-900">{entry.strainName}</h4>
                              <p className="text-[9px] text-slate-400">{new Date(entry.timestamp).toLocaleDateString()}</p>
                            </div>
                            <div className="text-pink-600 font-bold text-sm">★ {avg}</div>
                          </div>
                        );
                      })
                    }
                  </>
                )}

                {historySubTab === 'tried' && (
                  <>
                    {triedStrains.length === 0 ? <p className="text-center text-slate-300 italic text-xs py-10">Nothing in your bag yet.</p> : 
                      triedStrains.map(entry => (
                        <div key={entry.strainName} className="p-5 rounded-3xl border border-pink-100 bg-white shadow-sm flex items-center justify-between">
                          <h4 className="font-bold text-slate-900">{entry.strainName}</h4>
                          <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">Acquired</span>
                        </div>
                      ))
                    }
                  </>
                )}

                {historySubTab === 'flights' && (
                  <>
                    {(!user?.flightsHistory || user.flightsHistory.length === 0) ? <p className="text-center text-slate-300 italic text-xs py-10">No flight history found.</p> : 
                      user.flightsHistory.map(record => (
                        <div key={record.id} className="p-5 rounded-3xl border border-slate-100 bg-slate-50 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(record.timestamp).toLocaleDateString()}</span>
                            <div className="flex gap-1">
                              {record.effects.map(e => <span key={e} className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>)}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {record.strains.map(s => (
                              <span key={s.name} className="text-[10px] font-bold text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-100">{s.name}</span>
                            ))}
                          </div>
                        </div>
                      ))
                    }
                  </>
                )}

                {historySubTab === 'ratings' && (
                  <div className="space-y-6 pt-4">
                    {Object.keys(averageRatings).length === 0 ? <p className="text-center text-slate-300 italic text-xs py-10">Add ratings to see averages.</p> : 
                      Object.entries(averageRatings).map(([effect, avg]) => (
                        <div key={effect} className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span>{effect}</span>
                            <span className="text-pink-600">{avg.toFixed(1)} / 5</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-pink-600 rounded-full" style={{ width: `${(avg/5)*100}%` }}></div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const LoadingScreen = () => (
    <div className="h-full flex flex-col justify-center items-center p-12 bg-white text-center">
      <Logo size={90} />
      <div className="mt-12"><LoadingIndicator message="Doing Some Magic..." /></div>
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
        <Button disabled={user?.effects.length === 0} onClick={handleFlightGeneration}>Explore</Button>
      </div>
    );
  };

  const DispensaryListScreen = () => (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="p-8 bg-white border-b border-slate-100 flex items-center gap-4">
        <button onClick={() => setCurrentScreen(Screen.FLIGHT)} className="text-slate-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2 className="font-serif text-xl">{searchingForStrain} Near You</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
        {dispensaries.map(d => (
          <div key={d.id} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold">{d.name}</h3>
              <p className="text-xs text-slate-400">{d.distance}</p>
            </div>
            {d.uri && (
              <a href={d.uri} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-pink-600 text-xs font-bold">Show on Map →</a>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const BlockedScreen = () => (
    <div className="p-20 text-center h-full flex flex-col items-center justify-center">
      <Logo color="#ef4444" />
      <h2 className="font-serif text-3xl mt-10">21+ Only</h2>
      <Button variant="danger" className="mt-8" onClick={() => { logout(); setCurrentScreen(Screen.AUTH); }}>Exit</Button>
    </div>
  );

  const FeedbackScreen = () => (
    <div className="p-10 h-full flex flex-col items-center justify-center">
       <h2 className="font-serif text-2xl mb-8">Got Feedback?</h2>
       <Button onClick={() => setCurrentScreen(Screen.HOME)}>Back to Home</Button>
    </div>
  );

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.AUTH: return <AuthScreen />;
      case Screen.HOME: return <HomeScreen />;
      case Screen.ONBOARDING: return <OnboardingScreen />;
      case Screen.LOCATION: return <LocationScreen />;
      case Screen.EFFECTS: return <EffectsScreen />;
      case Screen.DISPENSARIES: return <DispensaryListScreen />;
      case Screen.LOADING: return <LoadingScreen />;
      case Screen.FLIGHT: return <FlightScreen />;
      case Screen.PROFILE: return <ProfileScreen />;
      case Screen.BLOCKED: return <BlockedScreen />;
      case Screen.TERPENES_LIBRARY: return <TerpenesLibraryScreen />;
      case Screen.FEEDBACK: return <FeedbackScreen />;
      default: return <AuthScreen />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-100 flex items-center justify-center p-0 md:p-10">
      <div className="w-full h-full md:w-[375px] md:h-[667px] bg-white md:rounded-[3.5rem] shadow-2xl overflow-hidden relative flex flex-col border border-slate-200/50">
        {renderScreen()}
        {showClearConfirm && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-8 animate-in fade-in">
            <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-[300px] shadow-2xl space-y-6 text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">🗑️</div>
              <h3 className="font-serif text-2xl text-slate-900">Reset Data?</h3>
              <p className="text-slate-400 text-sm">This will clear your journal and flight history forever.</p>
              <div className="space-y-3">
                <Button variant="danger" onClick={() => { setUser(u => u ? ({...u, journal: {}, flightsHistory: []}) : null); setShowClearConfirm(false); }}>Reset All</Button>
                <Button variant="outline" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
