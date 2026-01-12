import React, { useState, useEffect, useMemo } from 'react';
import { 
  Fuel, Flame, Gauge, ChevronLeft, ChevronRight, ArrowRight, 
  FileText, Wallet, BarChart3, Copyright, Tag, Printer, CheckCircle2, 
  TrendingDown, Truck, Settings2, Layers, Car, Settings, X, Phone, MapPin, Send
} from 'lucide-react';

const App = () => {
  // --- ГЛОБАЛЬНОЕ СОСТОЯНИЕ НАВИГАЦИИ ---
  const [currentScreen, setCurrentScreen] = useState('MAIN_SELECTION');

  // --- СОСТОЯНИЯ ГРУЗОВОГО ---
  const [truckSubMode, setTruckSubMode] = useState('GAS_DIESEL'); 
  const [systemType, setSystemType] = useState('cng'); 
  const [ggmtDiscount, setGgmtDiscount] = useState(20);
  const [isTruckSettingsOpen, setIsTruckSettingsOpen] = useState(false);
  
  const [truckInputs, setTruckInputs] = useState({
    dieselConsumption: 36, dieselPrice: 75,
    lngCoefficient: 0.86, lngPrice: 45,
    cngCoefficient: 1.2, cngPrice: 28,
    monthlyMileage: 12000, substitutionRate: 60      
  });

  const [remotInputs, setRemotInputs] = useState({
    dieselConsumption: 22, dieselPrice: 75,
    lngCoefficient: 0.86, lngPrice: 45,
    cngCoefficient: 1.2, cngPrice: 28,
    monthlyMileage: 12000
  });

  // --- СОСТОЯНИЯ ЛЕГКОВОГО ---
  const [passInputs, setPassInputs] = useState({
    mileage: 1600,
    fuelNorm: 10,
    priceBenzin: 61.20,
    pricePropane: 32.80,
    priceMethane: 26.50
  });
  const [passCoeffs, setPassCoeffs] = useState({ propane: 1.2, methane: 0.9 });
  const [isPassSettingsOpen, setIsPassSettingsOpen] = useState(false);

  // --- НАВИГАЦИЯ ---
  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ screen: 'MAIN_SELECTION' }, "");
    }
    const handlePopState = (event) => {
      if (event.state && event.state.screen) setCurrentScreen(event.state.screen);
      else setCurrentScreen('MAIN_SELECTION');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (screen, extraState = {}) => {
    setCurrentScreen(screen);
    window.history.pushState({ screen, ...extraState }, "");
  };

  const formatMoney = (num) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(num || 0);
  const getVal = (val) => { const v = parseFloat(val); return isNaN(v) ? 0 : v; };

  // --- РАСЧЕТЫ ГРУЗОВОГО ---
  const truckSummary = useMemo(() => {
    const v = getVal;
    const isRem = truckSubMode === 'REMOT';
    const active = isRem ? remotInputs : truckInputs;
    const gasCoef = systemType === 'lng' ? v(active.lngCoefficient) : v(active.cngCoefficient);
    const gasPrice = systemType === 'lng' ? v(active.lngPrice) : v(active.cngPrice);
    const dCons = v(active.dieselConsumption);
    const dPrice = v(active.dieselPrice);
    const totalM = v(active.monthlyMileage) * 12;

    let qD_res, qG_res, costD, costG;
    if (!isRem) {
      const sub = v(truckInputs.substitutionRate) / 100;
      qD_res = dCons * (1 - sub);
      qG_res = (dCons * sub) * gasCoef;
      costD = (dCons * dPrice) / 100;
      costG = (qD_res * dPrice + qG_res * gasPrice) / 100;
    } else {
      qD_res = dCons;
      qG_res = dCons * gasCoef;
      costD = (dCons * dPrice) / 100;
      costG = (qG_res * gasPrice) / 100;
    }

    const gasPriceDisc = gasPrice * (1 - (v(ggmtDiscount) / 100));
    const costGDisc = isRem ? (qG_res * gasPriceDisc) / 100 : (qD_res * dPrice + qG_res * gasPriceDisc) / 100;

    return {
      totalD: Math.round(totalM * costD), totalG: Math.round(totalM * costG),
      savings: Math.round(totalM * (costD - costG)), savingsDiscounted: Math.round(totalM * (costD - costGDisc)),
      kmD: costD, kmG: costG, qD_base: dCons, qD_result: qD_res.toFixed(1), qG_result: qG_res.toFixed(1),
      monthlySav: Math.round((totalM * (costD - costG)) / 12), monthlySavDiscounted: Math.round((totalM * (costD - costGDisc)) / 12),
      gasCoef: gasCoef
    };
  }, [truckInputs, remotInputs, systemType, truckSubMode, ggmtDiscount]);

  const handleTruckInputChange = (e, isRemot) => {
    const { name, value } = e.target;
    if (isRemot) setRemotInputs(prev => ({ ...prev, [name]: value }));
    else setTruckInputs(prev => ({ ...prev, [name]: value }));
  };

  // --- РАСЧЕТЫ ЛЕГКОВОГО ---
  const currentDate = useMemo(() => new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }), []);

  const passResults = useMemo(() => {
    const v = getVal;
    const { mileage, fuelNorm, priceBenzin, pricePropane, priceMethane } = passInputs;
    
    const kmCostB = (v(fuelNorm) / 100) * v(priceBenzin);
    const kmCostP = (v(fuelNorm) * v(passCoeffs.propane) / 100) * v(pricePropane);
    const kmCostM = (v(fuelNorm) * v(passCoeffs.methane) / 100) * v(priceMethane);

    const costB = (v(mileage) / 100) * v(fuelNorm) * v(priceBenzin);
    const costP = (v(mileage) / 100) * (v(fuelNorm) * v(passCoeffs.propane)) * v(pricePropane);
    const costM = (v(mileage) / 100) * (v(fuelNorm) * v(passCoeffs.methane)) * v(priceMethane);

    const formatKm = (val) => (val || 0).toFixed(2).replace('.', ',');
    return {
      costB: Math.round(costB), costP: Math.round(costP), costM: Math.round(costM),
      kmCostB: formatKm(kmCostB), kmCostP: formatKm(kmCostP), kmCostM: formatKm(kmCostM),
      saveYearP: Math.round((costB - costP) * 12), saveYearM: Math.round((costB - costM) * 12)
    };
  }, [passInputs, passCoeffs]);

  const handlePassInputChange = (e) => {
    setPassInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const AppFooter = ({ showDisclaimer = false }) => (
    <footer className="mt-8 mb-4 flex flex-col items-center text-center gap-1.5 font-sans text-slate-900">
      {showDisclaimer && <p className="text-[10px] text-slate-400 max-w-md mb-2 italic">* Расчет носит справочный характер.</p>}
      <p className="text-slate-900 font-bold text-xs md:text-sm uppercase tracking-tight">Установочный центр «ЭлитГаз»</p>
      <div className="flex items-center gap-1.5 text-slate-600 text-[10px] md:text-xs">
        <MapPin size={12} className="text-slate-400" />
        <span>г. Екатеринбург, ул. Шефская, 3АВ</span>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-0.5 text-slate-800 font-bold text-[10px] md:text-xs">
        <a href="tel:+73432532888" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"><Phone size={12} className="text-blue-500" /> +7 (343) 253-28-88</a>
        <a href="tel:+73433289888" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"><Phone size={12} className="text-blue-500" /> +7 (343) 328-98-88</a>
      </div>
      <a href="https://t.me/Le_luk" target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-[#0088cc] text-white rounded-full text-[10px] md:text-xs font-bold hover:bg-[#0077b3] shadow-sm active:scale-95 transition-all"><Send size={12} fill="white" /> Написать в Telegram</a>
      <p className="text-slate-400 text-[9px] mt-2 uppercase tracking-widest opacity-60 font-medium">© {new Date().getFullYear()}</p>
    </footer>
  );

  const isLngMode = systemType === 'lng';
  const gasNameStr = isLngMode ? 'СПГ' : 'КПГ';
  const gasUnit = isLngMode ? 'кг' : 'м³';
  const truckTheme = {
    text: isLngMode ? 'text-blue-700' : 'text-green-700',
    textDark: isLngMode ? 'text-blue-900' : 'text-green-900',
    bg: isLngMode ? 'bg-blue-50' : 'bg-green-50',
    border: isLngMode ? 'border-blue-200' : 'border-green-200',
    ring: isLngMode ? 'focus:ring-blue-500' : 'focus:ring-green-500',
    button: isLngMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700',
    gradient: isLngMode ? 'from-blue-600 to-blue-800' : 'from-green-600 to-green-800',
  };

  // --- ЭКРАН 1: ГЛАВНЫЙ ЭКРАН ---
  if (currentScreen === 'MAIN_SELECTION') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-2 md:p-4 font-sans text-slate-900 relative overflow-hidden">
        <div className="max-w-xl w-full relative z-10 flex flex-col items-center text-slate-900">
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-red-900/20 shadow-sm flex items-center justify-center mb-4 md:mb-8 w-full">
            <img src="https://raw.githubusercontent.com/Andreyleluk-GAS/PICT/refs/heads/main/logo-start.png" alt="EliteGas" className="h-auto w-full max-h-16 md:max-h-24 object-contain opacity-50 select-none pointer-events-none" onError={(e)=>e.target.style.display='none'} />
          </div>
          <div className="text-center mb-6 md:mb-10 text-slate-900">
            <h1 className="text-2xl md:text-4xl font-extrabold mb-3">Калькулятор Экономии</h1>
            <p className="text-slate-500 text-sm md:text-base font-bold uppercase tracking-widest opacity-70">Рассчитайте выгоду перехода на газ</p>
          </div>
          <div className="grid grid-cols-1 gap-2 md:gap-4 w-full">
            {/* ГРУЗОВОЕ ТС */}
            <button 
              onClick={() => navigateTo('TRUCK_HOME')} 
              className="bg-white/80 backdrop-blur-md p-4 md:p-6 rounded-[2rem] border-2 border-white/50 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row items-center md:gap-6 text-center md:text-left gap-1"
            >
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform shrink-0 mb-1 md:mb-0">
                <Truck size={32} />
              </div>
              <div className="flex flex-col items-center md:items-start overflow-hidden">
                <h3 className="text-xl font-bold text-slate-900 mb-0.5 whitespace-nowrap leading-none">Для грузового ТС</h3>
                <p className="text-slate-500 text-[11px] md:text-xs font-bold uppercase tracking-tighter whitespace-nowrap">Газодизель и Ремоторизация</p>
              </div>
              <ChevronRight className="ml-auto text-slate-300 hidden md:block" />
            </button>

            {/* ЛЕГКОВОЕ ТС */}
            <button 
              onClick={() => navigateTo('PASSENGER_CALC')} 
              className="bg-white/80 backdrop-blur-md p-4 md:p-6 rounded-[2rem] border-2 border-white/50 hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row items-center md:gap-6 text-center md:text-left gap-1"
            >
              <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform shrink-0 mb-1 md:mb-0">
                <Car size={32} />
              </div>
              <div className="flex flex-col items-center md:items-start overflow-hidden">
                <h3 className="text-xl font-bold text-slate-900 mb-0.5 whitespace-nowrap leading-none font-bold">Для легкового ТС</h3>
                <p className="text-slate-500 text-[11px] md:text-xs font-bold uppercase tracking-tighter whitespace-nowrap">ПРОПАН И МЕТАН (ГБО)</p>
              </div>
              <ChevronRight className="ml-auto text-slate-300 hidden md:block" />
            </button>
          </div>
          <AppFooter />
        </div>
      </div>
    );
  }

  // --- ЭКРАН 2: ЛЕГКОВОЙ КАЛЬКУЛЯТОР ---
  if (currentScreen === 'PASSENGER_CALC') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center p-1 md:p-8 font-sans overflow-x-hidden text-slate-900">
        <div className="w-full max-w-lg lg:max-w-4xl flex flex-col gap-1 md:gap-3 text-slate-900">
          <header className="flex flex-col items-center text-center bg-white py-1.5 md:py-6 px-4 rounded-2xl shadow-sm border border-slate-200 w-full relative mt-0.5 md:mt-2 text-slate-900">
            <button onClick={() => window.history.back()} className="hidden md:flex absolute left-2 top-2 md:left-3 md:top-4 items-center gap-1 p-2 text-slate-600">
              <ChevronLeft size={20} />
              <span className="font-bold text-sm">Назад</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-extrabold leading-tight text-slate-900">Топливный калькулятор</h1>
            <div className="flex items-center gap-2 mt-0.5 md:mt-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight">Свердловскстат</span>
                <p className="text-slate-500 text-[10px] font-bold uppercase">Данные на {currentDate}</p>
            </div>
          </header>

          <section className="grid grid-cols-2 gap-1 md:gap-3 w-full text-slate-900">
            <div className="bg-white p-1.5 md:p-4 rounded-xl shadow-sm border border-slate-200">
                <label className="block text-[9px] md:text-[10px] font-bold text-slate-700 uppercase mb-0.5 tracking-tight">Пробег (мес)</label>
                <div className="relative text-slate-900">
                   <input type="number" name="mileage" value={passInputs.mileage} onChange={handlePassInputChange} className="w-full text-base md:text-xl font-bold p-1 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-200" />
                   <span className="absolute right-2 top-1.5 text-[15px] text-slate-400 font-bold">км</span>
                </div>
            </div>
            <div className="bg-white p-1.5 md:p-4 rounded-xl shadow-sm border border-slate-200 text-slate-900">
                <label className="block text-[9px] md:text-[10px] font-bold text-slate-700 uppercase mb-0.5 tracking-tight">Расход бензина</label>
                <div className="relative text-slate-900">
                    <input type="number" name="fuelNorm" value={passInputs.fuelNorm} onChange={handlePassInputChange} className="w-full text-base md:text-xl font-bold p-1 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-200" />
                    <span className="absolute right-2 top-1.5 text-[15px] text-slate-400 font-bold">л/100</span>
                </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 md:gap-3 w-full mb-1.5 md:mb-3 text-slate-900">
            {/* БЕНЗИН */}
            <div className="bg-white rounded-2xl p-2 md:p-5 shadow-sm border-t-4 border-amber-400 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 md:mb-4">
                      <Fuel size={16} className="text-amber-500 md:w-5 md:h-5" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Бензин</h3>
                  </div>
                  <div className="space-y-2 md:space-y-4 text-slate-900">
                      <div className="flex justify-between items-center bg-slate-50 p-1.5 md:p-2 rounded-xl border border-slate-100">
                          <label className="text-[9px] md:text-[10px] font-bold text-amber-700 uppercase">Цена/литр</label>
                          <div className="flex items-baseline gap-1 text-slate-900">
                              <input type="number" name="priceBenzin" value={passInputs.priceBenzin} onChange={handlePassInputChange} className="w-14 bg-transparent text-right font-bold text-lg outline-none" />
                              <span className="text-[10px] font-bold text-amber-400">₽</span>
                          </div>
                      </div>
                      <div className="flex items-end justify-between border-t border-slate-100 pt-2 md:pt-3">
                         <div className="flex flex-col">
                            <p className="text-[9px] md:text-[10px] font-bold text-amber-600 uppercase mb-0.5 leading-none">Затраты / мес</p>
                            <p className="text-2xl md:text-3xl font-black leading-none text-slate-900">{formatMoney(passResults.costB)}</p>
                         </div>
                         <div className="flex flex-col text-right">
                            <p className="text-[9px] md:text-[10px] font-bold text-amber-600 uppercase mb-0.5 leading-none">1 км пробега</p>
                            <p className="text-lg md:text-xl font-bold text-amber-700 leading-none">{passResults.kmCostB} Р/км</p>
                         </div>
                      </div>
                  </div>
                </div>
                <p className="text-[15px] md:text-[15px] font-semibold text-amber-700/60 pt-1.5 border-t border-amber-100 mt-2.5 md:mt-4 text-center italic leading-none">Эталон для сравнения</p>
            </div>

            {/* ПРОПАН */}
            <div className="bg-white rounded-2xl p-2 md:p-5 shadow-sm border-t-4 border-emerald-500 bg-emerald-50/30 flex flex-col justify-between text-slate-900">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 md:mb-4">
                      <Flame size={16} className="text-emerald-500 md:w-5 md:h-5" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">Пропан</h3>
                  </div>
                  <div className="space-y-2 md:space-y-4 text-slate-900">
                      <div className="flex justify-between items-center bg-white p-1.5 md:p-2 rounded-xl border border-emerald-100 text-slate-900">
                          <label className="text-[9px] md:text-[10px] font-bold text-emerald-800 uppercase">Цена/литр</label>
                          <div className="flex items-baseline gap-1">
                              <input type="number" name="pricePropane" value={passInputs.pricePropane} onChange={handlePassInputChange} className="w-14 bg-transparent text-right font-bold text-lg outline-none text-emerald-900" />
                              <span className="text-[10px] font-bold text-emerald-600">₽</span>
                          </div>
                      </div>
                      <div className="flex items-end justify-between border-t border-emerald-100/50 pt-2 md:pt-3 text-slate-900">
                         <div className="flex flex-col text-slate-900">
                            <p className="text-[9px] md:text-[10px] font-bold text-emerald-600 uppercase mb-0.5 leading-none">Затраты / мес</p>
                            <p className="text-2xl md:text-3xl font-black leading-none text-emerald-900">{formatMoney(passResults.costP)}</p>
                         </div>
                         <div className="flex flex-col text-right">
                            <p className="text-[9px] md:text-[10px] font-bold text-emerald-600 uppercase mb-0.5 leading-none">1 км пробега</p>
                            <p className="text-lg md:text-xl font-bold text-emerald-700 leading-none">{passResults.kmCostP} Р/км</p>
                         </div>
                      </div>
                  </div>
                </div>
                <p className="text-[15px] md:text-[15px] font-bold text-emerald-600 pt-1.5 border-t border-emerald-200 mt-2.5 md:mt-4 text-center tracking-tight leading-none">Экономия в год: +{formatMoney(passResults.saveYearP)}</p>
            </div>

            {/* МЕТАН */}
            <div className="bg-white rounded-2xl p-2 md:p-5 shadow-sm border-t-4 border-blue-500 bg-blue-50/30 flex flex-col justify-between text-slate-900 text-slate-900 text-slate-900">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 md:mb-4">
                      <Gauge size={16} className="text-blue-500 md:w-5 md:h-5" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">Метан</h3>
                  </div>
                  <div className="space-y-2 md:space-y-4 text-slate-900 text-slate-900">
                      <div className="flex justify-between items-center bg-white p-1.5 md:p-2 rounded-xl border border-blue-100 text-slate-900">
                          <label className="text-[9px] md:text-[10px] font-bold text-blue-800 uppercase">Цена / м³</label>
                          <div className="flex items-baseline gap-1 text-slate-900">
                               <input type="number" name="priceMethane" value={passInputs.priceMethane} onChange={handlePassInputChange} className="w-14 bg-transparent text-right font-bold text-base md:text-lg outline-none text-blue-900" />
                               <span className="text-[10px] font-bold text-blue-600 text-slate-900">₽</span>
                          </div>
                      </div>
                      <div className="flex items-end justify-between border-t border-blue-100/50 pt-2 md:pt-3 text-slate-900">
                         <div className="flex flex-col text-slate-900">
                            <p className="text-[9px] md:text-[10px] font-bold text-blue-600 uppercase mb-0.5 leading-none">Затраты / мес</p>
                            <p className="text-2xl md:text-3xl font-black leading-none text-blue-900">{formatMoney(passResults.costM)}</p>
                         </div>
                         <div className="flex flex-col text-right">
                            <p className="text-[9px] md:text-[10px] font-bold text-blue-600 uppercase mb-0.5 leading-none">1 км пробега</p>
                            <p className="text-lg md:text-xl font-bold text-blue-700 leading-none">{passResults.kmCostM} Р/км</p>
                         </div>
                      </div>
                  </div>
                </div>
                <p className="text-[15px] md:text-[15px] font-bold text-blue-600 pt-1.5 border-t border-blue-200 mt-2.5 md:mt-4 text-center tracking-tight leading-none text-blue-600">Экономия в год: +{formatMoney(passResults.saveYearM)}</p>
            </div>
          </div>

          <div className="mt-auto text-slate-900 text-slate-900 text-slate-900">
            <div className="flex items-center justify-center gap-2 text-[10px] md:text-[11px] text-slate-900 font-bold bg-white px-4 py-2 rounded-full border shadow-sm mx-auto w-fit mb-4 text-slate-900">
                <p>Коэф.: Пропан ×{passCoeffs.propane}, Метан ×{passCoeffs.methane}</p>
                <button onClick={() => setIsPassSettingsOpen(true)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-900 transition-colors"><Settings size={14} /></button>
            </div>
            <AppFooter />
          </div>
        </div>

        {/* MODAL SETTINGS PASSENGER */}
        {isPassSettingsOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-slate-900">
            <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl relative text-slate-900 text-slate-900">
               <button onClick={() => setIsPassSettingsOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"><X size={20}/></button>
              <h2 className="text-xl font-bold mb-6 text-slate-900">Настройки ГБО</h2>
              <div className="space-y-4 text-slate-900 text-slate-900">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Коэффициент Пропан</label>
                  <input type="number" step="0.1" value={passCoeffs.propane} onChange={(e)=>setPassCoeffs({...passCoeffs, propane: parseFloat(e.target.value)||0})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Коэффициент Метан</label>
                  <input type="number" step="0.1" value={passCoeffs.methane} onChange={(e)=>setPassCoeffs({...passCoeffs, methane: parseFloat(e.target.value)||0})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" />
                </div>
                <button onClick={()=>setIsPassSettingsOpen(false)} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-4 shadow-lg uppercase tracking-wider text-xs active:scale-95 transition-all text-white">Сохранить</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- ЭКРАНЫ ГРУЗОВОГО ---
  if (currentScreen === 'TRUCK_HOME') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900 text-slate-900 text-slate-900">
        <div className="max-w-4xl w-full text-slate-900 text-slate-900 flex flex-col min-h-[80vh] md:justify-center">
          <button onClick={() => window.history.back()} className="hidden md:flex items-center gap-1 mb-6 text-slate-900 font-bold text-sm hover:opacity-70 text-slate-900"><ChevronLeft size={20} /> Назад</button>
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-4xl font-extrabold mb-2 text-slate-900">Грузовой транспорт</h1>
            <p className="text-slate-600 font-medium uppercase tracking-tight font-bold text-slate-900">Выберите технологию переоборудования</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-slate-900 text-slate-900">
            <div onClick={() => { setTruckSubMode('GAS_DIESEL'); navigateTo('TRUCK_INPUTS'); }} className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 hover:border-blue-500 cursor-pointer shadow-sm transition-all group">
              <div className="p-3 bg-blue-50 rounded-2xl w-fit mb-4 text-blue-600 group-hover:scale-105 transition-transform shrink-0"><Settings2 size={32} /></div>
              <h3 className="text-xl font-bold mb-1 text-slate-900">Газодизельный режим</h3>
              <p className="text-slate-500 text-sm text-slate-500">Частичное замещение ДТ метаном</p>
            </div>
            <div onClick={() => { setTruckSubMode('REMOT'); navigateTo('TRUCK_INPUTS'); }} className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 hover:border-amber-400 cursor-pointer shadow-sm transition-all group text-slate-900">
              <div className="p-3 bg-amber-50 rounded-2xl w-fit mb-4 text-amber-500 group-hover:scale-105 transition-transform shrink-0"><Truck size={32} /></div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900 text-slate-900 tracking-tight">Ремоторизация ТС</h3>
              <p className="text-slate-500 text-sm text-slate-600">Полная замена двигателя на газовый</p>
            </div>
          </div>
          <div className="md:mt-4 text-slate-900">
            <div className="flex items-center justify-center gap-2 text-[10px] md:text-[11px] text-slate-900 font-bold bg-white px-4 py-2 rounded-full border shadow-sm mx-auto w-fit mb-4 text-slate-900">
                <p>Скидка ГГМТ: {ggmtDiscount}%</p>
                <button onClick={() => setIsTruckSettingsOpen(true)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-900 transition-colors"><Settings size={14} /></button>
            </div>
            <AppFooter />
          </div>
        </div>

        {/* MODAL SETTINGS TRUCK */}
        {isTruckSettingsOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-slate-900">
            <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl relative text-slate-900">
               <button onClick={() => setIsTruckSettingsOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"><X size={20}/></button>
              <h2 className="text-xl font-bold mb-6 text-slate-900">% скидки на КПГ</h2>
              <div className="space-y-4 text-slate-900">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Скидка ГГМТ (%)</label>
                  <input type="number" value={ggmtDiscount} onChange={(e)=>setGgmtDiscount(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" />
                </div>
                <button onClick={()=>setIsTruckSettingsOpen(false)} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-4 shadow-lg uppercase tracking-wider text-xs active:scale-95 transition-all text-white">Сохранить</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentScreen === 'TRUCK_INPUTS') {
    const isRem = truckSubMode === 'REMOT';
    const activeInp = isRem ? remotInputs : truckInputs;
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col p-2 font-sans text-slate-900 text-slate-900">
        <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full text-slate-900">
          <button onClick={() => window.history.back()} className="hidden md:flex items-center gap-1 mb-4 self-start text-slate-900 font-bold text-xs text-slate-900 text-slate-900"><ChevronLeft size={18} /> Назад</button>
          <h1 className="text-xl font-bold mb-6 text-center uppercase tracking-tight font-sans text-slate-900 text-slate-900">{isRem ? 'Ремоторизация ТС' : 'Газодизель ТС'}</h1>
          <div className="bg-white rounded-[2rem] shadow-xl p-5 w-full border border-slate-200">
            <div className="space-y-4 text-slate-900">
              <div className="grid grid-cols-2 gap-2 text-slate-900 text-slate-900">
                <button onClick={() => setSystemType('cng')} className={`py-3 rounded-2xl text-xs font-bold border-2 transition-all uppercase ${systemType === 'cng' ? 'border-green-500 bg-green-50 text-green-800 shadow-sm' : 'border-slate-100 text-slate-500'}`}>КПГ (Метан)</button>
                <button onClick={() => setSystemType('lng')} className={`py-3 rounded-2xl text-xs font-bold border-2 transition-all uppercase ${systemType === 'lng' ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm' : 'border-slate-100 text-slate-500'}`}>СПГ (Метан)</button>
              </div>
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-slate-900 text-slate-900">
                <div className="flex items-center gap-2 mb-3 text-red-900 font-bold uppercase text-[10px] font-bold text-red-900 text-red-900"><Fuel size={14} /> Дизельное топливо</div>
                <div className="grid grid-cols-2 gap-4 text-slate-900 text-slate-900">
                  <div><label className="block text-[10px] font-bold text-red-900/70 mb-1 uppercase tracking-tighter font-sans text-slate-900 text-slate-900">Расход (л/100 км)</label><input type="number" name="dieselConsumption" value={activeInp.dieselConsumption} onChange={(e) => handleTruckInputChange(e, isRem)} className="w-full p-2 bg-white border border-red-100 rounded-lg font-bold text-sm outline-none shadow-inner text-slate-900 text-slate-900" /></div>
                  <div><label className="block text-[10px] font-bold text-red-900/70 mb-1 uppercase tracking-tighter font-sans text-slate-900 text-slate-900">Цена (₽/л)</label><input type="number" name="dieselPrice" value={activeInp.dieselPrice} onChange={(e) => handleTruckInputChange(e, isRem)} className="w-full p-2 bg-white border border-red-100 rounded-lg font-bold text-sm outline-none shadow-inner text-slate-900 text-slate-900" /></div>
                </div>
              </div>
              <div className={`p-4 rounded-2xl border ${truckTheme.bg} ${truckTheme.border} text-slate-900`}>
                <div className={`flex items-center gap-2 mb-3 ${truckTheme.textDark} font-bold uppercase text-[10px] text-slate-900`}><Gauge size={14} /> Параметры газа</div>
                <div className="grid grid-cols-2 gap-4 text-slate-900 text-slate-900">
                  <div><label className={`block text-[10px] font-bold ${truckTheme.textDark} opacity-60 mb-1 uppercase text-slate-900 text-slate-900`}>Цена (₽/{gasUnit})</label><input type="number" name={isLngMode ? 'lngPrice' : 'cngPrice'} value={isLngMode ? activeInp.lngPrice : activeInp.cngPrice} onChange={(e) => handleTruckInputChange(e, isRem)} className={`w-full p-2 bg-white border rounded-lg font-bold text-sm outline-none focus:ring-2 ${truckTheme.ring} text-slate-900`} /></div>
                  <div><label className={`block text-[10px] font-bold ${truckTheme.textDark} opacity-60 mb-1 uppercase text-slate-900`}>Коэф. расхода</label><input type="number" step="0.01" name={isLngMode ? 'lngCoefficient' : 'cngCoefficient'} value={isLngMode ? activeInp.lngCoefficient : activeInp.cngCoefficient} onChange={(e) => handleTruckInputChange(e, isRem)} className={`w-full p-2 bg-white border rounded-lg font-bold text-sm outline-none focus:ring-2 ${truckTheme.ring} text-slate-900`} /></div>
                </div>
              </div>
              
              <div className={`grid ${!isRem ? 'grid-cols-2' : 'grid-cols-1'} gap-3 text-slate-900 text-slate-900`}>
                <div>
                  <label className="block text-[10px] font-bold text-slate-800 uppercase mb-1 tracking-tight font-sans text-slate-900 text-slate-900">Пробег (км/мес)</label>
                  <input type="number" name="monthlyMileage" value={activeInp.monthlyMileage} onChange={(e) => handleTruckInputChange(e, isRem)} className="w-full p-3 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 text-slate-900" />
                </div>
                {!isRem && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-800 uppercase mb-1 tracking-tight font-sans text-slate-900 text-slate-900">% замещения ДТ</label>
                    <input type="number" name="substitutionRate" value={truckInputs.substitutionRate} onChange={(e) => handleTruckInputChange(e, false)} className="w-full p-3 border border-slate-300 rounded-xl font-bold text-sm text-blue-700" />
                  </div>
                )}
              </div>
              <button onClick={() => navigateTo('TRUCK_REPORT')} className={`w-full py-4 rounded-2xl text-white text-sm md:text-base font-bold shadow-lg transition-all uppercase tracking-wider active:scale-95 ${truckTheme.button}`}>Показать отчет</button>
            </div>
            <AppFooter />
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'TRUCK_REPORT') {
    return (
      <div className="min-h-screen bg-slate-50 p-1.5 md:p-8 font-sans text-slate-900 overflow-x-hidden text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900">
        <div className="max-w-6xl mx-auto text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900">
          <header className="mb-2 md:mb-4 flex items-center justify-between print-hidden text-slate-900 text-slate-900">
            <button onClick={() => window.history.back()} className="hidden md:flex items-center gap-1 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-sm font-sans text-slate-900">
                <ChevronLeft size={14} />
                <span>Назад</span>
            </button>
            <button onClick={() => window.print()} className="hidden md:flex items-center gap-2 px-5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 shadow-sm font-sans text-slate-900 text-slate-900"><Printer size={16} /> Печать</button>
          </header>

          <div className="bg-white p-3 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-200 relative overflow-hidden text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900">
            <div className="relative z-10 text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900">
              <div className="mb-3 md:mb-8 text-center border-b border-slate-100 pb-2 md:pb-6 font-sans text-slate-900 text-slate-900 text-slate-900 text-slate-900">
                <h1 className="text-sm md:text-2xl font-bold uppercase tracking-tight leading-tight text-slate-900 text-slate-900 text-slate-900 text-slate-900">
                  {truckSubMode === 'REMOT' ? (
                      `Отчет: Ремоторизация (100% ${gasNameStr})`
                  ) : (
                      `Отчет: Газодизель (ДТ ${100 - truckInputs.substitutionRate}% + ${gasNameStr} ${truckInputs.substitutionRate}%)`
                  )}
                </h1>
                <p className="text-[8px] md:text-xs text-slate-700 mt-1 font-semibold uppercase text-slate-900 text-slate-900">Период расчета: 12 месяцев</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-1.5 md:gap-3 mb-3 md:mb-8 font-bold text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900">
                <div className="p-2 md:p-3 bg-slate-50 rounded-xl border border-slate-200 font-sans text-slate-900 text-slate-900 text-slate-900">
                  <div className="text-slate-700 text-[8px] md:text-[10px] uppercase mb-0.5 md:mb-1 font-bold text-slate-900 text-slate-900 text-slate-900 text-slate-900">ПРОБЕГ КМ/МЕС</div>
                  <div className="font-bold text-[10px] md:text-base text-slate-900 text-slate-900 text-slate-900">{(truckSubMode === 'REMOT' ? remotInputs.monthlyMileage : truckInputs.monthlyMileage).toLocaleString()}</div>
                </div>
                <div className="p-2 md:p-3 bg-slate-50 rounded-xl border border-slate-200 font-sans text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900">
                  <div className="text-slate-700 text-[8px] md:text-[10px] uppercase mb-0.5 md:mb-1 font-bold text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900">РАСХОД ДТ на 100 КМ</div>
                  <div className="font-bold text-[10px] md:text-base text-slate-900 text-slate-900 text-slate-900 text-slate-900">{truckSummary.qD_base}</div>
                </div>
                <div className="p-2 md:p-3 bg-slate-50 rounded-xl border border-slate-200 font-sans text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900"><div className="text-slate-700 text-[8px] md:text-[10px] uppercase mb-0.5 md:mb-1 font-bold text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900">Цена ДТ</div><div className="font-bold text-[10px] md:text-base text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900">{truckSubMode === 'REMOT' ? remotInputs.dieselPrice : truckInputs.dieselPrice} ₽</div></div>
                <div className={`p-2 md:p-3 rounded-xl border ${truckTheme.border} ${truckTheme.bg} font-sans text-slate-900 text-slate-900 text-slate-900 text-slate-900`}><div className={`${truckTheme.textDark} text-[8px] md:text-[10px] uppercase mb-0.5 md:mb-1 font-bold text-slate-900 text-slate-900 text-slate-900 text-slate-900`}>Цена {gasNameStr}</div><div className={`font-bold ${truckTheme.textDark} text-[10px] md:text-base`}>{isLngMode ? (truckSubMode === 'REMOT' ? remotInputs.lngPrice : truckInputs.lngPrice) : (truckSubMode === 'REMOT' ? remotInputs.cngPrice : truckInputs.cngPrice)} ₽</div></div>
                <div className="hidden md:block p-2 md:p-3 bg-slate-50 rounded-xl border border-slate-200 font-sans text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900"><div className="text-slate-700 text-[8px] md:text-[10px] uppercase mb-0.5 md:mb-1 font-bold tracking-tight text-slate-900 text-slate-900 text-slate-900">Коэф. расхода</div><div className="font-bold text-[10px] md:text-base text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900">{truckSummary.gasCoef}</div></div>
              </div>
              <div className={`grid grid-cols-1 ${systemType === 'cng' ? 'md:grid-cols-2' : ''} gap-2 md:gap-6 mb-3 md:mb-8 font-sans text-slate-900`}>
                <div className={`bg-gradient-to-br ${truckTheme.gradient} text-white p-4 md:p-8 rounded-2xl shadow-xl flex flex-row justify-between relative overflow-hidden font-sans text-white text-white`}>
                  <div className="relative z-10 flex flex-col justify-between w-2/3 md:w-3/4 text-white text-white mt-2">
                    <div><div className="text-[9px] md:text-xs font-bold uppercase tracking-wider opacity-90 font-sans text-white text-white mb-0.5 md:mb-1 flex items-center gap-1">Экономия (Базовый)</div><div className="text-xl md:text-5xl font-bold mb-2 md:mb-4 leading-tight font-sans text-white text-white text-white">{formatMoney(truckSummary.savings)}</div></div>
                    <div className="flex gap-2 md:gap-3 flex-wrap text-white text-white"><div className="bg-white/20 px-2 py-0.5 md:px-3 md:py-1.5 rounded-lg text-[8px] md:text-[10px] font-bold uppercase text-white">{formatMoney(truckSummary.monthlySav)} / мес</div><div className="bg-white/20 px-2 py-0.5 md:px-3 md:py-1.5 rounded-lg text-[8px] md:text-[10px] font-bold uppercase font-sans text-white text-white text-white">- {Math.round((truckSummary.savings / (truckSummary.totalD || 1)) * 100)}% затрат</div></div>
                  </div>
                  <div className="absolute right-[10px] top-[10px] bottom-[10px] flex items-center justify-end w-2/5 md:w-1/3 select-none opacity-30 text-white text-white">
                    <img src="/logo.png" alt="Logo" className="h-full w-auto object-contain object-right opacity-30 text-white text-white text-white" onError={(e)=>{e.target.style.display='none'}} />
                  </div>
                </div>
                {systemType === 'cng' && (
                  <div className="bg-white border-2 border-blue-100 p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-lg flex flex-col justify-between relative overflow-hidden text-slate-900 font-sans text-slate-900 text-slate-900 text-slate-900">
                    <div className="absolute top-0 right-0 p-1.5 md:p-3 bg-blue-700 text-white rounded-bl-xl md:rounded-bl-3xl font-bold text-[8px] md:text-[10px] uppercase z-20 font-sans text-white text-white">Программа ГГМТ</div>
                    <div className="relative z-10 w-2/3 md:w-3/4 mt-2 font-bold text-slate-900 text-slate-900">
                        <div><div className="text-[9px] md:text-xs font-bold text-slate-700 mb-0.5 md:mb-1 flex items-center gap-1 uppercase tracking-wider font-sans text-slate-900 text-slate-900"><Tag size={10} className="text-blue-600 font-sans text-blue-600 text-blue-600 text-blue-600" /> Со скидкой на метан 20%</div><div className="text-xl md:text-5xl font-bold text-blue-900 mb-2 md:mb-4 leading-tight text-blue-900 text-blue-900">{formatMoney(truckSummary.savingsDiscounted)}</div></div>
                        <div className="flex gap-2 md:gap-3 flex-wrap text-slate-900 text-slate-900"><div className="bg-blue-50 text-blue-900 px-2 py-0.5 md:px-3 md:py-1.5 rounded-lg text-[8px] md:text-[10px] font-bold border border-blue-200 uppercase font-sans text-blue-900 text-blue-900">{formatMoney(truckSummary.monthlySavDiscounted)} / мес</div><div className="bg-blue-50 text-blue-900 px-2 py-0.5 md:px-3 md:py-1.5 rounded-lg text-[8px] md:text-[10px] font-bold border border-blue-200 uppercase font-sans text-blue-900 text-blue-900 text-blue-900">- {Math.round((truckSummary.savingsDiscounted / (truckSummary.totalD || 1)) * 100)}% затрат</div></div>
                    </div>
                    <div className="absolute right-[10px] bottom-[10px] flex items-end justify-end max-h-[35%] w-[28%] select-none opacity-40 text-slate-900 text-slate-900">
                        <img src="/logoGGMT.png" alt="GGMT" className="h-auto max-h-full w-auto object-contain object-right-bottom" onError={(e)=>{e.target.style.display='none'}} />
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mb-3 md:mb-8 font-sans font-bold text-slate-900 text-slate-900">
                <div className="border border-red-200 rounded-xl md:rounded-[2rem] p-3 md:p-6 bg-red-50/30 text-slate-900 text-slate-900 text-slate-900">
                  <div className="text-red-900 font-bold text-[10px] md:text-xs uppercase mb-2 md:mb-4 flex items-center gap-2 font-sans text-red-900 text-red-900"><Fuel size={12}/> На дизеле (100%)</div>
                  <div className="space-y-1.5 md:space-y-3 text-slate-900 text-slate-900">
                    <div className="flex justify-between text-[10px] md:text-sm font-bold opacity-80 text-slate-900 text-slate-900"><span>Расход на 100 км:</span><span>{truckSummary.qD_base} л ДТ</span></div>
                    <div className="flex justify-between text-[10px] md:text-sm font-bold opacity-80 text-slate-900 text-slate-900"><span>Стоимость 1 км:</span><span>{truckSummary.kmD?.toFixed(2)} ₽</span></div>
                    <div className="border-t border-red-200 pt-2 md:pt-3 flex justify-between font-bold text-red-700 text-sm md:text-2xl leading-none text-red-700 text-red-700">
                      <span className="text-[8px] md:text-xs uppercase self-center font-bold text-red-600 tracking-tighter text-red-600 text-red-600">ИТОГО ЗА ГОД:</span>
                      <span className="font-black text-red-800 text-red-800 text-red-800">{formatMoney(truckSummary.totalD)}</span>
                    </div>
                  </div>
                </div>
                <div className={`border ${truckTheme.border} rounded-xl md:rounded-[2rem] p-3 md:p-6 ${truckTheme.bg}/30 text-slate-900 text-slate-900`}>
                  <div className={`${truckTheme.textDark} font-bold text-[10px] md:text-xs uppercase mb-2 md:mb-4 flex items-center gap-2 font-sans text-slate-900 text-slate-900`}>{isLngMode?<Flame size={12}/>:<Gauge size={12}/>} {truckSubMode === 'REMOT' ? `На газе (${gasNameStr} 100%)` : `Газодизель (${truckInputs.substitutionRate}% замещения)`}</div>
                  <div className="space-y-1.5 md:space-y-3 font-bold text-slate-900 text-slate-900">
                    <div className="flex justify-between text-[10px] md:text-sm opacity-80 text-slate-900 text-slate-900"><span>Расход на 100 км:</span><span>{truckSubMode === 'REMOT' ? `${truckSummary.qG_result} ${gasUnit} ${gasNameStr}` : `${truckSummary.qD_result} л ДТ + ${truckSummary.qG_result} ${gasUnit} ${gasNameStr}`}</span></div>
                    <div className="flex justify-between text-[10px] md:text-sm opacity-80 text-slate-900 text-slate-900"><span>Стоимость 1 км:</span><span>{truckSummary.kmG?.toFixed(2)} ₽</span></div>
                    <div className={`border-t ${truckTheme.border} pt-2 md:pt-3 flex justify-between font-bold ${truckTheme.textDark} text-sm md:text-2xl leading-none text-slate-900 text-slate-900`}>
                      <span className="text-[8px] md:text-xs uppercase self-center font-bold tracking-tighter text-slate-900 text-slate-900">ИТОГО ЗА ГОД:</span>
                      <span className="font-black text-slate-900 text-slate-900">{formatMoney(truckSummary.totalG)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-100 p-3 md:p-6 rounded-xl md:rounded-[2.5rem] border border-slate-200 font-bold text-slate-900 text-slate-900">
                <h4 className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase mb-2 md:mb-6 flex items-center gap-2 tracking-widest font-sans text-slate-500 text-slate-500"><BarChart3 size={12}/> Структура затрат</h4>
                <div className="h-6 md:h-10 w-full bg-slate-300 rounded-lg md:rounded-2xl overflow-hidden flex shadow-inner text-slate-900">
                  {truckSubMode === 'REMOT' ? (<div className={`${truckTheme.button} h-full w-full text-slate-900`}></div>) : (
                    <>
                      <div className="bg-red-600 h-full transition-all duration-1000 text-slate-900" style={{ width: `${(100 - truckInputs.substitutionRate)}%` }}></div>
                      <div className={`${truckTheme.button} h-full transition-all duration-1000 text-slate-900`} style={{ width: `${truckInputs.substitutionRate}%` }}></div>
                    </>
                  )}
                </div>
                <div className="flex justify-between mt-2 text-[10px] md:text-[15px] font-bold uppercase tracking-tight text-slate-900 text-slate-900 text-slate-900 text-slate-900">
                  {truckSubMode === 'REMOT' ? (<span className={`${truckTheme.textDark} font-bold text-slate-900 text-slate-900`}>100% {gasNameStr} Метан</span>) : (
                    <><span className="text-red-700 font-bold text-red-700">ДИЗЕЛЬ: {formatMoney(truckSummary.totalG * (1 - truckInputs.substitutionRate/100))}</span><span className={`${truckTheme.textDark} font-bold text-slate-900`}>{gasNameStr}: {formatMoney(truckSummary.totalG * (truckInputs.substitutionRate/100))}</span></>
                  )}
                </div>
              </div>
              <AppFooter showDisclaimer />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default App;
