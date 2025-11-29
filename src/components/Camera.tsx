import React, { useRef, useEffect, useState } from 'react';
import { Camera as CameraIcon, X } from 'lucide-react';
interface CameraProps { onCapture: (imageSrc: string) => void; onClose: () => void; }
const Camera: React.FC<CameraProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { setError("Kamera Fehler."); }
    };
    startCamera();
    return () => { if (stream) stream.getTracks().forEach(track => track.stop()); };
  }, []);
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const v = videoRef.current;
      const c = canvasRef.current;
      c.width = v.videoWidth; c.height = v.videoHeight;
      const ctx = c.getContext('2d');
      if (ctx) { ctx.drawImage(v, 0, 0, c.width, c.height); onCapture(c.toDataURL('image/jpeg', 0.8)); }
    }
  };
  if (error) return <div className="p-4 text-center"><p className="text-red-400">{error}</p><button onClick={onClose}>Zurück</button></div>;
  return (
    <div className="relative w-full h-full bg-black flex flex-col">
      <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover w-full h-full" />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute top-4 right-4 z-20"><button onClick={onClose} className="flex items-center gap-2 px-4 py-2 bg-red-500/80 text-white rounded-lg font-bold"><X size={18} /><span>Stop</span></button></div>
      <div className="absolute bottom-0 w-full p-8 flex justify-center bg-black/80 z-20"><button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full border-4 border-slate-300 shadow-lg flex items-center justify-center"><div className="w-16 h-16 bg-slate-900 rounded-full" /></button></div>
    </div>
  );
};
export default Camera;