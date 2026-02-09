
import React, { useState, useEffect, useCallback } from 'react';
import { Screen, UserData, Dispensary, Strain } from './types';
import { subscribeToAuthChanges, signInWithGoogle, logout } from './firebase';
import { findDispensaries, generateFlight, getTripGuideResponse } from './geminiService';

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
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'demo';
  children: React.ReactNode;
  className?: string;
}> = ({ onClick, disabled, variant = 'primary', children, className = "" }) => {
  const base = "w-full py-4 px-6 rounded-full font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm tracking-wide";
  const styles = {
    primary: "bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xl shadow-pink-200",
    secondary: "bg-slate-900 text-white shadow-lg",
    outline: "border-2 border-slate-100 text-slate-700 hover:border-pink-200 hover:bg-pink-50/30",
    ghost: "text-slate-400 hover:text-slate-600 hover:bg-slate-50",
    demo: "bg-indigo-50 text-indigo-600 border border-indigo-100"
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

// --- App Root ---

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
        });
        setCurrentScreen(Screen.AGE_VERIFY);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleDemoMode = () => {
    setUser({
      uid: 'demo-user-123',
      email: 'demo@blossom.ai',
      displayName: 'Demo Guest',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      age: null,
      sex: '',
      effects: [],
    });
    setCurrentScreen(Screen.AGE_VERIFY);
  };

  const handleLocationFetch = useCallback(async () => {
    if (!navigator.geolocation) {
      alert("Location not supported by browser");
      return;
    }
    
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
      (error) => {
        console.error(error);
        alert("Location failure. Using mock  data for demo.");
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
      setCurrentScreen(Screen.FLIGHT);
    } catch (e) {
      console.error(e);
      alert("Something is wrong'. Please try again.");
      setCurrentScreen(Screen.DISPENSARIES);
    } finally {
      setLoading(false);
    }
  };

  // --- Screen Components ---

  const AuthScreen = () => (
    <div className="h-full flex flex-col justify-center items-center px-10 bg-white text-center">
      <div className="mb-10"><Logo size={110} /></div>
      <h1 className="font-serif text-5xl mb-4 tracking-tight text-slate-900">Blossom</h1>
      <p className="text-slate-400 mb-12 text-sm leading-relaxed max-w-[240px]">Personalized cannabis curation.</p>
      
      <div className="w-full space-y-3">
        <Button onClick={() => signInWithGoogle().catch(() => alert("Auth failed. Please use Demo Mode."))} variant="outline">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt=""/>
          Continue with Google
        </Button>
        <Button onClick={handleDemoMode} variant="demo">
          Try as Guest (Demo Mode)
        </Button>
        <div className="pt-6">
          <p className="text-[10px] text-slate-300 uppercase font-black tracking-widest leading-loose">
            By continuing you agree to our<br/>Terms of Service & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );

  const AgeVerifyScreen = () => (
    <div className="h-full flex flex-col justify-center items-center px-10 text-center bg-white">
      <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-8 text-4xl shadow-inner">🔞</div>
      <h2 className="font-serif text-3xl mb-4">Verification</h2>
      <p className="text-slate-400 mb-12 text-sm">Blossom is for adults. Please confirm your age.</p>
      <div className="w-full space-y-4">
        <Button onClick={() => setCurrentScreen(Screen.ONBOARDING)}>I am 21 or older</Button>
        <Button onClick={() => { setUser(null); setCurrentScreen(Screen.AUTH); }} variant="ghost">I am under 21</Button>
      </div>
    </div>
  );

  const OnboardingScreen = () => {
    const isReady = user?.age && user?.sex;
    return (
      <div className="h-full flex flex-col p-8 bg-white">
        <div className="mb-12">
          <h2 className="font-serif text-3xl mb-2">About you</h2>
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
                  className={`py-5 rounded-3xl border-2 transition-all font-bold ${user?.sex === s ? 'border-pink-600 bg-pink-50 text-pink-600 shadow-md' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Button disabled={!isReady} onClick={() => setCurrentScreen(Screen.LOCATION)}>Continue</Button>
      </div>
    );
  };

  const LocationScreen = () => (
    <div className="h-full flex flex-col p-10 bg-white text-center justify-center items-center">
      <div className="w-28 h-28 bg-rose-50 rounded-full flex items-center justify-center mb-10 shadow-inner">
        <span className="text-5xl animate-bounce">📍</span>
      </div>
      <h2 className="font-serif text-3xl mb-4">Location</h2>
      <p className="text-slate-400 text-sm mb-12 leading-relaxed">We need it to find real inventory.</p>
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
        <h2 className="font-serif text-3xl mb-2">How do you want to feel?</h2>
        <p className="text-slate-400 text-sm mb-8"></p>
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
        <h2 className="font-serif text-3xl">Local Shops</h2>
        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">Live</span>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
        {dispensaries.length === 0 ? (
          <div className="py-20 text-center text-slate-300 italic text-sm">Nothing...</div>
        ) : (
          dispensaries.map(d => (
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
                <span>★</span>
                <span className="font-bold text-slate-600">{d.rating}</span>
                <span>({d.reviewsCount})</span>
              </div>
              <div className="text-[10px] text-slate-300">
                {d.uri ? (
                  <a href={d.uri} target="_blank" rel="noopener noreferrer" className="text-pink-500 underline" onClick={e => e.stopPropagation()}>View on Maps</a>
                ) : d.address}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-8 bg-white border-t border-slate-100">
        <Button disabled={!selectedDispensary} onClick={handleFlightGeneration}>Curate My Flight</Button>
      </div>
    </div>
  );

  const LoadingScreen = () => (
    <div className="h-full flex flex-col justify-center items-center p-12 bg-white text-center">
      <Logo size={90} />
      <div className="mt-12"><LoadingIndicator message="Doing some magic..." /></div>
    </div>
  );

  const FlightScreen = () => (
    <div className="h-full flex flex-col bg-white">
      <div className="p-8 border-b border-slate-100 flex justify-between items-end bg-white sticky top-0 z-10">
        <div>
          <h2 className="font-serif text-3xl">Your Flight</h2>
          <p className="text-pink-600 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Recommendation</p>
        </div>
        <button onClick={() => setCurrentScreen(Screen.PROFILE)} className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-pink-50 transition-transform active:scale-90">
          <img src={user?.photoURL} alt="" className="w-full h-full object-cover" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {flight.map((s, i) => (
          <div key={i} className="bg-slate-50 rounded-[2.5rem] border border-slate-100 p-7 shadow-sm">
            <div className="flex justify-between items-start mb-5">
              <div className="flex gap-4 items-center">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-lg">{i+1}</div>
                <div>
                  <h3 className="font-bold text-xl text-slate-900">{s.name}</h3>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{s.brand}</p>
                </div>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-2xl text-pink-600 font-black text-[10px] shadow-sm border border-pink-50">{s.thc} THC</div>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 italic">"{s.description}"</p>
            <div className="flex flex-wrap gap-2">
              {s.terpenes.map(t => (
                <span key={t} className="bg-white px-3 py-2 rounded-xl text-slate-500 font-bold text-[9px] uppercase tracking-widest border border-slate-100 shadow-sm">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="p-8 bg-white border-t border-slate-100">
        <Button onClick={() => setCurrentScreen(Screen.TRIP_GUIDE)}>Start Guide</Button>
      </div>
    </div>
  );

  const ProfileScreen = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(user);

    const handleSave = () => {
      if (editData) setUser(editData);
      setIsEditing(false);
    };

    return (
      <div className="h-full flex flex-col bg-white overflow-hidden">
        <div className="p-10 bg-slate-900 text-white text-center relative overflow-hidden">
          <button onClick={() => setCurrentScreen(Screen.FLIGHT)} className="absolute left-8 top-10 text-white/50 hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div className="w-28 h-28 rounded-[2.5rem] border-4 border-white/10 mx-auto mb-6 overflow-hidden shadow-2xl">
            <img src={editData?.photoURL} alt="" className="w-full h-full object-cover"/>
          </div>
          <h2 className="font-serif text-3xl mb-1">{user?.displayName}</h2>
          <p className="text-white/40 text-xs font-medium tracking-widest uppercase">{user?.email}</p>
        </div>

        <div className="flex-1 p-8 space-y-8 overflow-y-auto no-scrollbar">
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
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Photo</label>
                <input 
                  value={editData?.photoURL} 
                  onChange={e => setEditData(d => d ? ({...d, photoURL: e.target.value}) : null)} 
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:border-pink-500 transition-all text-xs font-mono"
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
                  <span className="font-bold text-2xl text-slate-800">{user?.age || '—'}</span>
                </div>
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <span className="text-[10px] font-black text-slate-300 uppercase block mb-2 tracking-widest">Sex</span>
                  <span className="font-bold text-2xl text-slate-800">{user?.sex || '—'}</span>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-5">Goals</h4>
                <div className="flex flex-wrap gap-2">
                  {user?.effects.map(e => (
                    <span key={e} className="bg-pink-50 text-pink-600 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-3 pt-6">
                <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
                <Button variant="ghost" onClick={() => { setUser(null); setCurrentScreen(Screen.AUTH); }}>Sign Out</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const TripGuideScreen = () => {
    const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string}[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const handleSend = async () => {
      if (!input.trim() || !user) return;
      const text = input;
      setInput('');
      setMessages(m => [...m, {role:'user', content: text}]);
      setIsThinking(true);
      try {
        const res = await getTripGuideResponse(text, messages, user.effects);
        setMessages(m => [...m, {role:'assistant', content: res}]);
      } catch (e) {
        setMessages(m => [...m, {role:'assistant', content: "Connection Issue. Try again."}]);
      } finally {
        setIsThinking(false);
      }
    };

    return (
      <div className="h-full flex flex-col bg-slate-900 text-white overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center">🌸</div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">Trip Guide</h3>
              <p className="text-[8px] text-emerald-400 font-black uppercase tracking-[0.2em]">Support</p>
            </div>
          </div>
          <button onClick={() => setCurrentScreen(Screen.FLIGHT)} className="text-white/30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          {messages.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-white/20 text-sm italic max-w-[200px] mx-auto leading-relaxed">"How are you feeling as you start your session?"</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm leading-relaxed ${m.role === 'user' ? 'bg-pink-600 text-white rounded-tr-none' : 'bg-white/10 text-slate-100 rounded-tl-none'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-white/5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white/30 animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>
        <div className="p-8 bg-slate-950/80 border-t border-white/5">
          <div className="flex gap-3">
            <input 
              value={input} 
              onChange={e=>setInput(e.target.value)} 
              onKeyDown={e=>e.key==='Enter'&&handleSend()} 
              className="flex-1 bg-white/5 border border-white/10 rounded-3xl py-4 px-6 text-sm outline-none focus:border-pink-500 transition-all placeholder:text-white/20" 
              placeholder="Message your guide..."
            />
            <button onClick={handleSend} disabled={!input.trim()} className="w-14 h-14 bg-pink-600 rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform disabled:opacity-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-100 flex items-center justify-center p-0 md:p-10">
      <div className="w-full h-full md:w-[375px] md:h-[667px] bg-white md:rounded-[3.5rem] shadow-2xl overflow-hidden relative flex flex-col border border-slate-200/50">
        {renderScreen(currentScreen, {
          AuthScreen, AgeVerifyScreen, OnboardingScreen, LocationScreen, 
          EffectsScreen, DispensaryListScreen, LoadingScreen, FlightScreen, 
          TripGuideScreen, ProfileScreen 
        })}
      </div>
    </div>
  );
};

function renderScreen(current: Screen, components: any) {
  switch (current) {
    case Screen.AUTH: return <components.AuthScreen />;
    case Screen.AGE_VERIFY: return <components.AgeVerifyScreen />;
    case Screen.ONBOARDING: return <components.OnboardingScreen />;
    case Screen.LOCATION: return <components.LocationScreen />;
    case Screen.EFFECTS: return <components.EffectsScreen />;
    case Screen.DISPENSARIES: return <components.DispensaryListScreen />;
    case Screen.LOADING: return <components.LoadingScreen />;
    case Screen.FLIGHT: return <components.FlightScreen />;
    case Screen.TRIP_GUIDE: return <components.TripGuideScreen />;
    case Screen.PROFILE: return <components.ProfileScreen />;
    default: return <components.AuthScreen />;
  }
}

export default App;
