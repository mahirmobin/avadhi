"use client";

import { useEffect, useState } from "react";

interface StatusData {
  isHoliday: boolean;
  announcementText: string;
  originalPostUrl: string;
  announcedAt: string;
  lastChecked: string;
}

export default function Home() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the status JSON dynamically
    fetch("/status.json?t=" + new Date().getTime())
      .then((res) => res.json())
      .then((data) => {
        setStatus(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch status:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-kerala-gold border-t-transparent"></div>
          <p className="text-lg font-medium animate-pulse text-kerala-green dark:text-kerala-gold-light">
            Checking status...
          </p>
        </div>
      </div>
    );
  }

  const isHoliday = status?.isHoliday || false;
  const lastCheckedDate = status?.lastChecked ? new Date(status.lastChecked) : null;
  const announcedDate = status?.announcedAt ? new Date(status.announcedAt) : null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      <header className="w-full p-6 sm:p-10 bg-kerala-green text-white shadow-lg sticky top-0 z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-kerala-gold rounded-full flex items-center justify-center text-kerala-green shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white m-0 leading-tight">Ernakulam Holiday Alert</h1>
            <p className="text-kerala-gold-light text-sm font-medium opacity-90 m-0">Live Educational Institution Status</p>
          </div>
        </div>
        <div className="text-xs bg-black/20 py-2 px-4 rounded-full backdrop-blur-sm border border-white/10 hidden sm:block">
          Dist. Collector @ernakulamdc Updates
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-8 flex flex-col items-center justify-center gap-8">
        
        <section 
          className={`w-full rounded-3xl p-8 sm:p-12 text-center shadow-2xl transition-all duration-500 transform hover:scale-[1.01] ${
            isHoliday 
              ? 'bg-gradient-to-br from-red-600 to-orange-500 border border-red-400 dark:border-red-700' 
              : 'bg-gradient-to-br from-kerala-green to-kerala-green-light border border-kerala-green-light dark:border-kerala-green'
          }`}
        >
          <div className="inline-block bg-white/20 backdrop-blur-md px-6 py-2 rounded-full text-white text-sm font-semibold mb-6 tracking-widest uppercase shadow-sm">
            Current Status
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-8">
            {isHoliday 
              ? "Holiday Declared for Educational Institutions Today" 
              : "No Holiday Announced for Today"}
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white/90 font-medium">
            <span className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Last Checked: {lastCheckedDate ? lastCheckedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Unknown'}
            </span>
          </div>
        </section>

        {isHoliday && status?.announcementText && (
          <section className="w-full bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-700 w-full transform transition-all">
            <div className="flex items-center gap-2 text-kerala-green dark:text-kerala-gold-light mb-4 font-bold uppercase tracking-wider text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              Original Announcement
            </div>
            <p className="text-lg text-slate-700 dark:text-slate-300 italic mb-6 border-l-4 border-kerala-gold pl-4 leading-relaxed font-serif">
              "{status.announcementText}"
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-700 pt-6 mt-2">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Posted At: <span className="font-medium text-slate-700 dark:text-slate-300">{announcedDate ? announcedDate.toLocaleString() : 'N/A'}</span>
              </div>
              {status.originalPostUrl && (
                <a 
                  href={status.originalPostUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full font-medium text-sm hover:scale-105 transition-transform"
                >
                  View on X
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"/></svg>
                </a>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="w-full text-center p-6 text-sm text-slate-500 dark:text-slate-400 bg-black/5 dark:bg-black/20 mt-auto">
        <p className="mb-2">This is an automated service utilizing RSS feeds. Not an official government channel.</p>
        <p>
          Powered by GitHub Actions & Next.js. Checks periodically for Ernakulam District Collector updates.
        </p>
      </footer>
    </div>
  );
}
