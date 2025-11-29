import React, { useState, useRef, useEffect } from 'react';
import { Camera, Loader2, Navigation, RotateCcw, Upload, Download, X, Globe, ShieldCheck, Code } from 'lucide-react';
import CameraCapture from './components/Camera';
import { identifyStreetDetails } from './services/gemini';
import { determineDistrict } from './services/streetLogic';
import { speakText } from './services/tts';
import { parseCSV } from './services/csvParser';
import { translations, getTTSCode, translateDistrict } from './services/translations';
import { AppStep, StreetResult, Language } from './types';
import JSZip from 'jszip';

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.IDLE);
  const [result, setResult] = useState<StreetResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [language, setLanguage] = useState<Language>('de');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [streetMap, setStreetMap] = useState<Map<string, string>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language];
  const isRTL = language === 'ar';

  useEffect(() => {
    localStorage.clear(); sessionStorage.clear();
    const handleUnload = () => { localStorage.clear(); sessionStorage.clear(); };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); setDeferredPrompt(e); });
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.then(() => setDeferredPrompt(null)); } else { setShowInstallHelp(true); }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const map = await parseCSV(file);
      setStreetMap(map);
      alert(`${map.size} ${t.csvSuccess}`);
    } catch (e) { alert(t.csvError); }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCapture = async (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setStep(AppStep.PROCESSING_IMAGE);
    try {
      const { street, number, streetBox, numberBox } = await identifyStreetDetails(imageSrc);
      if (street === 'UNKNOWN') { alert(t.streetUnknown); setStep(AppStep.IDLE); return; }
      const logicResult = determineDistrict(street, number, streetMap, streetBox, numberBox);
      setResult(logicResult);
      setStep(AppStep.RESULT);
      if (logicResult.district) {
        const numberMatch = logicResult.district.match(/\d+/);
        if (numberMatch) { speakText(numberMatch[0], getTTSCode(language)); }
      }
    } catch (e) { setStep(AppStep.ERROR); }
  };

  const reset = () => { setStep(AppStep.IDLE); setResult(null); setCapturedImage(null); };
  const playTTS = () => { if (result?.district) { const m = result.district.match(/\d+/); if(m) speakText(m[0], getTTSCode(language)); } };

  const renderBoundingBox = (box: number[] | undefined, colorClass: string) => {
    if (!box || box.length !== 4) return null;
    const [ymin, xmin, ymax, xmax] = box;
    return <div className={`absolute border-4 ${colorClass} shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 rounded-sm`} style={{ top: `${ymin / 10}%`, left: `${xmin / 10}%`, width: `${(xmax - xmin) / 10}%`, height: `${(ymax - ymin) / 10}%` }} />;
  };

  // Download handler simplified to avoid needing self-reference
  const handleDownloadCode = async () => {
     alert("Bitte nutzen Sie den Download Button in der Vorschau-App, um den Code zu exportieren.");
  };

  if (step === AppStep.CAMERA) return <CameraCapture onCapture={handleCapture} onClose={() => setStep(AppStep.IDLE)} />;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center max-w-md mx-auto shadow-2xl overflow-hidden relative" dir={isRTL ? 'rtl' : 'ltr'}>
      {!isOnline && <div className="w-full bg-red-600 text-white text-xs text-center py-1 font-bold z-50">⚠️ Keine Internetverbindung</div>}
      <header className="w-full p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between z-10 gap-2">
        <div className="flex gap-2 items-center overflow-x-auto no-scrollbar w-full">
          <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          <button onClick={() => fileInputRef.current?.click()} className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-bold shadow-lg shrink-0 whitespace-nowrap ${streetMap.size > 0 ? 'bg-green-500 hover:bg-green-400 text-slate-900' : 'bg-yellow-400 hover:bg-yellow-300 text-slate-900 shadow-yellow-400/20'}`}>
            <Upload size={18} /><span>{t.uploadCSV}</span>{streetMap.size > 0 && <span className="ml-1 bg-black/20 px-2 py-0.5 rounded-full text-xs">{streetMap.size}</span>}
          </button>
          
          <div className="relative shrink-0 ml-auto">
             <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-slate-400"><Globe size={14} /></div>
             <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="bg-slate-700 text-white text-xs py-2 pl-8 pr-2 rounded-lg border border-slate-600 appearance-none">
               <option value="de">DE</option><option value="en">EN</option><option value="ar">AR</option>
             </select>
          </div>
          {deferredPrompt && <button onClick={handleInstallClick} className="px-3 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-blue-500/20 shrink-0 animate-pulse transition-all"><Download size={18} /><span className="hidden sm:inline">{t.install}</span></button>}
        </div>
      </header>
      <main className="flex-1 w-full p-6 flex flex-col items-center justify-center relative overflow-y-auto">
        {step === AppStep.IDLE && !capturedImage && (
          <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="w-48 h-48 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(250,204,21,0.3)] ring-4 ring-yellow-300 relative group">
               <Navigation size={80} className="text-slate-900 opacity-80 group-hover:scale-110 transition-transform duration-500" />
               <div className="absolute bottom-4 flex flex-col items-center gap-1 opacity-75"><ShieldCheck size={16} className="text-slate-900" /><span className="text-[10px] text-slate-900 font-bold">100% Privacy</span></div>
            </div>
            <div className="space-y-4">
              <p className="text-slate-300 text-lg max-w-[250px] mx-auto leading-relaxed">{t.hint}</p>
              {streetMap.size === 0 && <div className="bg-yellow-900/30 border border-yellow-700/50 p-4 rounded-lg max-w-xs mx-auto"><p className="text-yellow-200 text-sm">{t.hintNoCSV}</p></div>}
            </div>
          </div>
        )}
        {step === AppStep.PROCESSING_IMAGE && <div className="text-center">{capturedImage && <img src={capturedImage} alt="Captured" className="w-32 h-32 object-cover rounded-xl mx-auto mb-6 border-2 border-blue-500 opacity-50" />}<Loader2 className="animate-spin w-16 h-16 text-blue-500 mx-auto mb-4" /><p className="text-xl font-semibold animate-pulse">{t.processing}</p></div>}
        {step === AppStep.RESULT && result && (
          <div className="text-center w-full animate-in zoom-in duration-300 flex flex-col items-center">
            {capturedImage && <div className="relative w-full max-w-xs mb-6 rounded-lg overflow-hidden shadow-xl border border-slate-600"><img src={capturedImage} alt="Analysis" className="w-full h-auto block" />{renderBoundingBox(result.streetBox, 'border-green-400 shadow-green-400/50')}{renderBoundingBox(result.numberBox, 'border-yellow-400 shadow-yellow-400/50')}<div className="absolute bottom-0 w-full bg-black/60 backdrop-blur-sm p-1 flex justify-center gap-4 text-[10px] text-white"><span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full"></span> {t.legendStreet}</span><span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-400 rounded-full"></span> {t.legendNumber}</span></div></div>}
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl w-full"><h3 className="text-slate-400 uppercase tracking-wider text-sm mb-2">{t.resultLabel}</h3><p className="text-xl text-slate-300 mb-1">{result.name}</p><p className="text-md text-slate-400 mb-6">{result.number ? `${t.legendNumber} ${result.number}` : t.noNumber}</p><div className="my-6"><span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{translateDistrict(result.district || '', language)}</span></div></div>
            <button onClick={playTTS} className="mt-6 text-slate-400 hover:text-white underline text-sm">{t.readAgain}</button>
          </div>
        )}
        {step === AppStep.ERROR && <div className="text-center"><div className="text-red-500 text-6xl mb-4">!</div><p>{t.error}</p></div>}
      </main>
      <footer className="w-full px-6 py-4 bg-slate-900/90 backdrop-blur-sm z-20 flex flex-col items-center border-t border-slate-800">
        <div className="w-full mb-6">
          {step === AppStep.IDLE ? <button onClick={() => isOnline ? setStep(AppStep.CAMERA) : alert('Bitte Internetverbindung prüfen.')} disabled={!isOnline} className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-3 text-lg transition-all shadow-lg ${isOnline ? 'bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-slate-900 shadow-yellow-400/20' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}><Camera size={24} />{t.startCamera}</button> : step === AppStep.RESULT || step === AppStep.ERROR ? <button onClick={reset} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all"><RotateCcw size={20} />{t.newScan}</button> : null}
        </div>
        <div className="text-blue-400 font-mono text-xs tracking-widest opacity-80">{t.footer}</div>
      </footer>
      {showInstallHelp && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
           <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-2xl max-w-sm w-full relative">
              <button onClick={() => setShowInstallHelp(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-700/50 rounded-full p-1"><X size={20} /></button>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white"><Download className="text-blue-400" size={24}/> App installieren</h2>
              <div className="space-y-4 text-sm text-slate-300">
                <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600"><h3 className="font-bold text-white mb-2 flex items-center gap-2">🍎 Für iPhone (iOS)</h3><ol className="list-decimal list-inside space-y-1.5 ml-1"><li>Tippe unten auf den <span className="text-blue-300 font-semibold">Teilen-Button</span> (Quadrat mit Pfeil).</li><li>Scrolle nach unten.</li><li>Wähle <span className="text-blue-300 font-semibold">Zum Home-Bildschirm</span>.</li></ol></div>
                <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600"><h3 className="font-bold text-white mb-2 flex items-center gap-2">🤖 Für Android</h3><ol className="list-decimal list-inside space-y-1.5 ml-1"><li>Nutze den <span className="text-blue-300 font-semibold">Anheften</span> Button oben im Menü.</li><li>Oder: Menü (3 Punkte) &rarr; <span className="text-blue-300 font-semibold">App installieren</span>.</li></ol></div>
              </div>
              <button onClick={() => setShowInstallHelp(false)} className="w-full mt-6 bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20">Verstanden</button>
           </div>
        </div>
      )}
    </div>
  );
}