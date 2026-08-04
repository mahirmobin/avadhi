"use client";

import { useEffect, useState } from "react";
import { AnimatedGroup } from '@/components/core/animated-group';
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
} from '@/components/core/morphing-dialog';

interface DistrictStatus {
  name: string;
  handle: string;
  isHoliday: boolean;
  announcementText: string;
  originalPostUrl: string;
  announcedAt: string;
  lastChecked: string;
  hasConfiguredFeed: boolean;
  metStatus?: string;
  holidayScope?: string;
  holidayDate?: string;
  sourceBadge?: string;
}

type StatusData = Record<string, DistrictStatus>;

export default function Home() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'en' | 'ml'>('en');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const today = new Date();
    setCurrentDate(`${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`);

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

  const t = (enString: string, mlString: string) => lang === 'en' ? enString : mlString;

  const translateScope = (scope?: string) => {
    if (!scope) return "";
    if (scope === 'Full District Holiday') return t('Full District Holiday', 'ജില്ലയിൽ പൂർണ്ണ അവധി');
    if (scope === 'Including Professional Colleges') return t('Including Professional Colleges', 'പ്രൊഫഷണൽ കോളേജുകൾ ഉൾപ്പെടെ അവധി');
    if (scope === 'Excluding Professional Colleges') return t('Excluding Professional Colleges', 'പ്രൊഫഷണൽ കോളേജുകൾ ഒഴികെ അവധി');
    if (scope === 'Includes Anganwadis') return t('Includes Anganwadis', 'അങ്കണവാടി ഉൾപ്പെടെ അവധി');
    return scope;
  };

  const translateMet = (met?: string) => {
    if (!met) return "";
    if (met === 'Red Alert') return t('Red Alert', 'റെഡ് അലർട്ട്');
    if (met === 'Orange Alert') return t('Orange Alert', 'ഓറഞ്ച് അലർട്ട്');
    if (met === 'Yellow Alert') return t('Yellow Alert', 'മഞ്ഞ അലർട്ട്');
    return met;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black">
        <div className="flex flex-col items-center gap-4">
          <p className="text-xl font-bold animate-pulse text-black">
            {t("Loading Avadhi...", "അവധി വിവരങ്ങൾ ലോഡുചെയ്യുന്നു...")}
          </p>
        </div>
      </div>
    );
  }

  const districts = Object.keys(data || {})
    .filter((code) => typeof data![code] === 'object' && data![code].name)
    .map((code) => ({
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
  const redAlertCount = districts.filter(d => d.metStatus?.includes('Red')).length;
  const orangeAlertCount = districts.filter(d => d.metStatus?.includes('Orange')).length;
  const yellowAlertCount = districts.filter(d => d.metStatus?.includes('Yellow')).length;

  return (
    <div className="min-h-screen bg-slate-100 text-black flex flex-col font-sans transition-colors duration-300">
      <header className="w-full bg-white border-b-4 border-slate-900 shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tighter text-black m-0 leading-none">Avadhi</h1>
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mt-1">
                 {t("Kerala Rain Holiday Tracker", "കേരള അവധി ട്രാക്കർ")}
                 {currentDate && <span className="md:ml-3 block md:inline font-extrabold text-slate-800">| {currentDate}</span>}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2 text-sm font-bold w-full md:w-auto">
             <div className="flex gap-2 items-center flex-wrap justify-center">
                <span className="bg-red-700 text-white px-2 py-1 rounded">RED: {redAlertCount}</span>
                <span className="bg-orange-500 text-black px-2 py-1 rounded">ORANGE: {orangeAlertCount}</span>
                <span className="bg-yellow-400 text-black px-2 py-1 rounded">YELLOW: {yellowAlertCount}</span>
                <span className="bg-black text-white px-3 py-1 rounded">{t("HOLIDAYS", "അവധി")}: {holidaysDeclaredCount}</span>
             </div>
             
             <button 
                 onClick={() => setLang(lang === 'en' ? 'ml' : 'en')}
                 className="mt-2 px-6 py-2 rounded bg-slate-900 hover:bg-slate-800 transition-colors border-2 border-black text-xs font-black text-white uppercase tracking-wider"
              >
                 {lang === 'en' ? 'മലയാളം (ML)' : 'ENGLISH (EN)'}
             </button>
          </div>
        </div>
      </header>

      {/* MET STATS AT THE VERY BEGINNING */}
      <div className="w-full bg-slate-900 text-white py-3 px-4 shadow-inner text-center">
         <p className="text-sm font-bold uppercase tracking-widest">
            {t("LIVE MET STATS:", "ലൈവ് കാലാവസ്ഥ നിരീക്ഷണങ്ങൾ:")} {redAlertCount > 0 && `🟥 ${redAlertCount} RED | `} {orangeAlertCount > 0 && `🟧 ${orangeAlertCount} ORANGE | `} {yellowAlertCount > 0 && `🟨 ${yellowAlertCount} YELLOW | `} {holidaysDeclaredCount} DISTRICTS ON HOLIDAY
         </p>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatedGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" preset="blur-slide">
          {districts.map((district) => {
             // STRICT FLAT COLORS BASED ON USER DIAGRAM
             let baseClasses = "relative flex flex-col p-6 shadow-xl transition-all duration-200 border-4 cursor-pointer hover:-translate-y-1 break-words overflow-hidden ";
             
             // Base color determined PURELY by MET STATUS first (No Alert = Green)
             if (district.metStatus?.includes('Red')) {
                baseClasses += "bg-red-700 border-red-900 text-white";
             } else if (district.metStatus?.includes('Orange')) {
                baseClasses += "bg-orange-500 border-orange-700 text-black";
             } else if (district.metStatus?.includes('Yellow')) {
                baseClasses += "bg-yellow-400 border-yellow-600 text-black";
             } else {
                // If it is Green or No Alert (even if Holiday!)
                baseClasses += "bg-lime-500 border-lime-700 text-black";
             }

             // Dim working days slightly to make alerts pop more
             if (!district.isHoliday && district.hasConfiguredFeed) {
                baseClasses += " opacity-80 border-dashed border-2";
             }

             return (
                 <MorphingDialog key={district.code} transition={{ type: 'spring', bounce: 0.05, duration: 0.25 }}>
                   <MorphingDialogTrigger className={baseClasses + " text-left w-full h-full"}>
                     <div className="flex flex-col justify-between h-full">
                        <div>
                           {/* MET STATUS AT THE TOP OF THE BOX */}
                           <div className={`text-[10px] font-black uppercase mb-4 tracking-widest px-3 py-1 inline-block border-2 ${baseClasses.includes('text-white') ? 'border-white' : 'border-black'}`}>
                              {district.metStatus ? translateMet(district.metStatus) : (district.isHoliday ? t('NO ALERTS ISSUED', 'അലർട്ടുകൾ ഇല്ല') : t('NO ALERTS ISSUED', 'അലർട്ടുകൾ ഇല്ല'))}
                           </div>
                           
                           <h2 className="text-3xl font-black tracking-tighter uppercase mb-1">{district.name}</h2>
                           
                           {district.isHoliday ? (
                              <>
                                <div className="font-extrabold text-2xl uppercase mt-4 underline decoration-4 underline-offset-4">
                                   {t("HOLIDAY DECLARED", "അവധി")}
                                </div>
                                {district.holidayDate && (
                                    <div className="mt-2 font-bold text-xs bg-white text-black px-2 py-1 rounded inline-block w-max">
                                      {t("FOR:", "തിയ്യതി:")} {district.holidayDate}
                                    </div>
                                )}
                                <div className="mt-2 font-bold text-sm leading-snug">
                                  {translateScope(district.holidayScope)}
                                </div>
                              </>
                           ) : (
                              <div className="font-bold text-xl uppercase mt-4">{t("WORKING DAY", "പ്രവൃത്തിദിനം")}</div>
                           )}
                        </div>
                        
                        <div className="mt-8">
                           {district.isHoliday && (
                              <div className="text-sm font-bold leading-relaxed mb-4 break-words whitespace-pre-wrap line-clamp-3">
                                 "{district.announcementText}"
                              </div>
                            )}
                           
                           <div className={`pt-3 border-t-4 font-black text-xs uppercase tracking-wider flex justify-between ${baseClasses.includes('text-white') ? 'border-white' : 'border-black'}`}>
                              <span className="max-w-[70%] truncate">{t("SRC", "ഉറവിടം")}: {district.sourceBadge}</span>
                              <span>[+]</span>
                           </div>
                        </div>
                     </div>
                   </MorphingDialogTrigger>
                   
                   <MorphingDialogContainer>
                     <MorphingDialogContent className={`relative p-6 sm:p-8 rounded-xl shadow-2xl max-w-xl w-full mx-4 border-4 overflow-hidden overflow-y-auto max-h-[85vh] ${baseClasses.replace('hover:-translate-y-1 cursor-pointer', '')}`}>
                        <MorphingDialogClose className={`${baseClasses.includes('text-white') ? 'text-white border-white' : 'text-black border-black'} bg-transparent border-2 hover:bg-black/10`} />
                        
                        <div className="flex flex-col justify-between h-full pt-4">
                           {/* EXPANDED CONTENT SHOWN IN POPUP */}
                           <div>
                              <div className={`text-[10px] font-black uppercase mb-4 tracking-widest px-3 py-1 inline-block border-2 ${baseClasses.includes('text-white') ? 'border-white' : 'border-black'}`}>
                                 {district.metStatus ? translateMet(district.metStatus) : (district.isHoliday ? t('NO ALERTS ISSUED', 'അലർട്ടുകൾ ഇല്ല') : t('NO ALERTS ISSUED', 'അലർട്ടുകൾ ഇല്ല'))}
                              </div>
                              <h2 className="text-4xl font-black tracking-tighter uppercase mb-1">{district.name}</h2>
                           </div>
                           
                           {district.isHoliday && (
                               <div className="mt-8">
                                  <div className="font-extrabold text-2xl uppercase mt-4 underline decoration-4 underline-offset-4">
                                     {t("HOLIDAY DECLARED", "അവധി")}
                                  </div>
                                  <div className="my-4 text-lg font-bold leading-relaxed break-words whitespace-pre-wrap">
                                     "{district.announcementText}"
                                  </div>

                                  <div className={`pt-3 border-t-4 font-black text-xs uppercase tracking-wider ${baseClasses.includes('text-white') ? 'border-white' : 'border-black'}`}>
                                     {t("SRC", "ഉറവിടം")}: {district.sourceBadge}
                                  </div>

                                  {district.originalPostUrl && (
                                     <a href={district.originalPostUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className={`inline-block text-center mt-6 w-full text-sm font-black uppercase px-4 py-4 transition-colors border-2 ${baseClasses.includes('text-white') ? 'bg-white text-black hover:bg-gray-200 border-black' : 'bg-black text-white hover:bg-slate-800 border-black'}`}>
                                        {t("VIEW FULL POST", "ഒറിജിനൽ പോസ്റ്റ് കാണുക")}
                                     </a>
                                  )}
                               </div>
                           )}
                        </div>
                     </MorphingDialogContent>
                   </MorphingDialogContainer>
                 </MorphingDialog>
             );
          })}
        </AnimatedGroup>
      </main>
    </div>
  );
}
