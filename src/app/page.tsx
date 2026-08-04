"use client";

import { useEffect, useState } from "react";

interface DistrictStatus {
  name: string;
  handle: string;
  isHoliday: boolean;
  announcementText: string;
  originalPostUrl: string;
  announcedAt: string;
  lastChecked: string;
  hasConfiguredFeed: boolean;
}

type StatusData = Record<string, DistrictStatus>;

export default function Home() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/status.json?t=" + new Date().getTime())
      .then((res) => res.json())
      .then((json) => {
        setData(json);
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
            Loading Districts...
          </p>
        </div>
      </div>
    );
  }

  const districts = Object.keys(data || {}).map((code) => ({
    code,
    ...data![code],
  }));

  districts.sort((a, b) => {
    if (a.isHoliday && !b.isHoliday) return -1;
    if (!a.isHoliday && b.isHoliday) return 1;
    if (a.hasConfiguredFeed && !b.hasConfiguredFeed) return -1;
    if (!a.hasConfiguredFeed && b.hasConfiguredFeed) return 1;
    return a.name.localeCompare(b.name);
  });

  const holidaysDeclaredCount = districts.filter(d => d.isHoliday).length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      <header className="w-full p-6 sm:p-8 bg-kerala-green text-white shadow-lg sticky top-0 z-20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-kerala-gold rounded-full flex items-center justify-center text-kerala-green shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white m-0 leading-tight">Kerala Holiday Alert</h1>
            <p className="text-kerala-gold-light text-sm font-medium opacity-90 m-0">Live Educational Institution Status for 14 Districts</p>
          </div>
        </div>
        <div className="text-xs bg-black/20 py-2 px-4 rounded-full backdrop-blur-sm border border-white/10 hidden sm:flex gap-2 items-center">
            <span className={`w-2 h-2 rounded-full ${holidaysDeclaredCount > 0 ? 'bg-red-400 animate-pulse' : 'bg-kerala-green-light'}`}></span>
            {holidaysDeclaredCount} {holidaysDeclaredCount === 1 ? 'District' : 'Districts'} with Holiday
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {districts.map((district) => (
             <div 
               key={district.code}
               className={`relative flex flex-col rounded-2xl p-6 shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                 district.isHoliday 
                   ? 'bg-gradient-to-br from-red-600 to-orange-500 border border-red-400/50 text-white' 
                   : (district.hasConfiguredFeed 
                       ? 'bg-gradient-to-br from-kerala-green to-kerala-green-light border border-kerala-green-light/50 text-white'
                       : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                     )
               }`}
             >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{district.name}</h2>
                    </div>
                    <p className={`text-xs mt-1 ${district.isHoliday || district.hasConfiguredFeed ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                      {district.handle}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                     district.isHoliday ? 'bg-white text-red-600' : (district.hasConfiguredFeed ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300')
                  }`}>
                     {district.code}
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center py-4">
                  {district.isHoliday ? (
                     <div className="text-center font-bold text-xl py-2 drop-shadow-md">Holiday Declared!</div>
                  ) : district.hasConfiguredFeed ? (
                     <div className="text-center font-semibold text-white/90">No Holiday Today</div>
                  ) : (
                     <div className="text-center text-sm opacity-60">Awaiting RSS Configuration</div>
                  )}
                </div>

                {district.isHoliday && (
                  <div className="mt-2 text-sm bg-black/20 p-3 rounded-lg border border-white/10">
                     <p className="line-clamp-3 italic opacity-95 text-white/90">"{district.announcementText}"</p>
                     {district.originalPostUrl && (
                        <a href={district.originalPostUrl} target="_blank" rel="noreferrer" className="inline-block mt-3 text-xs font-bold bg-white text-red-600 px-3 py-1 rounded hover:bg-red-50 transition-colors">
                           View Notice On Social
                        </a>
                     )}
                  </div>
                )}

                <div className={`mt-4 pt-4 border-t flex justify-between text-[10px] uppercase font-bold tracking-wider ${district.isHoliday || district.hasConfiguredFeed ? 'border-white/20' : 'border-slate-200 dark:border-slate-700'}`}>
                   <span>Status: {district.isHoliday ? 'Alert Active' : (district.hasConfiguredFeed ? 'Clear' : 'Pending')}</span>
                   {district.announcedAt && <span>{new Date(district.announcedAt).toLocaleDateString()}</span>}
                </div>
             </div>
          ))}
        </div>
      </main>
      
      <footer className="w-full text-center p-6 text-sm text-slate-500 dark:text-slate-400 bg-black/5 dark:bg-black/20 mt-auto">
        <p className="mb-2">Kerala State District-Level Centralized Holiday Dashboard</p>
        <p>Updates dynamically sourced via RSS Feeds utilizing GitHub Actions</p>
      </footer>
    </div>
  );
}
