import { useContext } from 'react';
import { LoadingContext } from '../contexts/LoadingContext';

export default function GlobalLoader() {
  const { loading } = useContext(LoadingContext);
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />
      <div className="pointer-events-auto p-4 rounded-lg bg-white/6 dark:bg-black/40 flex items-center gap-3 shadow-xl">
        <div className="w-8 h-8 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" style={{ borderTopColor: '#06b6d4' }} />
        <div className="text-white font-semibold">Loading...</div>
      </div>
    </div>
  );
}
